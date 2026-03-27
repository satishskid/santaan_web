---
name: "liteparse"
description: "Parses PDFs and documents into text/JSON or takes screenshots locally. Invoke when the user needs to extract text from PDFs or read documents."
---

# LiteParse

LiteParse is a standalone OSS PDF parsing tool focused exclusively on fast and light parsing locally without cloud dependencies.

## Installation

```bash
npm i -g @llamaindex/liteparse
```

## Usage

Use the `lit` CLI to parse or screenshot documents:

- **Basic parsing**: `lit parse document.pdf`
- **Parse as JSON**: `lit parse document.pdf --format json -o output.md`
- **Specific pages**: `lit parse document.pdf --target-pages "1-5,10"`
- **Screenshot**: `lit screenshot document.pdf -o ./screenshots`
- **Batch parse**: `lit batch-parse ./input-dir ./output-dir`

It supports flexible OCR using Tesseract.js out of the box. Use this tool whenever you need to read local PDF documents to answer user queries or extract data.
