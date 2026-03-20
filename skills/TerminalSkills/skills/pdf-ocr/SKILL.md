# PDF OCR

## Overview

Extract readable text from scanned or image-based PDF documents using optical character recognition (OCR). This skill converts PDF pages to images, runs OCR to detect text, and outputs clean structured text. Handles multi-page documents, multiple languages, and low-quality scans with preprocessing.

## Instructions

When a user asks to OCR a scanned PDF or extract text from an image-based PDF, follow these steps:

### Step 1: Check if OCR is actually needed

First, attempt normal text extraction. If the PDF already contains selectable text, OCR is unnecessary:

```python
import pdfplumber

def check_text_content(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:3]:
            text = page.extract_text()
            if text and len(text.strip()) > 50:
                return True  # Has extractable text, OCR not needed
    return False  # Image-only PDF, needs OCR
```

### Step 2: Install and verify dependencies

Ensure the required tools are available:

```bash
# Install Tesseract OCR engine
# Ubuntu/Debian:
sudo apt-get install tesseract-ocr
# macOS:
brew install tesseract

# Install Python packages
pip install pytesseract pdf2image Pillow

# For additional languages:
sudo apt-get install tesseract-ocr-deu  # German
sudo apt-get install tesseract-ocr-fra  # French
sudo apt-get install tesseract-ocr-jpn  # Japanese
```

### Step 3: Convert PDF pages to images

```python
from pdf2image import convert_from_path

def pdf_to_images(pdf_path, dpi=300):
    images = convert_from_path(pdf_path, dpi=dpi)
    return images
```

Use 300 DPI for standard documents. Increase to 400-600 DPI for small text or low-quality scans.

### Step 4: Preprocess images for better accuracy

Apply preprocessing to improve OCR quality:

```python
from PIL import Image, ImageFilter, ImageEnhance

def preprocess_image(image):
    # Convert to grayscale
    gray = image.convert('L')
    # Increase contrast
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(2.0)
    # Sharpen
    sharpened = enhanced.filter(ImageFilter.SHARPEN)
    # Binarize (threshold)
    threshold = 150
    binary = sharpened.point(lambda x: 255 if x > threshold else 0)
    return binary
```

### Step 5: Run OCR on each page

```python
import pytesseract

def ocr_pages(images, lang='eng'):
    results = []
    for i, image in enumerate(images):
        processed = preprocess_image(image)
        text = pytesseract.image_to_string(processed, lang=lang)
        results.append({
            "page": i + 1,
            "text": text.strip(),
            "confidence": get_confidence(processed, lang)
        })
    return results

def get_confidence(image, lang='eng'):
    data = pytesseract.image_to_data(image, lang=lang, output_type=pytesseract.Output.DICT)
    confidences = [int(c) for c in data['conf'] if int(c) > 0]
    return sum(confidences) / len(confidences) if confidences else 0
```

### Step 6: Output the results

Combine and format the extracted text. Save as a text file or return directly:

```python
def save_results(results, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        for page in results:
            f.write(f"--- Page {page['page']} (confidence: {page['confidence']:.0f}%) ---\n")
            f.write(page['text'] + "\n\n")
    return output_path
```

## Examples

### Example 1: OCR a scanned contract

**User request:** "Extract text from this scanned contract scan_contract.pdf"

**Actions taken:**
1. Check for existing text layer - none found, OCR needed
2. Convert 5 pages to images at 300 DPI
3. Preprocess and run OCR in English

**Output:**
```
OCR completed for scan_contract.pdf (5 pages)

Page-by-page confidence:
  Page 1: 96% confidence
  Page 2: 94% confidence
  Page 3: 91% confidence
  Page 4: 95% confidence
  Page 5: 88% confidence (lower quality scan detected)

Output saved to: scan_contract_text.txt (4,230 words extracted)

Note: Page 5 had lower image quality. Review that page for accuracy.
```

### Example 2: OCR a multi-language document

**User request:** "Read this scanned document, it's in German: rechnung.pdf"

**Actions taken:**
1. Verify tesseract-ocr-deu language pack is installed
2. Convert pages to images at 300 DPI
3. Run OCR with `lang='deu'`

**Output:**
```
OCR completed for rechnung.pdf (2 pages) using German language model

  Page 1: 93% confidence
  Page 2: 95% confidence

Extracted 812 words. Output saved to: rechnung_text.txt
```

### Example 3: Batch OCR multiple scanned files

**User request:** "OCR all the scanned PDFs in the ./receipts/ folder"

**Actions taken:**
1. Find all PDF files in ./receipts/ (found 12 files)
2. Check each for existing text layer
3. Run OCR on the 10 files that need it

**Output:**
```
Batch OCR complete: 12 files processed

  Already had text: 2 files (skipped)
  OCR completed:    10 files
  Average confidence: 92%

Output files saved to ./receipts/ocr_output/
  receipt_001_text.txt (97% confidence)
  receipt_002_text.txt (94% confidence)
  ...
  receipt_010_text.txt (85% confidence - review recommended)
```

## Guidelines

- Always check for existing text content before running OCR. Many PDFs already have a text layer.
- Use 300 DPI as the default resolution. Increase for small fonts or poor quality scans.
- Report confidence scores per page so users know which pages may need manual review.
- For multi-language documents, specify the correct Tesseract language code. Multiple languages can be combined: `lang='eng+deu'`.
- Preprocess images before OCR: grayscale conversion, contrast enhancement, and binarization significantly improve accuracy.
- For rotated or skewed scans, apply deskewing before OCR using image rotation detection.
- Large PDFs should be processed page by page to manage memory usage.
- Common Tesseract language codes: eng (English), deu (German), fra (French), spa (Spanish), jpn (Japanese), chi_sim (Chinese Simplified), kor (Korean).