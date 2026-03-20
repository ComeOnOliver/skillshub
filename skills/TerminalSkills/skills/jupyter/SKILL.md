# Jupyter

## Overview

Jupyter is an interactive computing platform that combines code execution, rich output (tables, plots, widgets), and narrative text in notebook documents. It supports multiple kernels (Python, R, Julia), integrates with matplotlib, plotly, and ipywidgets for visualization, and enables reproducible research through nbconvert for report generation and papermill for parameterized batch execution.

## Instructions

- When building notebooks, organize cells with a clear flow: imports, data loading, exploration, analysis, and conclusions, using Markdown cells for narrative context between code cells.
- When sharing notebooks, restart the kernel and "Run All" to ensure cells execute in order, then use `nbconvert` to generate HTML, PDF, or slides with `--no-input` for non-technical audiences.
- When managing environments, install kernels from virtual environments with `python -m ipykernel install --user --name=myenv` and pin dependencies with `%pip install package==1.2.3` in the first cell.
- When developing iteratively, use `%autoreload 2` to auto-reload imported modules on change, and extract proven code into `.py` modules for reuse.
- When version controlling, use `jupytext` to pair `.ipynb` with `.py` files that diff cleanly, or use `nbstripout` to strip output before Git commits.
- When running in production, use `papermill` to parameterize and execute notebooks programmatically for batch report generation.

## Examples

### Example 1: Build an exploratory data analysis notebook

**User request:** "Create a Jupyter notebook for EDA on a customer dataset"

**Actions:**
1. Set up the notebook with imports, `%matplotlib inline`, and data loading from CSV/Parquet
2. Add summary statistics cells with `df.describe()`, `df.info()`, and missing value analysis
3. Create visualization cells with distribution plots, correlation heatmaps, and time series charts
4. Add Markdown cells with findings and conclusions between analysis sections

**Output:** A well-structured EDA notebook with statistics, visualizations, and narrative ready for sharing.

### Example 2: Automate weekly reports with papermill

**User request:** "Generate weekly sales reports from the same notebook with different date parameters"

**Actions:**
1. Create a template notebook with tagged parameter cells for date range
2. Use `papermill` to execute the notebook with different parameters per week
3. Convert output notebooks to HTML with `nbconvert --no-input` for executive-friendly reports
4. Schedule execution via cron or CI pipeline

**Output:** Automated weekly HTML reports generated from a parameterized notebook template.

## Guidelines

- Restart kernel and "Run All" before sharing to ensure cells execute reliably in order.
- Use `%autoreload 2` during development to reload imported modules without restarting the kernel.
- Use `jupytext` for Git since `.py` files diff cleanly while `.ipynb` outputs pollute version control.
- Pin environment dependencies in the first cell for reproducibility.
- Use `papermill` for batch execution with parameters instead of manual re-runs.
- Split exploration from production: explore in notebooks, extract proven code to Python modules.
- Keep notebooks under 200 cells; split large analyses into multiple focused notebooks.