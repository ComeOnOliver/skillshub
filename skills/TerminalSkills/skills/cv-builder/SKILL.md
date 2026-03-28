# CV Builder

## Overview

Generate professional, well-formatted CVs and resumes from structured YAML input using the rendercv library. Define your experience, education, skills, and projects in a YAML file and produce publication-ready PDF output with consistent formatting. Choose from multiple built-in templates or customize your own.

## Instructions

When a user asks you to create or update a CV/resume, follow these steps:

### Step 1: Gather career information

Ask the user for or extract the following details:
- **Personal info**: Full name, email, phone, location, LinkedIn/GitHub URLs
- **Summary**: A brief professional summary or objective (2-3 sentences)
- **Experience**: Job titles, companies, dates, bullet-point accomplishments
- **Education**: Degrees, institutions, graduation dates, GPA (optional)
- **Skills**: Technical skills, languages, tools, frameworks
- **Projects** (optional): Notable projects with descriptions
- **Certifications** (optional): Professional certifications with dates

### Step 2: Create the YAML input file

Structure the data into a rendercv-compatible YAML file:

```yaml
cv:
  name: Jane Smith
  location: San Francisco, CA
  email: jane.smith@email.com
  phone: "+1-555-123-4567"
  website: https://janesmith.dev
  social_networks:
    - network: LinkedIn
      username: janesmith
    - network: GitHub
      username: janesmith

  sections:
    summary:
      - >-
        Senior software engineer with 8 years of experience building
        scalable web applications. Expertise in Python, TypeScript, and
        cloud infrastructure.

    experience:
      - company: Acme Corp
        position: Senior Software Engineer
        location: San Francisco, CA
        start_date: 2021-03
        end_date: present
        highlights:
          - "Led migration of monolith to microservices, reducing deploy time by 70%"
          - "Mentored team of 4 junior engineers through code reviews and pairing"
          - "Designed real-time data pipeline processing 2M events/day"

      - company: StartupXYZ
        position: Software Engineer
        location: Remote
        start_date: 2018-06
        end_date: 2021-02
        highlights:
          - "Built REST API serving 50K daily active users with 99.9% uptime"
          - "Implemented CI/CD pipeline reducing release cycle from 2 weeks to 1 day"

    education:
      - institution: University of California, Berkeley
        area: Computer Science
        degree: BS
        start_date: 2014-09
        end_date: 2018-05
        highlights:
          - "GPA: 3.8/4.0"

    skills:
      - label: Languages
        details: Python, TypeScript, Go, SQL
      - label: Frameworks
        details: React, FastAPI, Django, Next.js
      - label: Infrastructure
        details: AWS, Docker, Kubernetes, Terraform

design:
  theme: classic
  font_size: 10pt
  page_size: letterpaper
  margins:
    page:
      top: 2cm
      bottom: 2cm
      left: 2cm
      right: 2cm
```

Save this file as `cv.yaml` in the working directory.

### Step 3: Choose a template theme

Available rendercv themes:
- **classic** - Traditional single-column layout, best for corporate roles
- **sb2nov** - Modern two-column layout popular in tech
- **moderncv** - Academic-style CV with colored accents
- **engineeringresumes** - Clean, ATS-friendly format optimized for engineering

Set the theme in the `design.theme` field of the YAML file.

### Step 4: Generate the PDF

```bash
rendercv render cv.yaml
```

This creates a `rendercv_output/` directory containing:
- `cv.pdf` - The final PDF resume
- `cv.tex` - LaTeX source (for manual adjustments)
- `cv.md` - Markdown version
- `cv.html` - HTML version

### Step 5: Validate and iterate

Review the generated PDF with the user:
- Check for formatting issues or text overflow
- Verify dates and details are correct
- Adjust margins, font size, or theme if needed
- Re-run `rendercv render cv.yaml` after changes

## Examples

### Example 1: Create a new resume from scratch

**User request:** "Help me create a professional resume. I'm a data scientist with 5 years of experience."

**Steps:**
1. Ask the user for their full career details
2. Create `cv.yaml` with their information using the `sb2nov` theme
3. Run `rendercv render cv.yaml`
4. Present the PDF output path and offer to adjust formatting

**Output:**
```
Created cv.yaml with your career data
Generated PDF: rendercv_output/cv.pdf
Also available: cv.tex, cv.md, cv.html

The resume uses the sb2nov theme (modern two-column layout).
Would you like to adjust the template, font size, or content?
```

### Example 2: Update an existing CV with a new job

**User request:** "Add my new position at Google to my existing CV"

**Steps:**
1. Read the existing `cv.yaml` file
2. Add the new experience entry at the top of the experience section
3. Re-run `rendercv render cv.yaml`
4. Confirm the update with the user

### Example 3: Switch template theme

**User request:** "Change my resume to a more traditional format for a finance role"

**Steps:**
1. Read the existing `cv.yaml`
2. Change `design.theme` from `sb2nov` to `classic`
3. Optionally adjust font size to `11pt` for readability
4. Re-run `rendercv render cv.yaml`

## Guidelines

- Always use quantifiable achievements in bullet points (numbers, percentages, metrics).
- Keep the resume to 1 page for candidates with under 10 years of experience; 2 pages maximum for senior professionals.
- Use action verbs to start each bullet point (Led, Built, Designed, Implemented, Reduced).
- Order experience entries reverse-chronologically (most recent first).
- Tailor the skills section to match the target role when the user specifies one.
- Validate the YAML syntax before running rendercv to catch formatting errors early.
- If rendercv is not installed, guide the user: `pip install rendercv`.
- Store the YAML file in version control so the user can track resume changes over time.
- Avoid including personal photos, age, or marital status unless the user explicitly requests it and it is customary for their region.
