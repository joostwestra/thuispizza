# thuispizza.nl

Static Dutch pizza website. Six guides, equipment selection guide and local dough calculator. Illustrations are not cooking photographs; original photography and documented equipment tests are pending.

## Hosting
Same VPS as energie-besparen.eu: `jwestra@149.210.159.117`, Caddy HTTPS, www redirect, root `/var/www/thuispizza` symlink to `/var/www/thuispizza-releases/<commit>`. Older releases are retained. Git pushes do not deploy automatically.

Build a committed release with `python3 scripts/release.py build /tmp/thuispizza.tar.gz`. Upload it with scripts/install.py (first installation) or scripts/release.py (updates). Run the installer with sudo, archive path and its printed SHA-256. It validates all hashes, backs up and validates Caddy, and restores the previous configuration on reload failure.

GA4 web stream 16292508367; measurement ID G-KJ7HDK0P9M. Explicit analytics consent, 180-day choice expiry, withdrawal, no calculator values or URL queries sent. Enhanced measurement disabled. No advertising scripts or merchant links active. ads.txt retains the project publisher; AdSense review is separate.

DNS change is deferred until first VPS installation so traffic does not switch to an unconfigured host. Preserve mail and FTP on their existing host when updating the apex record. Search Console verification and sitemap submission follow DNS activation.

## Publication — 7 November 2026

Active release: `2ed7b63e1b4f567f873d79179b4ff692c88d7f86`.
The first installation was run by the owner with sudo. All 15 public assets were verified against the manifest both on the VPS and over public HTTPS. The homepage returns 200; www redirects with 301. Caddy certificates are working with normal certificate validation.

TransIP apex A is now 149.210.159.117 (TTL 300). www remains a CNAME to the apex. mail and ftp were changed from apex aliases to explicit A records at 94.103.145.215; primary MX is 10 mail.thuispizza.nl. Secondary MX and nameservers retained.

GA4 property 563099391 (account 1962708), stream 16292508367, measurement ID G-KJ7HDK0P9M. Search Console domain property sc-domain:thuispizza.nl was verified through DNS TXT and linked to this stream. Sitemap https://thuispizza.nl/sitemap.xml submitted; Google currently reports "Couldn't fetch" despite successful public HTTPS retrieval. Processing/retry is still pending. No indexing result is claimed.

Live calculator input, analytics rejection, tag loading after consent and withdrawal were checked in Chrome. No Google tag was present before consent; the correct measurement ID loaded after consent. Original cooking photography and documented equipment tests are still pending.
