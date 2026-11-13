#!/usr/bin/env python3
"""Render committed article source into static pages; no network or dependencies."""
from pathlib import Path
import html,json,re
ROOT=Path(__file__).resolve().parent.parent
pages=json.loads((ROOT/'content/pages.json').read_text())
DATE='2026-11-07'
def dutch_date(value):
 year,month,day=map(int,value.split('-'))
 months=('januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december')
 return f'{day} {months[month-1]} {year}'
footer='''<footer class="footer"><a class="brand" href="/">thuis<span>pizza</span>.nl</a><nav aria-label="Meer informatie"><a href="over-ons.html">Over ons</a><a href="redactioneel-beleid.html">Werkwijze</a><a href="bronnen.html">Bronnen</a><a href="privacy.html">Privacy</a></nav></footer>'''
header='''<a class="skip-link" href="#main">Direct naar inhoud</a><header><a class="brand" href="/">thuis<span>pizza</span>.nl</a><nav aria-label="Hoofdnavigatie"><a href="/#calculator">Deegcalculator</a><a href="/#gidsen">Gidsen</a><a href="materiaal.html">Materiaal</a></nav></header>'''
for slug,page in pages.items():
 updated=page.get('updated',DATE)
 checked=page.get('sources_checked',DATE)
 title=html.escape(page['title']);intro=html.escape(page['intro']);body=page['body']
 headings=[]
 def heading(m):
  text=m[1];anchor=re.sub(r'[^a-z0-9]+','-',text.lower()).strip('-');headings.append((anchor,text));return f'<h2 id="{anchor}">{text}</h2>'
 body=re.sub(r'<h2>(.*?)</h2>',heading,body)
 toc='<nav class="toc" aria-label="Op deze pagina"><strong>Op deze pagina</strong><ul>'+''.join(f'<li><a href="#{anchor}">{text}</a></li>' for anchor,text in headings)+'</ul></nav>' if len(headings)>2 else ''
 source_items=[]
 for url,label,*source_date in page['sources']:
  consulted=' — '+dutch_date(source_date[0]) if source_date else ''
  source_items.append(f'<li><a href="{html.escape(url,quote=True)}">{html.escape(label)}</a>{consulted}</li>')
 exception=' (tenzij bij de bron anders vermeld)' if any(len(source)>2 for source in page['sources']) else ''
 sources=('<section class="sources" aria-labelledby="sources-heading"><h2 id="sources-heading">Bronnen bij deze pagina</h2><ul>'
  +''.join(source_items)+f'</ul><p>Geraadpleegd op {dutch_date(checked)}{exception}. Lees hoe we '
  +'<a href="redactioneel-beleid.html">bronnen en eigen ervaring onderscheiden</a>.</p></section>') if page['sources'] else ''
 related='<aside class="related"><h2>Lees verder</h2><ul>'+''.join(f'<li><a href="{s}.html">{html.escape(pages[s]["title"])}</a></li>' for s in page['related'])+'</ul></aside>'
 schema={'@context':'https://schema.org','@type':'Article','headline':page['title'],'description':page['intro'],'datePublished':DATE,'dateModified':updated,'author':{'@type':'Person','name':'Joost Westra','url':'https://thuispizza.nl/over-ons.html'},'mainEntityOfPage':'https://thuispizza.nl/'+slug+'.html','inLanguage':'nl-NL'}
 scripts=''.join(f'<script src="{html.escape(script,quote=True)}"></script>' for script in page.get('scripts',[]))
 markup=f'''<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | thuispizza.nl</title><meta name="description" content="{intro}"><link rel="canonical" href="https://thuispizza.nl/{slug}.html"><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('<','&lt;')}</script></head><body>{header}<main id="main" class="article"><article><p class="eyebrow">Praktisch thuis pizza maken</p><h1>{title}</h1><p class="intro">{intro}</p><p class="byline">Redactie: <a rel="author" href="over-ons.html">Joost Westra</a> · Bijgewerkt <time datetime="{updated}">{dutch_date(updated)}</time></p>{toc}{body}{sources}</article>{related}</main>{footer}{scripts}<script src="analytics.js"></script></body></html>'''
 (ROOT/(slug+'.html')).write_text(markup+'\n')
urls=['']+[p.name for p in sorted(ROOT.glob('*.html')) if p.name not in ('index.html','404.html')]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>https://thuispizza.nl/{url}</loc><lastmod>{pages.get(url.removesuffix('.html'),{}).get('updated',DATE)}</lastmod></url>\n' for url in urls)+'</urlset>\n')
print('Rendered',len(pages),'articles;',len(urls),'sitemap URLs')
