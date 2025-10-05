````markdown
# Personalized Quiz & Content Generator

A React-based learning assistant that turns any text/document into quizzes, explanations, mind maps, flashcards, and a chat tutor. Supports PDF/DOCX ingestion, local notes, and Firebase history. Works with Google Gemini or Groq (free) via a simple transport switch.

## ✨ Features

- Quiz generator with explanations  
- Concept explanations (Markdown)  
- Mind map JSON structure (hierarchical nodes)  
- Flashcards (Q/A with difficulty)  
- Draggable chat tutor  
- PDF/DOCX parsing with progress  
- Firebase user history  
- Tailwind UI with smooth gradients and skeleton loading  

## 🧱 Tech Stack

- **Frontend:** React + Vite/CRA, Tailwind CSS  
- **PDF:** pdfjs-dist  
- **DOCX:** mammoth  
- **Auth/DB:** Firebase (optional)  
- **AI Providers:**  
  - Google Gemini: gemini-2.5-flash-lite, gemini-2.5-flash  
  - Groq (free): Llama 3.x models  

## ⚙️ Setup

1. **Clone**
   ```bash
   git clone https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator.git
   cd Personalized-Quiz-Content-Generator
````

2. **Install**

   ```bash
   npm install
   ```

3. **Environment variables**
   Create a local `.env` (do not commit) using the template below.

   For Gemini:

   ```bash
   REACT_APP_GEMINI_API_KEY=your_gemini_key
   ```

   For Groq:

   ```bash
   REACT_APP_GROQ_API_KEY=your_groq_key
   REACT_APP_GROQ_MODEL=llama-3.3-70b-versatile
   ```

   Firebase (optional):

   ```bash
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```

4. **Run**

   ```bash
   npm start
   ```

## 🔐 Secrets and Security

* Never commit `.env`. This repo uses `.gitignore` to exclude it.
* If a secret was committed accidentally, rotate it immediately and rewrite history before pushing again.

## 🧠 Provider Configuration

This project supports both Gemini and Groq with minimal changes.

* **Gemini (generateContent API):**

  * Explanations: gemini-2.5-flash
  * Quiz/MindMap/Flashcards/Chat: gemini-2.5-flash-lite

* **Groq (OpenAI-compatible endpoint):**

  * Default: llama-3.3-70b-versatile
  * For large inputs, consider llama-3.1-8b-instant

**Switching provider:**

* Use the Gemini `Dashboard.jsx` (Gemini transport) or Groq `Dashboard.jsx` (Groq transport).
* Only the transport layer changes; UI and handlers remain the same.

## 📄 Supported Inputs

* PDF (text extraction via pdfjs-dist)
* DOCX (text extraction via mammoth)
* Plain text (textarea)

Large files may be trimmed/summarized to avoid API limits.

## 🧩 Key Files

* `src/pages/Dashboard.jsx` — main UI/logic, transport calls, handlers
* `src/components/*` — views and UI components
* `src/contexts/NotesContext.js` — local notes
* `src/firebase.js` — optional Firebase setup

## 🧪 Development Tips

* If React warns *"Received `true` for a non-boolean attribute `jsx`"*, remove `<style jsx>` and use Tailwind.
* For JSON outputs, remove Markdown code fences before `JSON.parse`.
* Disable buttons while loading to avoid duplicate calls.
* If you hit 429 with Gemini, wait for midnight PT or use Groq temporarily.

## 🚀 Deployment

* Host on Vercel, Netlify, or Render (static build).
* Configure runtime env vars in host settings (never hard-code keys).

## 📜 Scripts

```bash
npm start     # dev server
npm run build # production build
npm test      # tests (if added)
```

## 🗺️ Roadmap

* Image/diagram mind map visualization
* Export flashcards to Anki format
* Auth-gated history with cloud backup toggle

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit with conventional messages
4. Open a PR

## 📝 License

MIT

```
```
