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

## Organic content release — prepared 7 November 2026

Seventeen public HTML pages. The six guides now include practical procedures, troubleshooting, source lists and links to related tasks. Added calculation method, author and editorial information, sources register, printable unsaved baking log, stone/steel comparison, Baking Steel Original document research and scale selection guide. No hands-on product tests or original cooking photographs are claimed; the owner has no such material available yet.

Calculator: editable water/salt/instant-yeast percentages, source-based short and cold presets, complete total-mass formula including yeast, explicit calculation submit and input validation. The two presets are rounded ratios from the Ooni US recipe pages cited in rekenmethode.html, not an experimentally validated fermentation model. Custom quantities and baking notes never enter Analytics events. Fixed manufacturer-button clicks are product interest, not sales.

Source: edit content/pages.json, then run `python3 scripts/generate_content.py`. Verification: `python3 scripts/check_content.py`, `node tests/calculator.cjs`, `node tests/analytics.cjs`, JavaScript syntax and `git diff --check`. Desktop and 390px Chrome checks covered presets, custom input, invalid input and article layout; no horizontal page overflow on the calculator. Consent tests cover expiry, withdrawal, local exclusion, event allowlisting and input filtering. No Lighthouse scores or field performance results claimed.

Deployment of this update requires the same owner sudo step as the initial installation. Build/upload alone does not change the active release. Original cooking photography, recorded baking experiments and actual Google indexing remain separate outstanding work.

### Organic release activated

The owner activated `18c4f814a309632f4e877d94676cd2f8b028a2d9`. All 25 published assets match SHA-256 checksums both on the VPS and over public HTTPS; the live cold preset was exercised. Sitemap now contains 17 URLs. Previous release retained.

Google live URL inspection on 7 November 2026 at 13:43 Amsterdam time reported `Failed: Robots.txt unreachable`; URL not indexed. Public robots.txt returns HTTPS 200 with text/plain and Allow: /, including with a Googlebot user agent; HTTP redirects to HTTPS. Google's robots report currently says no file and disables its report/recrawl button. This identifies a fetch failure, not a confirmed rules or content problem. The cause is not established; no speculative hosting or DNS changes made. Search processing remains unresolved and must be checked again after Google retries. A successful sitemap submission alone is not successful crawling or indexing.

## Copy, print and mobile audit — prepared 7 November 2026

Added copyable recipe text with exact displayed quantities, selected percentages, dough-plan notes and source link. A selectable text fallback handles denied/unavailable clipboard access. Changing input invalidates the result and clears export text. Async clipboard completion cannot overwrite changed input state. Print opens a recipe-only layout; Chrome preview confirmed one page for the checked two-pizza cold recipe and normal layout returns after cancellation. Export actions send no additional Analytics events or calculator values.

Homepage title now explicitly describes the dough calculator and pizza guides. Mobile Lighthouse 13.6.0 baseline on production: performance 99, accessibility 96, best practices 100, SEO 100. The sole accessibility failure was orange eyebrow text at contrast 4.12:1 on the cream calculator background; accent color darkened. Local updated homepage and representative guide each scored 100 in all four categories. Homepage LCP 0.9 s, TBT 0 ms, CLS 0. These are single lab runs, not field measurements or proof of a performance change; localhost and production differ. Summary and exact settings: reports/mobile-audit-20261107.json. Full raw reports: /tmp/thuispizza-mobile-before.json, /tmp/thuispizza-mobile-after.json, /tmp/thuispizza-guide-mobile.json.

Checks also include tests/recipe-actions.cjs for stale results, clipboard denial, async-copy race and print cleanup, plus existing calculator, analytics and content checks. This update is ready for the normal sudo activation workflow; the active site is unchanged until activation.
