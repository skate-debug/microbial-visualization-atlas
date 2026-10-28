# Design and project guide

The strongest gallery will make a useful scientific comparison immediately visible. Aesthetic quality comes from deliberate ordering, hierarchy, alignment, legible typography and restrained colour. A circular layout, dense network or large panel count is worthwhile only when it communicates relevant structure.

## Twelve starting designs

These are implementation priorities, not a required twelve-panel figure or a recommendation to run every analysis. Several are conditional on having genomes, viral data or repeated sampling.

| Starting design | Catalogue IDs | Why it earns a place | Appropriate data |
| --- | --- | --- | --- |
| Sampling map with an informative locator | GEO01 | Makes the sampling design and geographic coverage clear | Coordinates and site metadata |
| Raincloud distribution | DIV03 | Combines observations, distribution shape and a summary | Per-sample diversity or chemistry |
| Community ordination | ORD01 | Gives an interpretable overview of community differences | A justified community-distance analysis |
| Annotated abundance heatmap | COM02 | Connects many taxa to ordered samples and metadata | Abundance matrix and metadata |
| Abundance–prevalence dot matrix | COM03 | Separates consistent occurrence from high average abundance | Sample-level occurrence and abundance |
| Effect-size interval plot | EFF01 | Shows effect magnitude and uncertainty directly | Valid model estimates and intervals |
| UpSet intersection plot | COM08 | Makes shared and unique features comparable | Gene, genome or taxon sets |
| Phylogeny with aligned metadata | PHY02–03 | Integrates evolution, habitat and functional traits | Inferred tree and matched metadata |
| Genome synteny comparison | GEN02 | Makes conservation and genomic rearrangement visible | Genomic coordinates and alignments |
| Evidence-qualified virus–host graph | VIR01 | Reveals candidate host connectivity and its support | Host-link evidence with confidence |
| Annotated biogeochemical-cycle map | FUN04 | Connects genes and organisms to ecological processes | Evidence-supported metabolic capabilities |
| Temporal biological/environmental composite | TIM01–02 | Relates succession and events on a common time axis | Repeated sampling and chemistry |

For an amplicon-only first release, prioritize the first seven, temporal designs where applicable, and environmental response curves. Genome-centric, viral, multi-omics and imaging designs can be separate modules. This keeps the initial release useful without requiring data that the study does not contain.

## Six possible multipanel narratives

Each combination below is a proposed design, not a reconstruction of a published figure. Keep only panels that answer distinct questions supported by the study.

| Narrative | Complementary panel roles | What connects the panels |
| --- | --- | --- |
| Environmental biogeography | Sampling map → community ordination → taxon heatmap → environmental effect estimates | Shared site IDs, habitat colours and the ecological gradient |
| Genome discovery and function | Genome quality → phylogenetic placement → functional repertoire → focal synteny | Shared genome IDs and consistent lineage labels |
| Viral ecological roles | Viral community structure → host-link evidence → AMG genomic context → habitat distribution | The same viral populations across layers of evidence |
| Biogeochemical mechanism | Chemical depth profiles → pathway evidence → annotated cycle → experimental effect estimates | Chemical species, measured units and evidence-qualified reactions |
| Disturbance and recovery | Event-aligned measurements → temporal community heatmap → ordination trajectory → recovery contrast | Common time points, controls and biological replicates |
| Spatial microbial organization | Raw image → segmented cell map → spatial-distance statistic → neighbourhood summary | The same fields of view, organisms and spatial scale |

The same observations may appropriately recur as context, but a second panel should add a new relationship or check. For example, observed-versus-predicted values and residuals answer different questions. Recolouring the same ordination without adding interpretable information usually adds little.

## Visual rules that improve the work

