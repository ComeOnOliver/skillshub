# Alibaba Cloud OSS (Object Storage Service)

Manage Alibaba Cloud OSS using the @alicloud/oss20190517 TypeScript SDK. Use when working with object storage buckets, objects, multipart uploads, bucket configurations (lifecycle, versioning, CORS, encryption, replication, WORM), live streaming channels, and static website hosting. Covers all 90 APIs of the OSS 2019-05-17 version.

## General Instructions

- **SDK Package**: `@alicloud/oss20190517` (with `@alicloud/openapi-client`, `@alicloud/gateway-oss`, `@alicloud/gateway-spi`, `@alicloud/tea-util`, `@alicloud/openapi-util`, `@alicloud/tea-typescript`)
- **Authentication**: Use environment variables `ALIBABA_CLOUD_ACCESS_KEY_ID` and `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
- **Client Init**: Create client with `regionId` — endpoint is auto-resolved to `oss-{regionId}.aliyuncs.com`
- **API Style**: RESTful — `bucket` and `key` are function arguments, not in Request objects
- **Models**: All models (Request/Response) are exported from the main client module
- **Pagination**: Marker-based (`marker`/`nextMarker` or `continuationToken`/`nextContinuationToken`), not page numbers
- **Streaming**: Object upload/download uses Node.js `Readable` streams for the `body` field
- **Error Handling**: Catch errors with `error.code` (e.g., `NoSuchBucket`, `NoSuchKey`, `AccessDenied`)

## Quick Reference

Read `references/quickstart.md` for installation, authentication, endpoints, storage classes, ACL values, pagination patterns, and error codes.

## API Reference by Domain

The SDK provides 90 APIs organized into 6 functional domains:

### Bucket Management (11 APIs)
Create, list, delete, and query bucket information, ACL, location, and regions. List objects in buckets.
→ Read `references/bucket.md` for: putBucket, listBuckets, getBucketInfo, getBucketLocation, getBucketAcl, putBucketAcl, deleteBucket, describeRegions, listObjects, listObjectsV2, listObjectVersions

### Bucket Configuration (33 APIs)
Configure bucket lifecycle, versioning, CORS, logging, website hosting, referer, encryption, request payment, transfer acceleration, tags, inventory, and policy.
→ Read `references/bucket-config.md` for: getBucketLifecycle, putBucketLifecycle, deleteBucketLifecycle, getBucketVersioning, putBucketVersioning, getBucketCors, putBucketCors, deleteBucketCors, getBucketLogging, putBucketLogging, deleteBucketLogging, getBucketWebsite, putBucketWebsite, deleteBucketWebsite, getBucketReferer, putBucketReferer, getBucketEncryption, putBucketEncryption, deleteBucketEncryption, getBucketRequestPayment, putBucketRequestPayment, getBucketTransferAcceleration, putBucketTransferAcceleration, getBucketTags, putBucketTags, deleteBucketTags, getBucketInventory, listBucketInventory, putBucketInventory, deleteBucketInventory, getBucketPolicy, putBucketPolicy, deleteBucketPolicy

### Bucket Replication & WORM (10 APIs)
Cross-region and same-region data replication, replication progress monitoring, and compliance retention (WORM) policies.
→ Read `references/bucket-replication.md` for: getBucketReplication, getBucketReplicationLocation, getBucketReplicationProgress, putBucketReplication, deleteBucketReplication, initiateBucketWorm, getBucketWorm, abortBucketWorm, completeBucketWorm, extendBucketWorm

### Object Operations (20 APIs)
Upload, download, copy, delete, append, head, meta, ACL, symlink, tagging, restore, select, and CORS preflight.
→ Read `references/object.md` for: putObject, getObject, copyObject, appendObject, deleteObject, deleteMultipleObjects, headObject, getObjectMeta, postObject, restoreObject, selectObject, createSelectObjectMeta, optionObject, getObjectAcl, putObjectAcl, getSymlink, putSymlink, getObjectTagging, putObjectTagging, deleteObjectTagging

### Multipart Upload (7 APIs)
Multipart upload operations for large files (>100MB recommended, >5GB required). Minimum part size 100KB (last part exempt).
→ Read `references/multipart.md` for: initiateMultipartUpload, uploadPart, uploadPartCopy, completeMultipartUpload, abortMultipartUpload, listMultipartUploads, listParts

### Live Channel (9 APIs)
RTMP-based live streaming channel management, status monitoring, history, and VOD playlist generation.
→ Read `references/live-channel.md` for: putLiveChannel, getLiveChannelInfo, getLiveChannelStat, getLiveChannelHistory, listLiveChannel, putLiveChannelStatus, deleteLiveChannel, postVodPlaylist, getVodPlaylist

## Common Workflows

Read `references/workflows.md` for 8 step-by-step workflows:
1. Create bucket and upload object
2. Multipart upload for large files
3. Configure bucket lifecycle rules
4. Enable cross-region replication
5. Static website hosting
6. WORM compliance retention
7. Restore archive objects
8. Server-side encryption

## Key Patterns

### Client Initialization
```typescript
import Client from '@alicloud/oss20190517';
import { Config } from '@alicloud/openapi-client';

