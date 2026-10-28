"""Build the static GitHub Pages site using only Python's standard library."""
from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'website'
DEST = ROOT / 'dist'

def build():
    catalogue = json.loads((ROOT / 'data/catalogue.json').read_text())
    references = json.loads((ROOT / 'data/references.json').read_text())
    ids = [e['id'] for e in catalogue['entries']]
    if len(set(ids)) != len(ids):
        raise ValueError('Catalogue IDs must be unique.')
    reference_ids = {r['id'] for r in references}
    for entry in catalogue['entries']:
        for ref in entry['references']:
            if ref['id'] not in reference_ids:
                raise ValueError(f"Unknown reference in {entry['id']}: {ref['id']}")
    if DEST.is_symlink():
        raise ValueError('Refusing to replace a symlink at the build destination.')
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(SOURCE, DEST)
    shutil.copytree(ROOT / 'data', DEST / 'data')
    downloads = DEST / 'downloads'
    downloads.mkdir()
    for file in (ROOT / 'docs').glob('*.md'):
        shutil.copy2(file, downloads / file.name)
    shutil.copy2(ROOT / 'templates/visualization-recipe.md', downloads)
    (DEST / '.nojekyll').write_text('')
    (DEST / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://skate-debug.github.io/microbial-visualization-atlas/sitemap.xml\n')
    (DEST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://skate-debug.github.io/microbial-visualization-atlas/</loc></url></urlset>\n')
    print(f"Built {len(ids)} recipes and {len(references)} references in dist/.")

if __name__ == '__main__':
    build()
