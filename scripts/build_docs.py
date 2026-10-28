"""Rebuild the Markdown catalogue and reference atlas from their JSON records."""
from collections import Counter
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
catalogue = json.loads((ROOT / 'data/catalogue.json').read_text())
references = json.loads((ROOT / 'data/references.json').read_text())
refs = {r['id']: r for r in references}
entries = catalogue['entries']

def cell(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')

def anchor(value):
    return re.sub(r'[^a-z0-9 -]', '', value.lower()).replace(' ', '-')

def evidence(item):
    label = {'direct': 'D', 'adaptation': 'A', 'proposal': 'P'}[item['evidence_status']]
    parts = []
    for ref in item['references']:
        source = refs[ref['id']]
        parts.append(f"[{ref['id']}]({source['url']}) {ref['locator']}")
    return label + (': ' + '; '.join(parts) if parts else '')

families = list(dict.fromkeys(e['family'] for e in entries))
counts = Counter(e['evidence_status'] for e in entries)
lines = [
    '# Environmental microbiology visualization catalogue', '',
    f"{len(entries)} formats and applied recipes in {len(families)} families. Literature checked on {catalogue['reviewed_on']}.", '',
    'This is a broad, curated planning resource covering soil, freshwater, marine, sediment, subsurface, engineered and host-associated environmental systems. It includes standard encodings and useful domain-specific compositions; the entries are not all mathematically distinct chart types. It is not a systematic review or an exhaustive inventory of figures in Nature, Science and Cell.', '',
    'Choose a scientific question and a valid analytical unit before choosing visual styling. Each display depends on appropriate analysis of the study data.', '',
    '**Evidence key:** D = encoding verified in a cited figure or original method; A = an adaptation inspired by the cited study; P = additional proposal without a claimed inspected journal example. D confirms the encoding, not every suggested application or design refinement. Nature Portfolio journals are identified by their actual titles in the [journal atlas](journal-atlas.md). Host-associated and cultured-cell method transfers are labelled there.', '',
    f"Evidence coverage: {counts['direct']} direct, {counts['adaptation']} adaptations, {counts['proposal']} additional proposals. Primary study examples and supplementary method references are distinguished in the reference atlas.", '',
    'The **starter** tag means broadly useful for an initial implementation; **specialist** means useful when the corresponding data and scientific question are available. Neither is a quality ranking.', '',
    '## Browse by question', '',
]
for family in families:
    lines.append(f'- [{family}](#{anchor(family)})')
for family in families:
    lines += ['', '## ' + family, '', '| ID / format | Scientific use and minimum data | Design and interpretation | Evidence / scope |', '| --- | --- | --- | --- |']
    for e in entries:
        if e['family'] != family:
            continue
        values = [f"**{e['id']} · {e['name']}**<br>{e['priority']}",
            f"{e['question']}<br>**Data:** {e['minimum_data']}.",
            f"{e['design_tip']}.<br>**Limit:** {e['interpretation_limit']}.", evidence(e)]
        lines.append('| ' + ' | '.join(cell(v) for v in values) + ' |')
lines += ['', '## Selection and implementation', '',
    'Use the [design and project guide](design-and-project-guide.md) for a focused first gallery, complementary multipanel narratives, implementation candidates and source-data requirements. Use the [recipe template](../templates/visualization-recipe.md) for each implemented example.', '',
    'Source records: [catalogue JSON](../data/catalogue.json) and [references JSON](../data/references.json). Rebuild this document with `python3 scripts/build_docs.py`.', '']
(ROOT / 'docs/visualization-catalogue.md').write_text('\n'.join(lines))

lines = ['# Journal and figure reference atlas', '',
    'References were selected for environmental relevance, range of encodings, traceable figure locations and reusable design ideas. This is a curated source set, not a ranking of journals or a frequency analysis of their figures. Publication in a high-profile journal does not make every design choice optimal.', '',
    'Verification uses primary articles, their publicly accessible manuscripts and figure captions. Four layouts were also inspected directly: Gregory Fig. 4, Sunagawa Figs. 4–5, Lima-Mendez Fig. 2 and Bahram Fig. 1. Other examples were checked at the caption or article level; no claim of visual inspection of every panel is made. Public manuscript versions are identified below where relevant.', '',
    '## Environmental and microbiological study references', '']
for r in references:
    if r['id'] == 'M01':
        lines += ['## Additional methods and design references', '', 'These provide original attribution for useful visualization methods. Their journal names are stated explicitly; they are not presented as flagship Nature, Science or Cell papers.', '']
    lines += [f"### {r['id']} · {r['authors']} ({r['year']})", '',
        f"[{r['title']}]({r['url']}). *{r['journal']}*. DOI: {r['doi']}.", '',
        f"**Scope:** {r['scope']}.", '',
        f"**Figure locations:** {r['figures']}", '',
        f"**Design lesson:** {r['lesson']}", '',
        f"**Checked:** {r['verification']}", '']
    if r.get('access_url'):
        lines += [f"[Public article or manuscript]({r['access_url']}).", '']
lines += ['## Reuse in a GitHub project', '',
    'Create original examples using your own data or appropriately licensed public data. Keep links and figure locators as design references. If you later include a journal image, record that image’s applicable licence and attribution; article accessibility alone does not identify its reuse terms. Treat figure images, geographic assets, code and data as separately credited materials.', '',
    'The present repository contains original catalogue text and reference metadata, not reproduced journal figures or downloaded article PDFs.', '']
(ROOT / 'docs/journal-atlas.md').write_text('\n'.join(lines))
print(f'Built {len(entries)} entries, {len(families)} families, {len(references)} references; evidence counts: {dict(counts)}')
