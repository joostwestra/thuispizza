#!/usr/bin/env python3
"""Build from a committed tree; install an archive with sudo on the existing VPS."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile
import tempfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def valid(name):
    return bool(re.fullmatch(r'[A-Za-z0-9-]+\.(html|css|js|svg|txt|xml)', name))


def build(destination):
    root = Path(__file__).resolve().parent.parent
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    names = subprocess.check_output(['git', 'ls-tree', '--name-only', commit], cwd=root, text=True).splitlines()
    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp)
        files = {}
        for name in names:
            if not valid(name):
                continue
            data = subprocess.check_output(['git', 'show', f'{commit}:{name}'], cwd=root)
            (stage / name).write_bytes(data)
            files[name] = sha(data)
        (stage / 'deployment.json').write_text(json.dumps({'site': 'thuispizza.nl', 'commit': commit, 'files': files}, indent=2))
        with tarfile.open(destination, 'w:gz') as archive:
            for file in sorted(stage.iterdir()):
                archive.add(file, arcname=file.name)
    print(commit)
    print(sha(Path(destination).read_bytes()))


def deploy(filename, checksum):
    if os.geteuid() != 0:
        raise SystemExit('Voer deploy uit met sudo.')
    archive_path = Path(filename)
    if sha(archive_path.read_bytes()) != checksum:
        raise SystemExit('Archiefchecksum klopt niet.')
    releases = Path('/var/www/thuispizza-releases')
    target = Path('/var/www/thuispizza')
    if not target.is_symlink():
        raise SystemExit('Verwachte documentroot-symlink ontbreekt.')
    previous = os.readlink(target)
    with tempfile.TemporaryDirectory(prefix='pizza-stage-') as tmp:
        stage = Path(tmp)
        with tarfile.open(archive_path) as archive:
            members = archive.getmembers()
            names = [m.name for m in members]
            if len(names) != len(set(names)):
                raise SystemExit('Dubbele bestanden in archief.')
            if any(not m.isfile() or not (valid(m.name) or m.name == 'deployment.json') for m in members):
                raise SystemExit('Onverwachte archiefinhoud.')
            archive.extractall(stage, filter='data')
        manifest = json.loads((stage / 'deployment.json').read_text())
        commit = manifest.get('commit', '')
        if manifest.get('site') != 'thuispizza.nl' or not re.fullmatch('[0-9a-f]{40}', commit):
            raise SystemExit('Ongeldig manifest.')
        expected = manifest['files']
        if set(names) != set(expected) | {'deployment.json'} or 'index.html' not in expected:
            raise SystemExit('Bestandslijst klopt niet.')
        for name, checksum in expected.items():
            if sha((stage / name).read_bytes()) != checksum:
                raise SystemExit('Bestandschecksum klopt niet: ' + name)
        release = releases / commit
        if release.exists():
            raise SystemExit('Release bestaat al; controleer de bestaande versie.')
        release.mkdir(mode=0o755)
        for file in stage.iterdir():
            (release / file.name).write_bytes(file.read_bytes())
            (release / file.name).chmod(0o644)
    temporary_link = target.with_name('thuispizza-next-' + commit[:12])
    temporary_link.symlink_to(release)
    os.replace(temporary_link, target)
    print('THUISPIZZA_DEPLOYED', commit)
    print('Vorige release:', previous)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == 'build':
        build(sys.argv[2])
    elif len(sys.argv) == 4 and sys.argv[1] == 'deploy':
        deploy(sys.argv[2], sys.argv[3])
    else:
        raise SystemExit('Gebruik: release.py build ARCHIEF | release.py deploy ARCHIEF SHA256')
