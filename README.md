# 📝 Survey 2 Markdown

Convert Microsoft Forms survey results (from `.xlsx` Excel exports) into clean, structured Markdown summaries — ideal for use with AI tools like NotebookLM, GPT, or for archiving and reporting.

---

## ✨ Features

- ✅ Drag-and-drop or browse `.xlsx` files (Microsoft Forms exports)
- ✅ Preview data from each sheet
- ✅ Support for and multiple files
- ✅ Output as combined or separate Markdown files
- ✅ Download as individual files or a ZIP archive
- ✅ Smart handling of:
  - Dates & Excel serial timestamps
  - Empty answers
  - Large files (up to 10MB each)
- ✅ Responsive UI with file upload limits and error handling

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/craigashields/survey2markdown.git
cd survey2markdown
```

### 2. Install dependencies

```bash
npm install
```

### 3.Run the dev server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🏗️ Project Structure

- components/ – Reusable UI components including file preview, upload card, etc.
- app/page.tsx – Main UI page
- utils/ – File parsing and markdown generation (if extracted)

## 🛠️ Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- xlsx – Excel parsing
- JSZip – ZIP file generation
- Lucide Icons
- Shadcn UI – Headless UI components

## 💡 Example Use Cases

- Preparing structured survey data for AI tools (e.g., NotebookLM)
- Exporting Markdown for documentation or knowledge bases
- Reviewing participant responses offline

## 📁 Limitations

- Max 10MB per file
- Only .xlsx files supported (not .xls or .csv)
- Markdown output is simple; not intended for spreadsheet round-tripping

## 📄 License

[MIT](https://github.com/craigashields/survey2markdown/blob/main/LICENSE) © [Craig Shields](https://github.com/craigashields)
