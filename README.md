# Personalized Quiz & Content Generator

A React-based learning assistant that turns any text/document into quizzes, explanations, mind maps, flashcards, and a chat tutor. Supports PDF/DOCX ingestion, local notes, and Firebase history. Works with Google Gemini or Groq (free) via a simple transport switch.

## ✨ Features

* Quiz generator with explanations
* Concept explanations (Markdown)
* Mind map JSON structure (hierarchical nodes)
* Flashcards (Q/A with difficulty)
* Draggable chat tutor
* PDF/DOCX parsing with progress
* Firebase user history
* Tailwind UI with smooth gradients and skeleton loading

## 🧱 Tech Stack

* **Frontend:** React + Vite, Tailwind CSS
* **PDF:** pdfjs-dist
* **DOCX:** mammoth
* **Auth/DB:** Firebase (optional)
* **AI Providers:**

  * Google Gemini → gemini-2.5-flash-lite, gemini-2.5-flash
  * Groq (free) → Llama 3.x models

## ⚙️ Setup

### 1. Clone Repository

```bash
git clone https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator.git
cd Personalized-Quiz-Content-Generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root (do not commit). Use `.env.example` as a template:

```ini
# Choose one provider and fill its key locally. Do not commit real keys.

# Gemini
REACT_APP_GEMINI_API_KEY=

# Groq
REACT_APP_GROQ_API_KEY=
REACT_APP_GROQ_MODEL=llama-3.3-70b-versatile

# Firebase (optional)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## 📂 Project Structure

```
src/
 ├── components/      # UI components (quiz, flashcards, chat, etc.)
 ├── pages/           # App pages (Dashboard, Home, etc.)
 ├── utils/           # AI transport + PDF/DOCX parsing helpers
 ├── firebase.js      # Firebase config (if enabled)
 └── App.jsx          # Main entry
```

## 🚀 Usage

* Upload a **PDF/DOCX** or paste text
* Choose **Quiz / Explanation / Mind Map / Flashcards**
* Chat with the **AI Tutor**
* History is saved in Firebase (if enabled)

## 📖 License

MIT © 2025 Naveen Chandra Kanth
