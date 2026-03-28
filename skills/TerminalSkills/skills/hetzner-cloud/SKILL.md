# Hetzner Cloud

## Overview

Provision and manage Hetzner Cloud infrastructure from the terminal using the `hcloud` CLI. Covers servers, networks, firewalls, volumes, snapshots, SSH keys, and load balancers. Hetzner offers high-performance VPS instances at competitive prices, commonly used to host self-managed platforms like Coolify.

## Instructions

When a user asks for help with Hetzner Cloud, determine which task they need:

### Task A: Initial setup

```bash
# Authenticate with an API token
hcloud context create my-project
# Paste your API token when prompted (from Hetzner Cloud Console > API Tokens)

# List configured contexts
hcloud context list

# Switch context
hcloud context use my-project
```

### Task B: Server management

```bash
# List available server types with pricing
hcloud server-type list

# List available images (OS options)
hcloud image list --type system

# Create a server
hcloud server create \
  --name my-server \
  --type cx22 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key my-key

# List servers
hcloud server list

# Get server details
hcloud server describe my-server

# SSH into a server
hcloud server ssh my-server

# Stop/start/reboot
hcloud server shutdown my-server
hcloud server poweron my-server
hcloud server reboot my-server

# Resize a server (requires poweroff first)
hcloud server shutdown my-server
hcloud server change-type my-server --server-type cx32

# Rebuild with a different OS
hcloud server rebuild my-server --image ubuntu-24.04

# Enable rescue mode (for recovery)
hcloud server enable-rescue my-server --type linux64 --ssh-key my-key

# Delete a server
hcloud server delete my-server
```

**Common server types:**

| Type | vCPU | RAM | Disk | Use case |
|------|------|-----|------|----------|
| cx22 | 2 | 4 GB | 40 GB | Small apps, staging |
| cx32 | 4 | 8 GB | 80 GB | Production apps |
| cx42 | 8 | 16 GB | 160 GB | Databases, heavy workloads |
| cx52 | 16 | 32 GB | 240 GB | High-traffic applications |
| ccx13 | 2 | 8 GB | 80 GB | Dedicated vCPU, consistent performance |

**Locations:** `fsn1` (Falkenstein), `nbg1` (Nuremberg), `hel1` (Helsinki), `ash` (Ashburn), `hil` (Hillsboro), `sin` (Singapore).

### Task C: Networking

```bash
# Create a private network
hcloud network create --name my-network --ip-range 10.0.0.0/16

# Add a subnet
hcloud network add-subnet my-network --type server --network-zone eu-central --ip-range 10.0.1.0/24

# Attach server to network
hcloud server attach-to-network my-server --network my-network --ip 10.0.1.2

# Create a firewall
hcloud firewall create --name web-firewall

# Add firewall rules
hcloud firewall add-rule web-firewall --direction in --protocol tcp --port 22 --source-ips 0.0.0.0/0 --description "SSH"
hcloud firewall add-rule web-firewall --direction in --protocol tcp --port 80 --source-ips 0.0.0.0/0 --description "HTTP"
hcloud firewall add-rule web-firewall --direction in --protocol tcp --port 443 --source-ips 0.0.0.0/0 --description "HTTPS"

# Apply firewall to server
hcloud firewall apply-to-resource web-firewall --type server --server my-server

# Allocate a floating IP
hcloud floating-ip create --type ipv4 --home-location fsn1 --description "Production IP"

# Assign floating IP to server
hcloud floating-ip assign <floating-ip-id> my-server
```

### Task D: Volumes and snapshots

```bash
# Create a volume
hcloud volume create --name data-volume --size 50 --server my-server --format ext4

# List volumes
hcloud volume list

# Resize a volume (online, no downtime)
hcloud volume resize data-volume --size 100

# Detach/attach a volume
hcloud volume detach data-volume
hcloud volume attach data-volume --server other-server

# Create a server snapshot
hcloud server create-image my-server --type snapshot --description "Before upgrade"

# List snapshots
hcloud image list --type snapshot

# Create a server from a snapshot
hcloud server create --name restored-server --type cx22 --image <snapshot-id> --ssh-key my-key

# Delete a snapshot
hcloud image delete <snapshot-id>
```