const client = new Client(new Config({
  accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  regionId: 'cn-hangzhou',
}));
```

### Upload Object
```typescript
import Client, { PutObjectRequest } from '@alicloud/oss20190517';
import { Readable } from 'stream';

await client.putObject('my-bucket', 'path/to/file.txt', new PutObjectRequest({
  body: Readable.from(Buffer.from('content')),
  contentType: 'text/plain',
}));
```

### Download Object
```typescript
import Client, { GetObjectRequest } from '@alicloud/oss20190517';

const { body } = await client.getObject('my-bucket', 'path/to/file.txt', new GetObjectRequest({}));
const chunks: Buffer[] = [];
for await (const chunk of body.body as Readable) {
  chunks.push(Buffer.from(chunk));
}
const content = Buffer.concat(chunks);
```

### List Objects (Paginated)
```typescript
import Client, { ListObjectsV2Request } from '@alicloud/oss20190517';

let token: string | undefined;
const all: any[] = [];
do {
  const { body } = await client.listObjectsV2('my-bucket', new ListObjectsV2Request({
    maxKeys: 1000, prefix: 'data/', continuationToken: token,
  }));
  all.push(...(body.contents || []));
  token = body.isTruncated ? body.nextContinuationToken || undefined : undefined;
} while (token);
```

### Delete Multiple Objects
```typescript
import Client, { DeleteMultipleObjectsRequest, Delete, DeleteObjectsRequestObject } from '@alicloud/oss20190517';

await client.deleteMultipleObjects('my-bucket', new DeleteMultipleObjectsRequest({
  delete: new Delete({
    object: ['a.txt', 'b.txt'].map(k => new DeleteObjectsRequestObject({ key: k })),
    quiet: true,
  }),
}));
```

## Scripts

- `scripts/setup_client.ts` — Reusable client factory with region, STS, and custom endpoint support
- `scripts/examples.ts` — 18 ready-to-use functions covering bucket, object, multipart, lifecycle, CORS, tags, symlink, and restore operations

## Important Notes

- **Object key**: No leading slash. Use `path/to/file.txt`, not `/path/to/file.txt`
- **Bucket names**: Globally unique, 3-63 chars, lowercase letters/numbers/hyphens
- **Max object size**: 5 GB for single PUT, use multipart for larger files
- **Multipart minimum**: Each part ≥ 100KB (except last part), max 10,000 parts
- **Archive restore**: Takes 1 minute (Archive) to hours (Deep Cold Archive)
- **WORM lock**: `completeBucketWorm` is **irreversible** — data cannot be deleted until retention expires
- **Versioning**: Once enabled, can only be suspended (not disabled)
- **Replication**: Source and destination buckets must be in different regions (for CRR)
