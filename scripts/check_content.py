#!/usr/bin/env python3
"""Check publication metadata, internal destinations, structured JSON and sitemap."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.ids=[]; self.links=[]; self.h1=0; self.canonical=[]; self.descriptions=[]; self.words=[]; self.schema=False
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='h1': self.h1+=1
  if 'id' in d: self.ids.append(d['id'])
  if tag=='a' and 'href' in d: self.links.append(d['href'])
  if tag in ['script','img'] and 'src' in d: self.links.append(d['src'])
  if tag=='link' and 'href' in d:
   self.links.append(d['href'])
   if d.get('rel')=='canonical':self.canonical.append(d['href'])
  if tag=='meta' and d.get('name')=='description':self.descriptions.append(d['content'])
  if tag=='script' and d.get('type')=='application/ld+json':self.schema=True
 def handle_data(self,data):
  if self.schema:json.loads(data);self.schema=False
  else:self.words.extend(data.split())
pages={}
for f in ROOT.glob('*.html'):
 page=Page();page.feed(f.read_text());pages[f.name]=page
 assert page.h1==1,(f.name,'h1')
 assert len(page.ids)==len(set(page.ids)),(f.name,'duplicate ID')
 expected='https://thuispizza.nl/'+('' if f.name=='index.html' else f.name)
 assert page.canonical==[expected],(f.name,'canonical')
 assert len(page.descriptions)==1 and page.descriptions[0],(f.name,'description')
for name,page in pages.items():
 for link in page.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  target=unquote(u.path).lstrip('/') or ('index.html' if u.path=='/' else name)
  assert (ROOT/target).is_file(),(name,link)
  if u.fragment:assert target in pages and u.fragment in pages[target].ids,(name,link,'fragment')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc',ns)]
assert len(urls)==len(set(urls))
assert set(urls)=={'https://thuispizza.nl/'+('' if name=='index.html' else name)for name in pages}
print('Validated',len(pages),'pages: metadata, IDs, internal files and fragments, structured JSON and sitemap.')
for name in ['pizzadeeg.html','rijzen.html','bloem.html','oven.html','vormen.html','toppings.html']:print(name,len(pages[name].words),'visible words')
