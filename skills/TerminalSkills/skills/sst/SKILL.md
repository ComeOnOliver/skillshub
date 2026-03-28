# SST

## Overview

SST (Serverless Stack) is a framework for building and deploying full-stack applications on AWS with high-level constructs for Lambda, API Gateway, DynamoDB, S3, and frontend frameworks. It features live local development connected to real AWS services, type-safe resource linking, and zero-config TypeScript support.

## Instructions

- When defining infrastructure, use `sst.config.ts` with typed components like `sst.aws.Function`, `sst.aws.Api`, `sst.aws.Bucket`, and `sst.aws.Dynamo`.
- When connecting resources, use the `link` property on Functions to automatically grant IAM permissions and inject environment variables, and access linked resources via `Resource.Name` in handlers.
- When developing locally, use `sst dev` which runs Lambda locally with hot reload while connected to real AWS services (DynamoDB, S3, SQS), with support for VS Code breakpoint debugging.
- When deploying, use `sst deploy --stage prod` for named stages, `sst deploy --stage pr-${PR_NUMBER}` for preview environments, and `sst remove --stage dev` for teardown.
- When deploying frontends, use `sst.aws.Nextjs`, `sst.aws.Remix`, or `sst.aws.Astro` components for SSR on Lambda with static assets on S3 + CloudFront.
- When managing secrets, use `sst secret set KEY value` for encrypted, stage-specific secret storage.
- When organizing code, keep handlers thin in `packages/functions/` as orchestrators, and place business logic in `packages/core/`.

## Examples

### Example 1: Build a serverless API with DynamoDB

**User request:** "Create a REST API on AWS with DynamoDB using SST"

**Actions:**
1. Define DynamoDB table and API Gateway in `sst.config.ts`
2. Link the table to API handler functions for automatic permissions
3. Implement CRUD handlers accessing `Resource.MyTable.name`
4. Run `sst dev` for live local development against real AWS services

**Output:** A serverless REST API with type-safe resource access and live debugging.

### Example 2: Deploy a Next.js app with preview environments

**User request:** "Deploy my Next.js app on AWS with per-PR preview environments"

**Actions:**
1. Configure `sst.aws.Nextjs` component with custom domain and linked resources
2. Set up CI to run `sst deploy --stage pr-${PR_NUMBER}` for each pull request
3. Link backend resources (API, database) to the Next.js deployment
4. Add cleanup step with `sst remove` when PR is closed

**Output:** A production Next.js deployment on AWS with isolated preview environments for each PR.

## Guidelines

- Use `link` instead of manual IAM policies; SST generates least-privilege permissions automatically.
- Access linked resources via `Resource.Name` in handlers; never hardcode table names or bucket ARNs.
- Use `sst dev` for daily development; it is faster than deploying to AWS on every change.
- Create per-developer stages (`sst dev --stage alice`) so each developer gets isolated AWS resources.
- Keep handlers thin: business logic in `packages/core/`, handlers in `packages/functions/`.
- Use `sst secret` for API keys and credentials; they are encrypted and stage-specific.
- Set up `sst deploy --stage pr-${PR_NUMBER}` in CI for preview environments on every pull request.
