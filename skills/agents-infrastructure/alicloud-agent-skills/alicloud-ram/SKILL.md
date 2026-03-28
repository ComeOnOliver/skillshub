# Alibaba Cloud RAM (Resource Access Management) Skill

Manage Alibaba Cloud Resource Access Management (RAM) using the @alicloud/ram20150501 TypeScript SDK. Use when working with identity and access control on Alibaba Cloud, including RAM users, user groups, roles, policies, AccessKeys, MFA devices, login profiles, password policies, security preferences, account aliases, and resource tagging. Covers all 66 APIs of the RAM 20150501 version.

## Metadata

- **SDK Package**: `@alicloud/ram20150501`
- **API Version**: `2015-05-01`
- **Endpoint**: `ram.aliyuncs.com` (global service, no regionId needed)
- **API Style**: RPC
- **Total APIs**: 66
- **Functional Domains**: 7

## Prerequisites

```bash
npm install @alicloud/ram20150501 @alicloud/openapi-client @alicloud/credentials
```

Environment variables:

```bash
export ALIBABA_CLOUD_ACCESS_KEY_ID="your-access-key-id"
export ALIBABA_CLOUD_ACCESS_KEY_SECRET="your-access-key-secret"
```

## Client Initialization

```typescript
import Ram20150501, * as $_model from '@alicloud/ram20150501';
import * as $OpenApi from '@alicloud/openapi-client';
import Credential from '@alicloud/credentials';

const cred = new Credential();
const config = new $OpenApi.Config({ credential: cred });
config.endpoint = 'ram.aliyuncs.com';
const client = new Ram20150501(config);
```

> **Reusable factory**: See `scripts/setup_client.ts` for production-ready client creation with AK/STS support.

## API Functional Domains

| Domain | APIs | Reference | Description |
|--------|------|-----------|-------------|
| RAM User | 9 | `references/user.md` | Create, query, update, delete RAM users; attach/detach policies; query MFA info |
| RAM User Group | 12 | `references/group.md` | Create, manage groups; add/remove users; attach/detach group policies |
| RAM Role | 8 | `references/role.md` | Create, manage roles (cross-account, service); attach/detach role policies |
| Policy | 13 | `references/policy.md` | Create custom policies; manage versions; set default version; password policy |
| AccessKey | 5 | `references/accesskey.md` | Create, delete, enable/disable AccessKey pairs; query last used time |
| Security & Login | 12 | `references/security.md` | Login profiles; MFA devices; password change; security preferences |
| Account & Tag | 7 | `references/account.md` | Account alias; resource tagging; diagnostic message decoding |

## Quick Examples

### Create a RAM User

```typescript
const result = await client.createUser(new $_model.CreateUserRequest({
  userName: 'alice',
  displayName: 'Alice',
}));
console.log(result.body.user);
```

### Attach a System Policy to User

```typescript
await client.attachPolicyToUser(new $_model.AttachPolicyToUserRequest({
  userName: 'alice',
  policyName: 'AliyunECSReadOnlyAccess',
  policyType: 'System',
}));
```

### Create a RAM Role for Service

```typescript
await client.createRole(new $_model.CreateRoleRequest({
  roleName: 'FCAccessOSSRole',
  assumeRolePolicyDocument: JSON.stringify({
    Statement: [{
      Action: 'sts:AssumeRole',
      Effect: 'Allow',
      Principal: { Service: ['fc.aliyuncs.com'] },
    }],
    Version: '1',
  }),
}));
```

### Create a Custom Policy

```typescript
await client.createPolicy(new $_model.CreatePolicyRequest({
  policyName: 'MyBucketReadOnly',
  policyDocument: JSON.stringify({
    Version: '1',
    Statement: [{
      Effect: 'Allow',
      Action: ['oss:GetObject', 'oss:ListObjects'],
      Resource: ['acs:oss:*:*:my-bucket', 'acs:oss:*:*:my-bucket/*'],
    }],
  }),
}));
```

### List All Users

```typescript
const result = await client.listUsers(new $_model.ListUsersRequest({}));
for (const user of result.body.users?.user || []) {
  console.log(user.userName, user.displayName);
}
```

## Key Patterns

### Policy Types

- `System`: Predefined by Alibaba Cloud (e.g., `AliyunECSFullAccess`, `AliyunOSSReadOnlyAccess`)
- `Custom`: User-created policies with JSON policy documents

### Role Trust Policy Principals

```typescript
// Trust another Alibaba Cloud account
{ Principal: { RAM: ['acs:ram::123456789012****:root'] } }

// Trust an Alibaba Cloud service
{ Principal: { Service: ['fc.aliyuncs.com'] } }

// Trust an external IdP (SAML)
{ Principal: { Federated: ['acs:ram::123456789012****:saml-provider/MyIdP'] } }
```

### Safe Deletion Pattern

Before deleting a RAM user, you must:
1. Detach all policies (`detachPolicyFromUser`)
2. Remove from all groups (`removeUserFromGroup`)
3. Delete all AccessKeys (`deleteAccessKey`)
4. Unbind MFA device (`unbindMFADevice`)
5. Delete login profile (`deleteLoginProfile`)
6. Then delete the user (`deleteUser`)

See `references/workflows.md` → Workflow 8 for complete code.

## Common Workflows

See `references/workflows.md` for complete code examples:

1. Create RAM User with Console Access
2. Create RAM User with Programmatic Access
3. Manage RAM User Groups
4. Create and Manage Custom Policy
5. Create RAM Role for Cross-Account Access
6. Create RAM Role for Alibaba Cloud Service
7. Setup MFA for RAM User
8. Safely Delete RAM User (Clean Dependencies)
9. Configure Account Security Settings

## Reference Loading Guide

Load references on demand based on the task:

- **Getting started** → `references/quickstart.md`
- **User operations** → `references/user.md`
- **Group operations** → `references/group.md`
- **Role operations** → `references/role.md`
- **Policy operations** → `references/policy.md`
- **AccessKey operations** → `references/accesskey.md`
- **Security/MFA/Login** → `references/security.md`
- **Account/Tags** → `references/account.md`
- **End-to-end workflows** → `references/workflows.md`
