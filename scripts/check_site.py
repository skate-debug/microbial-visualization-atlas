"""Check deployment assets, document structure, catalogue integrity and links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.headings = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag in ['h1', 'h2']:
            self.headings.append(tag)
        for key in ['href', 'src']:
            if key in attrs:
                self.links.append(attrs[key])

def check():
    doc = Document()
    html = (DIST / 'index.html').read_text()
    doc.feed(html)
    assert len(set(doc.ids)) == len(doc.ids), 'Duplicate HTML IDs'
    assert doc.headings.count('h1') == 1, 'Expected one page h1'
    assert 'lang="en"' in html
    for link in doc.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        if parsed.path:
            target = DIST / unquote(parsed.path)
            assert target.resolve().is_relative_to(DIST.resolve()), link
            if target.is_dir():
                target = target / 'index.html'
            assert target.is_file(), f'Missing asset: {link}'
        elif parsed.fragment:
            assert parsed.fragment in doc.ids, f'Missing anchor: {link}'
    for css in DIST.rglob('*.css'):
        for url in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()):
            if not url.startswith(('http:', 'https:', 'data:')):
                assert (css.parent / url).is_file(), (css, url)
    entries = json.loads((DIST / 'data/catalogue.json').read_text())['entries']
    references = json.loads((DIST / 'data/references.json').read_text())
    assert len(entries) == len({e['id'] for e in entries})
    assert all(e['evidence_status'] in ['direct', 'adaptation', 'proposal'] for e in entries)
    refs = {r['id'] for r in references}
    assert all(r['id'] in refs for e in entries for r in e['references'])
    assert not any(p.name.startswith('.env') for p in DIST.rglob('*'))
    assert not (DIST / '.git').exists()
    print(f'Site checks passed: {len(entries)} recipes, {len(references)} references, all local links and assets present.')

if __name__ == '__main__':
    check()