1. **Make ordering meaningful.** Align trees, matrix rows, time points and metadata through stable IDs. Use one category order across comparable panels. Document clustering methods and avoid inventing a hierarchy for aesthetic reasons.
2. **Use a small, stable visual vocabulary.** A habitat keeps its colour across panels; a measured quantity keeps its units and scale where comparison requires it. Add shape or line-style redundancy for important categories.
3. **Choose colour by data type.** Use ordered lightness for magnitude, a centered diverging scale for signed deviations, and distinct categorical colours for groups. Avoid rainbow-like scales for ordinary ordered data. These recommendations follow the scientific-colour guidance of [Crameri et al.](https://www.nature.com/articles/s41467-020-19160-7).
4. **Allocate space to information.** Keep annotation tracks compact, but give dense trees or matrices enough area. Use lowercase panel letters, aligned plotting regions and a clear reading order. Move procedural prose into the caption.
5. **Keep uncertainty and the observational unit visible.** Mark measured versus predicted values. State whether points are sites, samples, genomes, cells or pairs. Identify repeated measurements, missingness and technical replication.
6. **Preserve geometry and quantitative meaning.** Use equal scaling for ordinations, correct projections for maps, calibrated scale bars for images and area-based bubble sizes. Define ribbon widths and network edges explicitly.
7. **Inspect at the actual viewing size.** A figure that works only when enlarged is not ready for a manuscript. A GitHub thumbnail should link to a readable full-resolution figure and its caption.

These are project design recommendations. There is no universal “Nature palette” or requirement to make every plot circular. The [reference atlas](journal-atlas.md) provides examples of composition, not templates whose colours or analytical choices must be copied.

## Interpretation constraints specific to microbiome data

| Issue | Consequence for the visual |
| --- | --- |
| Compositional abundance | State the denominator and transformation. An increase in relative abundance does not by itself demonstrate growth in absolute abundance. |
| Sampling and detection limits | Keep absence, non-detection, missingness and below-quantification values distinct. Show sequencing or sampling effort where it affects interpretation. |
| Genome incompleteness | Include genome-quality context before interpreting missing pathways or accessory genes. |
| Associations and predictions | Keep co-occurrence, candidate host links, predicted metabolism and demonstrated interactions visibly distinguishable. |
| Ordination interpretation | Report the distance and transformation, relevant fit information and any ellipse definition. An ellipse is not itself evidence of a group difference. |
| Temporal, spatial and paired dependence | Show the real sampling unit and use inference that respects nesting and repeated observations. |
| Material flows | Use a quantitative flux Sankey only for compatible measured or modelled fluxes. Membership alluvials require different labels and assumptions. |

## Implementation candidates

Choose a stack that fits the team; these are candidates rather than a required dependency list. Verify package versions when actual recipes are implemented, then record or lock the environment.

| Need | Author-maintained or official entry point |
| --- | --- |
| General R plotting | [ggplot2](https://ggplot2.tidyverse.org/) |
| Complex annotated matrices and intersections | [ComplexHeatmap reference](https://jokergoo.github.io/ComplexHeatmap-reference/book/) |
| Trees with associated data | [ggtree / tree-data book](https://yulab-smu.top/treedata-book/) |
| Circular tracks and chord diagrams | [circlize book](https://jokergoo.github.io/circlize_book/book/) |
| General Python plotting and vector output | [Matplotlib](https://matplotlib.org/stable/) |
| Geospatial data preparation and maps | [GeoPandas](https://geopandas.org/en/stable/) |
| Network data structures and layouts | [NetworkX](https://networkx.org/documentation/stable/) |
| Interactive Python figures | [Plotly](https://plotly.com/python/) |

Separate analysis from rendering. A plotting recipe should consume documented, validated results rather than silently choosing a statistical method, refitting a model or changing its conclusions.

## A useful GitHub gallery entry

Each entry should include a readable preview, the scientific question, a complete caption, minimal reproducible code, source data or a stable data-access record, a data dictionary, environment details and the relevant journal or method reference. Use the [recipe template](../templates/visualization-recipe.md).

Useful filters include scientific question, data type, ecosystem, format family, required inputs and static versus interactive output. Searchable entries can be generated from [catalogue.json](../data/catalogue.json). For a future interactive gallery, linked brushing between maps and ordinations, tree-node selection linked to heatmaps, and network neighbourhood inspection are particularly useful. Give each interactive view a static equivalent and a downloadable source table.

Demonstrations made with simulated data should be labelled **synthetic demonstration data**. Empirical examples should record dataset accessions, version, reuse terms and transformation code. Keep article figures as linked design references unless their specific reuse terms support including them.

## Exports and verification

Use editable SVG or vector PDF for text and linework, plus suitable raster previews for the gallery. For manuscript raster exports, a reasonable project default is lossless PNG/TIFF at 600 DPI and a declared physical size, subject to the target journal’s requirements. Calculate pixel dimensions from physical size; changing a DPI tag alone does not improve resolution.

Preserve exact source tables, sample and feature identifiers, ordering, trees, alignments and geographic inputs. Save a panel-to-source mapping. Before release, inspect clipping, labels, colour ambiguity, unit consistency, uncertainty definitions and the complete rendered figure. Analytical validation should address the study’s real scientific risks rather than merely checking that a plotting command runs.
