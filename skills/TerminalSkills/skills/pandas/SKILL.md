# Pandas

## Overview

Pandas is a Python library for loading, cleaning, transforming, and analyzing tabular data. It provides DataFrames for structured data manipulation, supports CSV, Excel, SQL, JSON, and Parquet formats, and offers powerful groupby aggregation, merge/join operations, time series resampling, and method chaining for building analysis pipelines.

## Instructions

- When loading data, use `pd.read_parquet()` for large datasets (faster, smaller, type-preserving), `pd.read_csv()` with explicit `dtype` for CSVs, and `pd.read_sql()` for database queries.
- When cleaning data, handle missing values with `fillna()` or `dropna()`, deduplicate with `drop_duplicates()`, use string methods (`.str.strip()`, `.str.lower()`) for text cleaning, and convert types explicitly with `astype()` and `pd.to_datetime()`.
- When transforming data, use `assign()` for computed columns, `pipe()` for method chaining, `melt()` and `pivot_table()` for reshaping, and `pd.cut()`/`pd.qcut()` for binning.
- When aggregating, use `groupby().agg()` with named aggregation for readable column names, `transform()` to broadcast results back to original shape, and `resample()` for time-based grouping.
- When merging, use `pd.merge()` with explicit `how` and `validate` parameters to catch data quality issues at merge time, and `pd.concat()` for stacking DataFrames.
- When optimizing performance, use `category` dtype for low-cardinality strings, vectorized operations over `.apply()`, and Parquet for storage; for datasets over 10GB, consider Polars or DuckDB.

## Examples

### Example 1: Clean and analyze a sales dataset

**User request:** "Load a messy CSV of sales data, clean it, and generate monthly revenue summaries"

**Actions:**
1. Load with `pd.read_csv()` specifying `dtype` and `parse_dates` for key columns
2. Clean missing values, deduplicate by order ID, and standardize text fields
3. Add computed columns for revenue and profit margin using `assign()`
4. Group by month with `resample("M").agg()` for revenue, order count, and average order value

**Output:** A clean DataFrame with monthly revenue summaries ready for visualization or reporting.

### Example 2: Merge and enrich customer data from multiple sources

**User request:** "Join customer data from CRM, transactions, and support tickets into a single view"

**Actions:**
1. Load each dataset and standardize key columns (email, customer ID)
2. Merge CRM and transactions with `pd.merge(on="customer_id", how="left", validate="one_to_many")`
3. Aggregate support tickets per customer and merge counts
4. Export the enriched dataset to Parquet for downstream analysis

**Output:** A unified customer DataFrame with CRM info, transaction history, and support metrics.

## Guidelines

- Use `pd.read_parquet()` for intermediate and output files since it is faster, smaller, and preserves types.
- Chain transformations with `.pipe()` for readable and testable code.
- Use named aggregation in `.agg()` for self-documenting column names.
- Set `dtype` explicitly on `read_csv()` for large files since type inference reads the full file twice.
- Use `category` dtype for columns with fewer than 1000 unique values for significant memory savings.
- Validate merges with `validate="one_to_many"` to catch data quality issues at merge time.
- Use `query()` for complex filters instead of chained boolean indexing for better readability.