### Task E: SSH keys and security

```bash
# Upload an SSH key
hcloud ssh-key create --name my-key --public-key-from-file ~/.ssh/id_ed25519.pub

# List SSH keys
hcloud ssh-key list

# Delete an SSH key
hcloud ssh-key delete my-key
```

### Task F: Set up a server for Coolify

A common workflow — provision a Hetzner server and install Coolify:

```bash
# 1. Create a server (cx32 recommended for Coolify)
hcloud server create \
  --name coolify-server \
  --type cx32 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key my-key

# 2. Create and apply a firewall
hcloud firewall create --name coolify-firewall
hcloud firewall add-rule coolify-firewall --direction in --protocol tcp --port 22 --source-ips 0.0.0.0/0 --description "SSH"
hcloud firewall add-rule coolify-firewall --direction in --protocol tcp --port 80 --source-ips 0.0.0.0/0 --description "HTTP"
hcloud firewall add-rule coolify-firewall --direction in --protocol tcp --port 443 --source-ips 0.0.0.0/0 --description "HTTPS"
hcloud firewall add-rule coolify-firewall --direction in --protocol tcp --port 8000 --source-ips 0.0.0.0/0 --description "Coolify UI"
hcloud firewall apply-to-resource coolify-firewall --type server --server coolify-server

# 3. Get the server IP
hcloud server ip coolify-server

# 4. SSH in and install Coolify
ssh root@<server-ip> "curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash"
```

After installation, access Coolify at `http://<server-ip>:8000` and complete the setup wizard.

## Examples

### Example 1: Provision a production server with firewall and volume

**User request:** "Create a Hetzner server for my production app with a firewall and a 100GB data volume"

**Steps taken:**
```bash
# Create the server
$ hcloud server create --name prod-api --type cx32 --image ubuntu-24.04 --location fsn1 --ssh-key deploy-key
Server 12345678 created

# Create and configure firewall
$ hcloud firewall create --name prod-firewall
$ hcloud firewall add-rule prod-firewall --direction in --protocol tcp --port 22 --source-ips 203.0.113.0/32 --description "SSH from office"
$ hcloud firewall add-rule prod-firewall --direction in --protocol tcp --port 443 --source-ips 0.0.0.0/0 --description "HTTPS"
$ hcloud firewall apply-to-resource prod-firewall --type server --server prod-api

# Attach a data volume
$ hcloud volume create --name prod-data --size 100 --server prod-api --format ext4
Volume 87654321 created and attached at /mnt/HC_Volume_87654321
```

### Example 2: Create a snapshot before a risky upgrade

**User request:** "Take a snapshot of my server before I upgrade the database"

**Steps taken:**
```bash
$ hcloud server create-image my-server --type snapshot --description "Pre-DB-upgrade 2024-01-15"
Image 11223344 created from server my-server (status: creating)

# Verify snapshot is ready
$ hcloud image describe 11223344
Status: available
Size: 18.40 GB
Created: 2024-01-15T10:30:00+00:00

# After upgrade, if something goes wrong:
# hcloud server rebuild my-server --image 11223344
```

## Guidelines

- Always create a firewall before exposing a server to the internet. At minimum, restrict SSH to known IPs.
- Use SSH keys instead of passwords. Hetzner disables password auth by default on new servers.
- Take snapshots before risky operations (OS upgrades, database migrations). Snapshots are billed by size.
- For Coolify servers, `cx32` (4 vCPU, 8 GB RAM) is the recommended minimum. `cx22` works for testing.
- Use private networks for server-to-server communication instead of public IPs.
- Volumes can be resized up (not down) without downtime. Plan initial sizes conservatively.
- Floating IPs let you swap servers behind a stable IP address — useful for zero-downtime migrations.
- Server types can be upgraded (not downgraded for shared types). The server must be powered off during resize.
- Use `hcloud server list -o columns=name,status,ipv4,server_type` for clean output in scripts.
- Hetzner locations in Europe (fsn1, nbg1, hel1) generally have the best pricing. US and Asia locations cost more.
