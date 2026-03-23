# MongoDB

## Overview

MongoDB is a document database that stores JSON-like (BSON) documents with flexible schemas, nested objects, and arrays. It provides a rich query language, aggregation pipelines for data transformation, multiple index types (text, TTL, wildcard, geospatial), ACID transactions, and horizontal scaling via sharding. MongoDB Atlas adds managed cloud hosting with full-text search and vector search.

## Instructions

- When designing schemas, embed data that is read together and reference data that is shared across documents, optimizing for read patterns rather than normalization since MongoDB penalizes joins (`$lookup`).
- When querying, use dot notation for nested fields, array operators (`$in`, `$elemMatch`, `$all`) for array queries, and projection to return only needed fields.
- When transforming data, use aggregation pipelines with stages like `$match`, `$group`, `$project`, `$lookup`, and `$unwind` rather than pulling data to application code for processing.
- When creating indexes, add indexes for every production query pattern, use `explain("executionStats")` to verify usage, and choose TTL indexes for auto-expiring data like sessions and logs.
- When enforcing data integrity, use JSON Schema validation on collections, set `writeConcern: "majority"` for critical writes, and use multi-document transactions only when atomicity across documents is required.
- When scaling, choose shard keys with high cardinality and even distribution, set up replica sets for high availability, and configure read preferences based on consistency requirements.

## Examples

### Example 1: Build an e-commerce product catalog

**User request:** "Design a MongoDB schema for products with variants, reviews, and categories"

**Actions:**
1. Embed variants and pricing as arrays within the product document for single-query reads
2. Reference categories as ObjectIds for shared data and embed review summaries
3. Create compound indexes for filtering by category, price range, and rating
4. Build aggregation pipeline for faceted search with `$facet` and `$bucket`

**Output:** A product catalog with embedded variants, referenced categories, faceted search, and optimized indexes.

### Example 2: Set up full-text search with Atlas Search

**User request:** "Add search functionality to my app using MongoDB Atlas Search"

**Actions:**
1. Create an Atlas Search index with analyzers for the title, description, and tags fields
2. Build a `$search` aggregation stage with fuzzy matching and highlighting
3. Add autocomplete search with the `autocomplete` data type
4. Implement relevance scoring and boosting for title matches

**Output:** A search feature with fuzzy matching, autocomplete, relevance ranking, and highlighting.

## Guidelines

- Embed when data is read together; reference when data is shared across documents.
- Design schemas for your query patterns, not for normalization.
- Create indexes for every production query pattern and verify with `explain()`.
- Use TTL indexes for session data, logs, and temporary documents for automatic cleanup.
- Use aggregation pipelines instead of pulling data to application code for transformation.
- Set `writeConcern: "majority"` for critical writes to guarantee data survives failover.
- Choose shard keys carefully since bad shard keys are nearly impossible to change.
