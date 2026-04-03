# Xiaohongshu Recruiter

For posting high-quality AI-related job recruitment posts on Xiaohongshu, including automatic generation of geek-style recruitment cover and detail images, with automated publishing scripts.

## Features Overview

This skill helps users quickly and professionally publish AI job recruitment information on Xiaohongshu. It generates visual materials that match geek aesthetics through the "Systemic Flux" design philosophy and provides Playwright scripts for semi-automated publishing.

## Use Cases

- Post AI-related job recruitment information
- Find Agent designers
- Recruit other AI talent
- Create high-quality Xiaohongshu recruitment posts

## Core Workflow

### Simplified Mode (Default)

When the user provides only a one-sentence instruction (e.g., "Post a frontend developer recruitment to Xiaohongshu"):

1. Model automatically completes recruitment information and copy
2. Automatically adds default submission method (DM contact/comment contact)
3. Automatically generates cover image and detail image
4. Automatically opens browser, waiting for user to scan QR code to login
5. Automatically fills in image-text information and publishes with one click

### Complete Workflow

#### 1. Information Collection

Collect the following key information (only ask when user explicitly requests or key information conflicts):

- **Job Title** (e.g., Agent Designer)
- **Core Responsibilities & Requirements**
- **Application Email**

#### 2. Generate Visual Materials

Use local script to generate geek-style recruitment images:

```bash
node scripts/generate_images.js
```

**Output Files**:
- `cover.png` - Cover image
- `jd_details.png` - Detail image

#### 3. Generate Copy

Generate copy that matches Xiaohongshu tone, save as `post_content.txt`.

**Copy Rules**:
- Title: Less than 20 characters
- Body: Include topic tags
- Detailed rules refer to `assets/rules.md`

#### 4. Automated Publishing

Use Playwright script to automatically publish to Xiaohongshu.

**Prerequisites**:

```bash
# Install Playwright
pip install playwright

# Install browser driver
playwright install chromium
```

**Execute Publishing**:

```bash
python3 scripts/publish_xiaohongshu.py "Your Title" "post_content.txt" "cover.png" "jd_details.png"
```

**Interaction Flow**:

1. Script opens Xiaohongshu creator center
2. If login page appears, scan QR code to login
3. After login completion, script automatically:
   - Uploads images
   - Fills in title and body
   - Clicks "Publish"
4. Browser stays open for user confirmation

## Resource Files

### Assets (Design Resources)

- **assets/design_philosophy.md** - Visual design philosophy (Systemic Flux design concept)
- **assets/rules.md** - Detailed operation specifications and platform restrictions

### Scripts (Script Tools)

- **scripts/generate_images.js** - Image generation script
- **scripts/publish_xiaohongshu.py** - Publishing automation script

### References (Reference Documentation)

Contains additional reference materials and guidelines

## Design Philosophy

Adopts "Systemic Flux" design style:
- Geek aesthetics
- Tech-sense visuals
- Matches AI field characteristics
- Professional and modern

## Technical Requirements

- Node.js (for image generation)
- Python 3.x
- Playwright browser automation library
- Chromium browser driver

## Notes

1. First use requires scanning QR code to login to Xiaohongshu account
2. Ensure stable network connection
3. Follow Xiaohongshu platform publishing rules
4. Images and copy must comply with platform content standards

## Usage Example

Simple one-sentence instruction:

```
Post an Agent Designer recruitment to Xiaohongshu
```

Claude will automatically:
- Generate job description
- Create cover and detail images
- Write Xiaohongshu copy
- Start automated publishing process

## Links

- **Original Repository**: https://github.com/iOfficeAI/AionUi
- **Skill Path**: https://github.com/iOfficeAI/AionUi/tree/main/skills/xiaohongshu-recruiter

## License

Please refer to the original repository for license information.
