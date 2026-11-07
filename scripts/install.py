#!/usr/bin/env python3
"""First installation: run with sudo, archive and its SHA-256 as arguments."""
import datetime, hashlib, json, os, pathlib, re, shutil, subprocess, sys, tarfile, tempfile
if os.geteuid()!=0: raise SystemExit('Run with sudo.')
a=pathlib.Path(sys.argv[1]); expected=sys.argv[2]
if hashlib.sha256(a.read_bytes()).hexdigest()!=expected: raise SystemExit('Archive checksum mismatch')
config=pathlib.Path('/etc/caddy/Caddyfile'); old=config.read_text()
link=pathlib.Path('/var/www/thuispizza')
if 'thuispizza.nl' in old or link.exists() or link.is_symlink(): raise SystemExit('Site already exists; use release.py deploy for updates.')
with tempfile.TemporaryDirectory() as tmp:
 stage=pathlib.Path(tmp)
 with tarfile.open(a) as t:
  members=t.getmembers(); names=[m.name for m in members]
  if len(names)!=len(set(names)) or any(not m.isfile() or not re.fullmatch(r'[A-Za-z0-9-]+\.(html|css|js|svg|txt|xml|json)',m.name) for m in members): raise SystemExit('Invalid archive')
  t.extractall(stage,filter='data')
 manifest=json.loads((stage/'deployment.json').read_text()); commit=manifest['commit']
 if manifest['site']!='thuispizza.nl' or not re.fullmatch('[0-9a-f]{40}',commit): raise SystemExit('Invalid manifest')
 if set(names)!=set(manifest['files'])|{'deployment.json'} or 'index.html' not in names: raise SystemExit('Invalid file list')
 for name,digest in manifest['files'].items():
  if hashlib.sha256((stage/name).read_bytes()).hexdigest()!=digest: raise SystemExit('Asset checksum mismatch')
 release=pathlib.Path('/var/www/thuispizza-releases')/commit
 if release.exists(): raise SystemExit('Release already exists')
 release.mkdir(parents=True,mode=0o755)
 for f in stage.iterdir():
  shutil.copyfile(f,release/f.name); (release/f.name).chmod(0o644)
block='\nthuispizza.nl {\n root * /var/www/thuispizza\n encode zstd gzip\n file_server\n}\n\nwww.thuispizza.nl {\n redir https://thuispizza.nl{uri} permanent\n}\n'
candidate=config.with_name('thuispizza-candidate'); candidate.write_text(old+block)
subprocess.run(['caddy','validate','--config',str(candidate),'--adapter','caddyfile'],check=True)
backup=config.with_name('Caddyfile.before-thuispizza-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
shutil.copy2(config,backup); link.symlink_to(release)
try:
 os.replace(candidate,config)
 subprocess.run(['systemctl','reload','caddy'],check=True)
except BaseException:
 shutil.copy2(backup,config); subprocess.run(['systemctl','reload','caddy']); link.unlink(); raise
print('THUISPIZZA_INSTALLED',commit)
