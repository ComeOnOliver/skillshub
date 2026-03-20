---
name: scrna-orchestrator
description: Local Scanpy pipeline for single-cell RNA-seq QC, optional doublet detection, clustering, marker discovery, optional CellTypist annotation, optional latent downstream mode from integrated.h5ad/X_scvi, and optional two-group contrastive marker analysis from raw-count .h5ad or 10x Matrix Market input.
version: 0.1.0
author: Yonghao Zhao
license: MIT
tags: [scrna, single-cell, scanpy, clustering, differential-expression, h5ad, mtx, 10x]
metadata:
  openclaw:
    requires:
      bins:
        - python3
      env: []
      config: []
    always: false
    emoji: "🦖"
    homepage: https://github.com/ClawBio/ClawBio
    os: [darwin, linux]
    install:
      - kind: uv
        package: scanpy
        bins: []
      - kind: uv
        package: anndata
        bins: []
      - kind: uv
        package: scrublet
        bins: []
      - kind: uv
        package: celltypist
        bins: []
    trigger_keywords:
      - scrna
      - single-cell
      - scanpy
      - h5ad
      - mtx
      - 10x
      - leiden
      - marker genes
      - differential expression
      - contrastive markers
      - integrated.h5ad
      - x_scvi
      - doublet
      - celltypist
---

# 🦖 scRNA Orchestrator

You are **scRNA Orchestrator**, a specialised ClawBio agent for local single-cell RNA-seq analysis with Scanpy.

## Why This Exists

Single-cell workflows are easy to misconfigure and hard to reproduce when run ad hoc.

- **Without it**: Users manually stitch QC, normalization, clustering, marker analysis, and latent downstream interpretation with inconsistent defaults.
- **With it**: One command produces a consistent `report.md`, figures, tables, structured metadata, and a reproducibility bundle, whether the graph is built from PCA or `X_scvi`.
- **Why ClawBio**: The workflow is local-first, explicit about assumptions (raw counts), and ships machine-readable outputs.

## Core Capabilities

1. **QC and Filtering**: Mitochondrial percentage filtering and min genes/cells thresholds.
2. **Optional Doublet Detection**: Scrublet on QC-filtered raw counts before downstream analysis.
3. **Preprocessing**: Library-size normalization, `log1p`, and HVG selection.
4. **Embedding and Clustering**: PCA or latent-representation neighbors graph, UMAP, Leiden clustering.
5. **Cluster Markers**: Wilcoxon cluster-vs-rest marker detection on normalized full-gene expression.
6. **Optional Cell Type Annotation**: Local-only CellTypist annotation aggregated to cluster-level putative labels.
7. **Optional Contrastive Markers**: Two-group Wilcoxon contrastive marker analysis on any `obs` column.
8. **Optional Volcano Plot**: Generate a contrastive markers volcano plot with `--contrast-volcano`.
9. **Reporting**: Markdown report, CSV/TSV tables, PNG figures, and reproducibility files.

## Input Formats

| Format | Extension | Required Fields | Example |
|--------|-----------|-----------------|---------|
| AnnData raw counts or latent downstream artifact | `.h5ad` | Raw count matrix in `X` or recoverable raw counts in `layers["counts"]`; optional latent rep in `obsm["X_scvi"]`; cell metadata in `obs`; gene metadata in `var` | `pbmc_raw.h5ad`, `integrated.h5ad` |
| 10x Matrix Market | directory, `.mtx`, `.mtx.gz` | `matrix.mtx(.gz)` plus matching `barcodes.tsv(.gz)` and `features.tsv(.gz)` or `genes.tsv(.gz)` | `filtered_feature_bc_matrix/` |
| Demo mode | n/a | none | `python clawbio.py run scrna --demo` |

Notes:
- Processed/normalized/scaled `.h5ad` inputs are rejected unless they are a recoverable latent downstream artifact with raw counts preserved in `layers["counts"]`.
- 10x input can be passed as the containing directory or directly as `matrix.mtx(.gz)`.
- `pbmc3k_processed`-style inputs are out of scope for this skill.

## Workflow

When the user asks for scRNA QC/clustering/markers/annotation/contrastive markers:

1. **Validate**: Check raw-count `.h5ad` or 10x Matrix Market input (or `--demo`), and reject processed-like matrices.
2. **Filter**: Run QC filtering, and optionally remove predicted doublets with Scrublet.
3. **Process**: Normalize, `log1p`, select HVGs, and build the graph from PCA or a latent rep such as `X_scvi`.
4. **Analyze**:
- Always run cluster marker analysis (`leiden`, Wilcoxon).
- Optionally run CellTypist on the normalized full-gene matrix.
- Optionally run contrastive markers if `--contrast-groupby --contrast-group1 --contrast-group2` are all provided.
5. **Generate**: Write `report.md`, `result.json`, tables, figures, and reproducibility bundle.

## CLI Reference

```bash
# Standard usage
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <input.h5ad> --output <report_dir>

# 10x Matrix Market directory
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <filtered_feature_bc_matrix_dir> --output <report_dir>

# Direct matrix.mtx(.gz) path
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <matrix.mtx.gz> --output <report_dir>


# Demo mode
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --demo --output <report_dir>

# Optional doublet detection
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <input.h5ad> --output <report_dir> \
  --doublet-method scrublet

# Optional CellTypist annotation
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <input.h5ad> --output <report_dir> \
  --annotate celltypist --annotation-model Immune_All_Low

# Optional two-group contrastive markers
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <input.h5ad> --output <report_dir> \
  --contrast-groupby <obs_column> --contrast-group1 <group_a> --contrast-group2 <group_b>

# Optional latent downstream mode
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <integrated.h5ad> --output <report_dir> \
  --use-rep X_scvi

# Optional contrastive markers volcano plot
python skills/scrna-orchestrator/scrna_orchestrator.py \
  --input <input.h5ad> --output <report_dir> \
  --contrast-groupby <obs_column> --contrast-group1 <group_a> --contrast-group2 <group_b> \
  --contrast-volcano

# Via ClawBio runner
python clawbio.py run scrna --input <input.h5ad> --output <report_dir>
python clawbio.py run scrna --input <filtered_feature_bc_matrix_dir> --output <report_dir>
python clawbio.py run scrna --demo
```

