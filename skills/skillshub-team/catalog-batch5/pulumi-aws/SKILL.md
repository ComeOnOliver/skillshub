# Pulumi AWS

## Lambda + API Gateway
```typescript
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

const fn = new aws.lambda.Function("api", {
    runtime: "nodejs20.x", handler: "index.handler",
    code: new pulumi.asset.FileArchive("./dist"),
    role: lambdaRole.arn,
    environment: { variables: { TABLE_NAME: table.name } },
});

const api = new apigateway.RestAPI("api", {
    routes: [
        { path: "/users", method: "GET", eventHandler: fn },
        { path: "/users", method: "POST", eventHandler: fn },
    ],
});
export const apiUrl = api.url;
```

## DynamoDB
```typescript
const table = new aws.dynamodb.Table("users", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    billingMode: "PAY_PER_REQUEST",
});
```

## S3 + CloudFront for static sites
## RDS, ECS, EKS for more complex workloads