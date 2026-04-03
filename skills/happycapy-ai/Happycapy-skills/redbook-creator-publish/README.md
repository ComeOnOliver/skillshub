# Redbook Creator Publish (Xiaohongshu Post Creation & Publishing)

Xiaohongshu post creation and publishing skill that automatically generates high-quality content and publishes to the creator platform.

## Features Overview

This skill helps users create Xiaohongshu-style quality content, including titles, body text, tags, and images, with automatic upload to the Xiaohongshu creator platform by default.

## Main Features

1. **Content Generation** - Generate Xiaohongshu-style post content (title + body + tags)
2. **Image Generation** - Automatically generate post-related images (PNG/JPG format, 9:16 vertical ratio)
3. **Auto Upload** - Automatic upload to Xiaohongshu creator platform by default (using Playwright browser automation)
4. **Local Preview** - Generate local preview HTML and Markdown files
5. **Smart Fallback** - Automatically provides detailed manual upload instructions when auto-upload fails

## Use Cases

- Create Xiaohongshu-style post content
- Quickly generate Xiaohongshu cover images
- Automatically publish content to Xiaohongshu creator platform
- Share products, tools, tips, tutorials, etc.

## Trigger Words

- create xiaohongshu post
- create redbook
- xiaohongshu
- redbook
- note creation
- post creation

## Core Features

### v3.0 Updates

- **Python Implementation** - Browser automation implemented with Playwright for Python
- **Auto Upload by Default** - No need to ask user, executes auto-upload directly
- **Smart Fallback** - Automatically provides detailed manual upload instructions when auto-upload fails
- **PNG/JPG Images** - Images changed to PNG/JPG format (no longer using HTML)
- **Image Preview** - Preview HTML and MD documents support image display
- **Playwright Automation** - Uses Playwright browser automation (faster and more stable than Selenium)
- **Configurable DOM Selectors** - Support custom selectors via environment variables
- **Deep Topic Search** - Deep search functionality ensures content accuracy and timeliness

## Prerequisites

- **Python 3.0+** - Required
- **Playwright** - Automatically installed on first use
- **Chrome Browser** - For HTML to image conversion (optional)

## Workflow

1. **Determine Creation Topic** - Provide topic or automatically search popular AI news
2. **Deep Search** - Use WebSearch tool to search related content, ensure accuracy
3. **Generate Post Content** - Generate title, body (300-500 words), tags
4. **Generate Images** - Generate 1 vertical 9:16 cover image (1080x1920px)
5. **Generate Local Files** - Create HTML preview, Markdown document, plain text, image files
6. **Auto Upload** - Automatically upload to Xiaohongshu using Playwright (requires login on first use)

## Content Specifications

### Title Requirements
- No more than 20 characters
- Can use 1-2 emojis
- Include hook elements (numeric, question, benefit, suspense, resonance)

### Body Requirements
- Word count: 300-500 words
- Use Chinese (technical terms can retain English)
- Structure: Opening hook → Core content → Summary/Interaction
- Integrate latest information and cases based on deep search results

### Image Requirements
- Quantity: 1 main image
- Format: PNG or JPG
- Size: 1080x1920px (9:16 vertical ratio)
- Style: Natural, realistic, reduce AI feel
- Text: Must use Chinese, no garbled text

## Design Styles

Supports multiple design styles, choose based on content:

1. **Newsprint Style** - High contrast layout, suitable for professional content
2. **Modern Minimalist Style** - Plenty of white space, suitable for light content
3. **Magazine Cover Style** - Eye-catching visuals, suitable for recommendations and lists
4. **Card Stack Style** - Clear hierarchy, suitable for tutorial steps

## Auto Upload

- **Default Execution** - No need to ask user, directly auto-upload
- **Playwright Driven** - Implemented with Playwright for Python
- **Login Persistence** - Remembers state after first login
- **Smart Error Handling** - Provides detailed manual instructions on failure
- **Configurable DOM Selectors** - Support custom selectors via environment variables

## File Output

Generated file structure:

```
redbook-article/
└── [post-topic]-[YYYY-MM-DD]/
    ├── [post-topic]-[YYYY-MM-DD].html      # Preview file
    ├── [post-topic]-[YYYY-MM-DD].md        # Markdown format
    ├── [post-topic]-[YYYY-MM-DD].txt       # Plain text
    ├── images/
    │   └── cover.png                       # Cover image
    └── config.json                         # Configuration info
```

## Notes

- All generated content must be original, integrated from deep search results
- Body word count must be between 300-500 words
- Content must comply with Xiaohongshu community guidelines
- Avoid sensitive words and prohibited content
- Image text uses Chinese, ensure no garbled text
- First use requires login to Xiaohongshu account in the automatically opened browser

## Related Resources

- Playwright Official Website: https://playwright.dev/python/
- Xiaohongshu Creator Platform: https://creator.xiaohongshu.com/

**Original Source:** [NeverSight/skills_feed - yanquankun/redbook-creator-publish](https://github.com/NeverSight/skills_feed/tree/main/data/skills-md/yanquankun/redbook-creator-publish/redbook-creator-publish)