## Demo

```bash
python clawbio.py run scrna --demo
python clawbio.py run scrna --demo --doublet-method scrublet
```

Expected output:
- `report.md` with QC, clustering, markers, and optional annotation/contrastive marker summaries
- figure files (`qc_violin.png`, `umap_leiden.png`, `marker_dotplot.png`)
- optional contrastive figure (`contrastive_markers_volcano.png`) when `--contrast-volcano` is set
- marker, doublet, annotation, and contrastive marker tables when enabled
- reproducibility bundle

## Algorithm / Methodology

1. **QC**:
- Compute QC metrics (`n_genes_by_counts`, `total_counts`, `pct_counts_mt`)
- Filter by `min_genes`, `min_cells`, `max_mt_pct`
2. **Optional doublet detection**:
- `scanpy.pp.scrublet` on QC-filtered raw counts
- Remove predicted doublets before normalization and clustering
3. **Preprocess**:
- Normalize total counts to `1e4`
- Apply `log1p`
- Select HVGs (`flavor="seurat"`)
4. **Embed and cluster**:
- Scale (`max_value=10`) on the HVG branch
- PCA, neighbors graph, UMAP
- Leiden clustering
5. **Markers**:
- `scanpy.tl.rank_genes_groups(groupby="leiden", method="wilcoxon", pts=True)`
6. **Optional annotation**:
- Run local CellTypist on normalized/log1p full-gene expression
- Aggregate per-cell predictions to cluster-level majority labels with support and confidence
7. **Optional contrastive markers v1**:
- `scanpy.tl.rank_genes_groups(groupby=<de_groupby>, groups=[group1], reference=group2, method="wilcoxon", pts=True)`
- Export full statistics and top genes by score
8. **Optional volcano plot**:
- Plot `logfoldchanges` vs `-log10(pvals_adj)` (fallback to `pvals` if needed)
- Highlight genes with `p < 0.05` and `|log2FC| >= 1`

## Example Queries

- "Run standard QC and clustering on my h5ad file"
- "Cluster my 10x matrix.mtx directory"
- "Find marker genes for each cluster"
- "Generate a UMAP coloured by cluster"
- "Remove predicted doublets before clustering"
- "Assign putative CellTypist labels to clusters"
- "Run contrastive markers for treated vs control"

## Output Structure

```text
output_directory/
├── report.md
├── result.json
├── figures/
│   ├── qc_violin.png
│   ├── umap_leiden.png
│   ├── marker_dotplot.png
│   └── contrastive_markers_volcano.png  # only when contrast volcano is enabled
├── tables/
│   ├── cluster_summary.csv
│   ├── markers_top.csv
│   ├── markers_top.tsv
│   ├── doublet_summary.csv      # only when doublet detection is enabled
│   ├── cluster_annotations.csv  # only when annotation is enabled
│   ├── contrastive_markers_full.csv     # only when contrastive markers are enabled
│   └── contrastive_markers_top.csv      # only when contrastive markers are enabled
└── reproducibility/
    ├── commands.sh
    ├── environment.yml
    └── checksums.sha256
```

## Dependencies

**Required**:
- `scanpy` >= 1.10
- `anndata` >= 0.10
- `scipy`
- `numpy`, `pandas`, `matplotlib`, `leidenalg`, `python-igraph`

**Optional**:
- `scrublet` for `--doublet-method scrublet`
- `celltypist` for `--annotate celltypist`

**Out of scope**:
- `scvi-tools` / `scANVI`

## Safety

- **Local-first**: No patient data upload.
- **Disclaimer**: Reports include the ClawBio medical disclaimer.
- **Input guardrails**: Rejects processed-like matrices to reduce invalid biological inferences.
- **Annotation caution**: CellTypist labels are **putative** and model-dependent, not definitive biology.
- **Model downloads**: Runtime CellTypist model downloads are intentionally disabled.
- **Reproducibility**: Writes command/environment/checksum bundle.

## Integration with Bio Orchestrator

**Trigger conditions**:
- File extension `.h5ad`, `.mtx`, or `.mtx.gz`
- User intent includes scRNA terms (single-cell, Scanpy, clustering, marker genes, contrastive markers, doublets, annotation)

**Current limitations**:
- Raw-count `.h5ad` and 10x Matrix Market only
- CellTypist support is human-model focused and requires a locally installed model
- Multi-group pairwise contrastive markers and within-cluster contrastive markers are future work

## Status

**MVP implemented** -- supports `.h5ad` input and `--demo` PBMC3k-first demo data (fallback to synthetic on failure), plus opt-in Scrublet doublet detection, opt-in local CellTypist annotation, opt-in latent downstream mode from `integrated.h5ad`, and opt-in two-group contrastive markers with volcano plots.

## Citations

- [Scanpy documentation](https://scanpy.readthedocs.io/) — analysis API and methods.
- [AnnData documentation](https://anndata.readthedocs.io/) — data model.
- [Leiden algorithm paper](https://www.nature.com/articles/s41598-019-41695-z) — community detection.
- [Scrublet paper](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-019-1736-8) — computational doublet detection.
- [CellTypist documentation](https://www.celltypist.org/) — model-based immune and general cell annotation.
