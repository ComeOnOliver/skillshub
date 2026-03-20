# Pulumi IaC

## Setup
```bash
pulumi new aws-typescript
```

## AWS Example
```typescript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const bucket = new aws.s3.Bucket("my-bucket", { website: { indexDocument: "index.html" } });
const vpc = new aws.ec2.Vpc("my-vpc", { cidrBlock: "10.0.0.0/16" });
const lambda = new aws.lambda.Function("api", {
    runtime: "nodejs18.x", handler: "index.handler",
    code: new pulumi.asset.FileArchive("./dist"),
    role: role.arn,
});

export const bucketUrl = bucket.websiteEndpoint;
```

## Commands
```bash
pulumi up          # Deploy
pulumi preview     # Dry run
pulumi destroy     # Tear down
pulumi stack ls    # List stacks (dev, staging, prod)
```

## Key advantage: Real programming languages (TypeScript, Python, Go) instead of YAML/HCL