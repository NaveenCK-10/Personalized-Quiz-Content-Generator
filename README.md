# Personalized Quiz & Content Generator ✨

> **Unlock Your Learning Potential with AI** — Transform study materials into interactive quizzes, explanations, mind maps, and flashcards instantly. Your personalized learning journey starts here.

<div align="center">

![AI Learning Platform](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![D3.js](https://img.shields.io/badge/D3.js-7-orange) ![License](https://img.shields.io/badge/License-MIT-green)

A production-ready React learning assistant powered by Google Gemini AI with advanced D3.js visualizations and interactive study tools.

[✨ Features](#-features) • [🚀 Quick Start](#️-setup) • [📸 Screenshots](#-screenshots) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎯 Core Learning Tools

* **📝 Quiz Generator** - AI-generated multiple-choice questions with detailed explanations
* **💡 Concept Explanations** - Clear, structured Markdown-formatted breakdowns
* **🗺️ Interactive Mind Maps** - D3.js visualization with 25+ nodes, zoom, pan & SVG export
* **🎴 Advanced Flashcards** - 3D flip effects, text-to-speech, keyboard shortcuts & mobile gestures
* **💬 AI Chat Tutor** - Draggable, context-aware conversation interface
* **📚 Notes Management** - Save and organize study notes with Firebase

### 🎴 Advanced Flashcards Features

* **3D Flip Animations** with dynamic mouse tilt effects
* **Text-to-Speech** 🔊 - Listen to questions & answers
* **Keyboard Shortcuts** - Space to flip, arrow keys to navigate
* **Mobile Swipe Gestures** - Touch-friendly left/right navigation
* **Study Progress Tracking** - Cards studied, completion percentage
* **Shuffle Mode** with localStorage persistence across sessions
* **Accessibility Ready** - ARIA labels, focus outlines, keyboard navigation
* **React.memo Optimization** - Optimized re-renders for large card sets

### 🌳 Mind Map Visualization

* **Zero Overlapping Nodes** - Advanced D3.js tree separation algorithm
* **Beautiful Gradients** - Purple root → Blue subtopics → Green details
* **Interactive Controls** - Zoom in/out, pan, reset view
* **Export to SVG** - Download mind maps for offline study
* **Auto-fit Viewport** - Smart centering and scaling on load
* **Hover Effects** - Smooth glow animations and tooltips
* **Top 25 Concepts** - Intelligent filtering for optimal visualization

### 📄 Document Processing

* **PDF Parsing** - Extract text with real-time progress indicator (pdfjs-dist)
* **DOCX Support** - Microsoft Word document processing (mammoth)
* **Direct Text Input** - Paste or type content directly
* **Firebase History** - Save and retrieve past learning sessions

### 🎨 User Experience

* **Tailwind CSS** - Modern, responsive design system
* **Animated Background** - Dynamic gradient effects
* **Smooth Gradients** - Professional purple/pink/blue theme
* **Skeleton Loading** - Better perceived performance
* **Dark Theme** - Eye-friendly interface optimized for long study sessions

---

## 📸 Screenshots

### 🏠 Landing Page & Dashboard

![Dashboard](./screenshots/dashboard.png)
*Main learning interface with file upload and content generation options*

### 🗺️ Interactive Mind Map Visualization (NEW!)

![Mind Map](./screenshots/mindmap.png)
*D3.js-powered visualization with 25+ nodes, zero overlapping, beautiful purple→blue→green gradients, zoom/pan controls, and SVG export*

### 🎴 Advanced 3D Flashcards (NEW!)

![Flashcards](./screenshots/flashcards.png)
*Interactive flashcards with 3D flip animations, text-to-speech, keyboard shortcuts, swipe gestures, and progress tracking*

### 📝 AI Quiz Generator

![Quiz](./screenshots/quiz.png)
*Intelligent quiz generation with multiple-choice questions, instant grading, and detailed explanations*

### 💬 Draggable AI Chat Tutor

![Chat](./screenshots/chat.png)
*Context-aware AI tutor with draggable interface and conversation history*

---

## 🧱 Tech Stack

| Category                | Technologies                                            |
| ----------------------- | ------------------------------------------------------- |
| **Frontend**            | React 18, Vite 5, Tailwind CSS                          |
| **Visualization**       | D3.js v7 (Mind Maps)                                    |
| **Document Processing** | pdfjs-dist, mammoth                                     |
| **State Management**    | React Context API, localStorage                         |
| **Auth/Database**       | Firebase (Authentication, Firestore)                    |
| **AI Provider**         | Google Gemini (gemini-2.5-flash, gemini-2.5-flash-lite) |
| **Icons**               | Lucide React                                            |
| **Testing**             | Vitest, React Testing Library                           |

---

## ⚙️ Setup

### Prerequisites

* Node.js 18+ and npm/yarn
* Google Gemini API key ([Get one here](https://ai.google.dev/))
* Firebase project (optional, for history/auth)

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

Create a `.env` file in the project root:

```env
# Google Gemini API Key (Required)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase (Optional - for saving history)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

⚠️ **Important:** Never commit your `.env` file. It's already in `.gitignore`.

**Get your Gemini API key:** [https://ai.google.dev/](https://ai.google.dev/)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── AnimatedBackground.js   # Dynamic gradient background effects
│   ├── Chatbot.js              # AI chat tutor interface
│   ├── Controls.js             # Main control buttons
│   ├── ExplanationView.js      # Concept explanation renderer
│   ├── FeedbackReport.js       # User feedback component
│   ├── FlashcardsView.js       # Advanced 3D flashcards with TTS
│   ├── Footer.js               # Footer component
│   ├── Header.js               # Header with navigation
│   ├── InputSection.js         # File upload & text input
│   ├── LoadingScreen.js        # Loading animations & skeleton
│   ├── MindMapView.js          # D3.js mind map visualization
│   ├── Navbar.js               # Top navigation bar
│   ├── NotesView.js            # Notes display component
│   └── QuizView.js             # Quiz generation & grading
│
├── contexts/
│   └── NotesContext.js         # Context API for notes state
│
├── pages/
│   ├── Dashboard.jsx           # Main learning dashboard
│   ├── History.jsx             # Firebase history view
│   ├── Home.jsx                # Landing page
│   ├── Login.jsx               # Authentication page
│   └── SignUp.jsx              # User registration
│
├── utils/
│   ├── aiTransport.js          # Gemini API integration
│   ├── pdfParser.js            # PDF text extraction
│   └── docxParser.js           # DOCX text extraction
│
├── firebase.js                 # Firebase configuration
├── App.js                      # Main application entry
├── App.test.js                 # Unit tests
└── index.css                   # Global Tailwind styles
```

---

## 🚀 Usage

### 1. Upload Content

* **Drag & drop** PDF/DOCX files into the input area
* **Paste text** directly into the text box
* **Load saved notes** from Firebase history (if enabled)

### 2. Generate Learning Materials

Select from multiple generation modes:

| Mode               | Output                                      |
| ------------------ | ------------------------------------------- |
| **📝 Quiz**        | Multiple-choice questions with explanations |
| **💡 Explanation** | Detailed concept breakdown with examples    |
| **🗺️ Mind Map**   | Visual hierarchy of topics and subtopics    |
| **🎴 Flashcards**  | Study cards with Q&A and difficulty ratings |

### 3. Study with Interactive Tools

#### Flashcards

* Click card to flip between question/answer
* Press **Space** to flip, **Arrow keys** to navigate
* Swipe left/right on mobile devices
* Click 🔊 speaker icon for text-to-speech
* Use **Shuffle** to randomize card order
* Track progress with completion percentage

#### Mind Maps

* **Scroll** to zoom in/out
* **Drag** to pan around the visualization
* Click **Zoom In/Out** buttons for precise control
* Click **Reset** to auto-fit all nodes
* Click **Export SVG** to download

#### Chat Tutor

* Ask follow-up questions about content
* Get clarifications on difficult concepts
* Receive personalized explanations
* Drag the chat window anywhere on screen

---

## 🎯 Key Highlights

| Feature              | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| **Zero Overlapping** | Advanced D3.js separation algorithm ensures clean mind map layouts |
| **Text-to-Speech**   | Accessibility-first flashcards with Web Speech API                 |
| **Mobile Optimized** | Touch gestures, responsive design, swipe navigation                |
| **Performance**      | React.memo, lazy loading, optimized re-renders for 100+ flashcards |
| **Accessibility**    | ARIA labels, keyboard navigation, focus management                 |
| **localStorage**     | Persistent shuffle state, no database required                     |
| **3D Effects**       | Hardware-accelerated CSS transforms for smooth animations          |

---

## 📖 API Reference

### Gemini Models Used

| Model                     | Use Case                    | Features                  |
| ------------------------- | --------------------------- | ------------------------- |
| **gemini-2.5-flash-lite** | Quick responses, flashcards | Fast, cost-effective      |
| **gemini-2.5-flash**      | Complex queries, mind maps  | Balanced speed & accuracy |

### Rate Limits

* Free tier: 15 requests/minute
* Consider implementing request throttling for production

---

## 🤝 Contributing

Contributions are welcome! This project is actively maintained.

### Current Contributors

* **[NaveenCK-10](https://github.com/NaveenCK-10)** 
* **[Snehal1729](https://github.com/Snehal1729)** 
* **[shreyaskante27](https://github.com/shreyaskante27)** 

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues

* Text-to-speech may not work in all browsers (requires Web Speech API support)
* Large PDFs (>50 pages) may take longer to process
* Mind map performance may degrade with 100+ nodes

---

## 🛣️ Roadmap

* [ ] Video lecture analysis with Gemini 2.5 video understanding
* [ ] Spaced repetition algorithm for flashcards
* [ ] Export quizzes to PDF
* [ ] Collaborative study sessions
* [ ] Mobile app (React Native)
* [ ] Offline mode with service workers
* [ ] Multi-language support
* [ ] Voice commands for hands-free studying

---

## 📄 License

MIT License © 2025 Naveen Chandra Kanth

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction.

See [LICENSE](LICENSE) file for full details.

---

## 🔗 Links & Resources

* **Repository:** [GitHub](https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator)
* **Issues:** [Report Bug](https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator/issues)
* **Discussions:** [Community](https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator/discussions)

### External Resources

* **Gemini API:** [Get API Key](https://ai.google.dev/)
* **Firebase:** [Setup Guide](https://firebase.google.com/docs/web/setup)
* **D3.js:** [Documentation](https://d3js.org/)
* **Tailwind CSS:** [Documentation](https://tailwindcss.com/)

---
## 📧 Contact

**Naveen Chandra Kanth**

* GitHub: [@NaveenCK-10](https://github.com/NaveenCK-10)
* Project: [Personalized Quiz & Content Generator](https://github.com/NaveenCK-10/Personalized-Quiz-Content-Generator)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the AI Learning Community

</div>
