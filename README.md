# thuispizza.nl

Static Dutch pizza website. Six guides, equipment selection guide and local dough calculator. Illustrations are not cooking photographs; original photography and documented equipment tests are pending.

## Hosting
Same VPS as energie-besparen.eu: `jwestra@149.210.159.117`, Caddy HTTPS, www redirect, root `/var/www/thuispizza` symlink to `/var/www/thuispizza-releases/<commit>`. Older releases are retained. Git pushes do not deploy automatically.

Build a committed release with `python3 scripts/release.py build /tmp/thuispizza.tar.gz`. Upload it with scripts/install.py (first installation) or scripts/release.py (updates). Run the installer with sudo, archive path and its printed SHA-256. It validates all hashes, backs up and validates Caddy, and restores the previous configuration on reload failure.

GA4 web stream 16292508367; measurement ID G-KJ7HDK0P9M. Explicit analytics consent, 180-day choice expiry, withdrawal, no calculator values or URL queries sent. Enhanced measurement disabled. No advertising scripts or merchant links active. ads.txt retains the project publisher; AdSense review is separate.

DNS change is deferred until first VPS installation so traffic does not switch to an unconfigured host. Preserve mail and FTP on their existing host when updating the apex record. Search Console verification and sitemap submission follow DNS activation.
