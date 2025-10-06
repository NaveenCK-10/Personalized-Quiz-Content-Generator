import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Draggable from "react-draggable";

import InputSection from "../components/InputSection";
import Controls from "../components/Controls";
import QuizView from "../components/QuizView";
import FeedbackReport from "../components/FeedbackReport";
import ExplanationView from "../components/ExplanationView";
import NotesView from "../components/NotesView";
import MindMapView from "../components/MindMapView";
import FlashcardsView from "../components/FlashcardsView";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { NotesProvider } from "../contexts/NotesContext";

import { MessageSquare, X, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// ---------- Gemini transport ----------
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Free-tier friendly defaults
const MODEL_FLASH_LITE = "gemini-2.5-flash-lite";
const MODEL_FLASH = "gemini-2.5-flash";

// Helper to build endpoint
const modelEndpoint = (model) => `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

// Make a Gemini call (text-only)
async function callGemini({ model, text, responseSchema = null, signal }) {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API key. Add REACT_APP_GEMINI_API_KEY to .env and restart the server.");

  const payload = {
    contents: [{ parts: [{ text }] }],
  };

  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema,
    };
  }

  const res = await fetch(modelEndpoint(model), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please wait or try after midnight PT.");
    }
    if (/quota|exceeded/i.test(txt)) {
      throw new Error("Daily quota exceeded. Try again tomorrow or upgrade your plan.");
    }
    throw new Error(`Gemini API ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

// ---------- Utils ----------
const cleanFences = (s) => s.replace(/^``````$/, "");

const useTypingEffect = (textToType, speed = 80) => {
  const [typedText, setTypedText] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) setTypedText(textToType);
    else setTypedText("");
  }, [textToType, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || typedText.length >= textToType.length) return;
    const t = setTimeout(() => setTypedText(textToType.substring(0, typedText.length + 1)), speed);
    return () => clearTimeout(t);
  }, [typedText, textToType, speed, prefersReducedMotion]);

  return typedText;
};

const LoadingSkeleton = () => (
  <div className="p-8 animate-pulse">
    <div className="h-8 bg-white/10 rounded-md w-3/4 mb-6" />
    <div className="space-y-4">
      <div className="h-4 bg-white/10 rounded-md w-full" />
      <div className="h-4 bg-white/10 rounded-md w-5/6" />
      <div className="h-4 bg-white/10 rounded-md w-full" />
    </div>
  </div>
);

function DashboardContent() {
  const [userText, setUserText] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [view, setView] = useState("welcome");
  const [error, setError] = useState(null);

  const [quizData, setQuizData] = useState(null);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [explanationData, setExplanationData] = useState({ main: "", history: [] });
  const [mindMapData, setMindMapData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const nodeRef = useRef(null);
  const apiRequestController = useRef(null);

  const headerText = useTypingEffect("Personalized Quiz & Content Generator");

  // PDF worker
  useEffect(() => {
    try {
      const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      const version = pdfjsLib.version || "4.4.168";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }
  }, []);

  useEffect(() => {
    if (view === "quiz") setIsChatOpen(false);
  }, [view]);

  useEffect(() => {
    const controller = apiRequestController.current;
    return () => controller?.abort();
  }, []);

  useEffect(() => {
    const onEsc = (ev) => ev.key === "Escape" && setIsChatOpen(false);
    if (isChatOpen) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isChatOpen]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleReset = useCallback(() => {
    apiRequestController.current?.abort();
    setUserText("");
    setFileStatus("");
    setView("welcome");
    setQuizData(null);
    setFeedbackReport(null);
    setExplanationData({ main: "", history: [] });
    setMindMapData(null);
    setFlashcardsData(null);
    setError(null);
    setIsChatOpen(false);
  }, []);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event?.target?.files?.[0] || null;
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
        if (event?.target) event.target.value = "";
        return;
      }

      handleReset();
      setIsLoading(true);
      setFileStatus(`Processing ${file.name}...`);

      try {
        let text = "";
        if (file.type === "application/pdf") {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            setFileStatus(`Processing page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map((item) => item.str).join(" ");
          }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else {
          throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
        }

        if (text.length > 1_000_000) {
          setError("File text is too large. Try a smaller document.");
          setFileStatus("Failed to process file.");
        } else {
          setUserText(text);
          setFileStatus(`Successfully processed ${file.name}.`);
        }
      } catch (err) {
        setError(err?.message || "Failed to parse file. It might be corrupted or in an unsupported format.");
        setFileStatus("Failed to process file.");
      } finally {
        setIsLoading(false);
        if (event?.target) event.target.value = "";
      }
    },
    [handleReset, MAX_FILE_SIZE]
  );

  const saveHistory = useCallback(async (type, data) => {
    const user = getAuth().currentUser;
    if (!user) return;
    try {
      const historyId = `${type}_${Date.now()}`;
      const historyRef = doc(db, "users", user.uid, "history", historyId);
      await setDoc(historyRef, { ...data, createdAt: serverTimestamp(), type, id: historyId });
    } catch (err) {
      console.error("Error saving history:", err);
    }
  }, []);

  // ---------- Handlers (Gemini) ----------
  const handleGenerateQuiz = useCallback(async () => {
    if (!userText.trim()) return setError("Please provide some text to generate a quiz.");

    apiRequestController.current?.abort();
    const controller = new AbortController();
    apiRequestController.current = controller;
    setIsLoading(true);
    setError(null);

    const schema = {
      type: "OBJECT",
      properties: {
        quizTitle: { type: "STRING" },
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              questionText: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctAnswerIndex: { type: "INTEGER" },
              explanation: { type: "STRING" },
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
      required: ["quizTitle", "questions"],
    };

    const text = `Generate a 5-question multiple-choice quiz from the provided text. Difficulty: ${difficulty}.
The output must be valid JSON with the exact schema. 
Text: ${userText}`;

    try {
      const result = await callGemini({
        model: MODEL_FLASH_LITE,
        text,
        responseSchema: schema,
        signal: controller.signal,
      });

      const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const obj = JSON.parse(cleanFences(raw));
      setExplanationData({ main: "", history: [] });
      setQuizData(obj);
      setView("quiz");
      saveHistory("quiz", { title: obj.quizTitle || "New Quiz", content: obj });
    } catch (e) {
      console.error("Quiz generation failed:", e);
      setError(e.message || "Failed to generate quiz.");
    } finally {
      setIsLoading(false);
    }
  }, [userText, difficulty, saveHistory]);

  const handleGenerateExplanation = useCallback(async () => {
    if (!userText.trim()) return setError("Please provide some text to generate an explanation.");

    apiRequestController.current?.abort();
    const controller = new AbortController();
    apiRequestController.current = controller;
    setIsLoading(true);
    setError(null);

    const text = `You are a helpful AI tutor. Generate a detailed explanation of key concepts from the text for a '${difficulty}' level learner. Format with Markdown.
Text: ${userText}`;

    try {
      const result = await callGemini({
        model: MODEL_FLASH,
        text,
        signal: controller.signal,
      });

      const explanationText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (explanationText) {
        const history = [
          { role: "user", parts: [{ text: `Here is the context for our conversation: """${explanationText}"""` }] },
          { role: "model", parts: [{ text: "Great! I've read the explanation. What would you like to know?" }] },
        ];
        setQuizData(null);
        setExplanationData({ main: explanationText, history });
        setView("explanation");
        saveHistory("explanation", { title: `Explanation: ${userText.substring(0, 40)}...`, content: explanationText });
        setIsChatOpen(true);
      }
    } catch (e) {
      console.error("Explanation generation failed:", e);
      setError(e.message || "Failed to generate explanation.");
    } finally {
      setIsLoading(false);
    }
  }, [userText, difficulty, saveHistory]);

  const handleGenerateMindMap = useCallback(async () => {
    if (!userText.trim()) return setError("Please provide text to generate a mind map.");

    apiRequestController.current?.abort();
    const controller = new AbortController();
    apiRequestController.current = controller;
    setIsLoading(true);
    setError(null);

    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        nodes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              label: { type: "STRING" },
              level: { type: "INTEGER" },
              parentId: { type: "STRING" },
              description: { type: "STRING" },
            },
            required: ["id", "label", "level"],
          },
        },
      },
      required: ["title", "nodes"],
    };

    const text = `Extract key concepts and their relationships from the text to create a hierarchical mind map structure. Identify the main topic, subtopics, and supporting details. Return as JSON with nodes and their relationships.
Text: ${userText}`;

    try {
      const result = await callGemini({
        model: MODEL_FLASH_LITE,
        text,
        responseSchema: schema,
        signal: controller.signal,
      });

      const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const obj = JSON.parse(cleanFences(raw));
      setMindMapData(obj);
      setView("mindmap");
      saveHistory("mindmap", { title: obj.title || "Mind Map", content: obj });
    } catch (e) {
      console.error("Mind map generation failed:", e);
      setError(e.message || "Failed to generate mind map.");
    } finally {
      setIsLoading(false);
    }
  }, [userText, saveHistory]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!userText.trim()) return setError("Please provide text to generate flashcards.");

    apiRequestController.current?.abort();
    const controller = new AbortController();
    apiRequestController.current = controller;
    setIsLoading(true);
    setError(null);

    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        flashcards: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              question: { type: "STRING" },
              answer: { type: "STRING" },
              topic: { type: "STRING" },
              difficulty: { type: "STRING" },
            },
            required: ["id", "question", "answer", "topic"],
          },
        },
      },
      required: ["title", "flashcards"],
    };

    const text = `Create 10 flashcards from the provided text. Each flashcard should have a clear question on the front and a detailed answer on the back. Difficulty: ${difficulty}. Focus on key concepts, definitions, and important facts.
Return JSON per schema.
Text: ${userText}`;

    try {
      const result = await callGemini({
        model: MODEL_FLASH_LITE,
        text,
        responseSchema: schema,
        signal: controller.signal,
      });

      const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const obj = JSON.parse(cleanFences(raw));
      setFlashcardsData(obj);
      setView("flashcards");
      saveHistory("flashcards", { title: obj.title || "Flashcards", content: obj });
    } catch (e) {
      console.error("Flashcards generation failed:", e);
      setError(e.message || "Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  }, [userText, difficulty, saveHistory]);

  const handleSendChatMessage = useCallback(async (message) => {
    const newHistory = [...explanationData.history, { role: "user", parts: [{ text: message }] }];
    setExplanationData((prev) => ({ ...prev, history: newHistory }));

    apiRequestController.current?.abort();
    const controller = new AbortController();
    apiRequestController.current = controller;
    setIsChatLoading(true);
    setError(null);

    const text = `You are an AI tutor. A detailed explanation is already on screen. Answer the user's follow-up question briefly and conversationally, based on the chat history. Difficulty: ${difficulty}.
Question: ${message}`;

    try {
      const result = await callGemini({
        model: MODEL_FLASH_LITE,
        text,
        signal: controller.signal,
      });

      const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (aiResponse) {
        setExplanationData((prev) => ({
          ...prev,
          history: [...newHistory, { role: "model", parts: [{ text: aiResponse }] }],
        }));
      }
    } catch (e) {
      console.error("Chat failed:", e);
      setError(e.message || "Chat request failed.");
    } finally {
      setIsChatLoading(false);
    }
  }, [explanationData.history, difficulty]);

  const renderContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    switch (view) {
      case "quiz":
        return (
          <QuizView
            quizData={quizData}
            setView={setView}
            setFeedbackReport={setFeedbackReport}
            saveHistory={saveHistory}
          />
        );
      case "report":
        return <FeedbackReport report={feedbackReport} />;
      case "explanation":
        return <ExplanationView explanationText={explanationData.main} />;
      case "notes":
        return <NotesView />;
      case "mindmap":
        return <MindMapView mindMapData={mindMapData} />;
      case "flashcards":
        return <FlashcardsView flashcardsData={flashcardsData} />;
      default:
        return (
          <div className="text-center text-pink-200/70 p-12">
            <Sparkles className="mx-auto w-16 h-16 text-pink-300/50" />
            <h3 className="mt-4 text-lg font-medium">Ready to Learn?</h3>
            <p className="mt-1 text-sm">Your generated content will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-white font-sans bg-gradient-to-br from-purple-900 via-black to-pink-900 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl top-20 left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl bottom-20 right-10 animate-pulse" />

      <div className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        <header className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-shadow-lg">
            {headerText}
            <span className="blinking-cursor">|</span>
          </h1>
        </header>

        <main className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/10 mt-10">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
              <AlertTriangle className="w-5 h-5 mr-3" />
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Dismiss error">
                <X size={18} />
              </button>
            </div>
          )}

          <InputSection userText={userText} setUserText={setUserText} handleFileChange={handleFileChange} fileStatus={fileStatus} />

          <Controls
            setDifficulty={setDifficulty}
            handleGenerateQuiz={handleGenerateQuiz}
            handleGenerateExplanation={handleGenerateExplanation}
            handleGenerateMindMap={handleGenerateMindMap}
            handleGenerateFlashcards={handleGenerateFlashcards}
            handleShowNotes={() => setView("notes")}
            isLoading={isLoading}
          />
        </main>

        <div className="mt-8 bg-black/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 min-h-[200px] overflow-hidden relative">
          {view !== "welcome" && !isLoading && (
            <button onClick={handleReset} className="absolute top-4 left-4 text-pink-300 hover:text-white transition-colors flex items-center gap-2 text-sm z-20">
              <RefreshCw size={14} /> Start Over
            </button>
          )}
          {renderContent()}
        </div>

        <Footer />
      </div>

      {isChatOpen ? (
        <Draggable nodeRef={nodeRef} handle=".handle">
          <div
            ref={nodeRef}
            className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-[#2c132a] border border-white/20 rounded-2xl shadow-2xl flex flex-col h-[500px] max-h-[calc(100vh-2rem)] z-50"
            role="dialog"
            aria-labelledby="chat-title"
          >
            <div className="handle cursor-move p-4 bg-black/20 rounded-t-2xl border-b border-white/10 flex justify-between items-center">
              <h3 id="chat-title" className="font-bold text-white">AI Chat Assistant</h3>
              <button onClick={() => setIsChatOpen(false)} className="text-pink-200 hover:text-white" aria-label="Close chat">
                <X size={20} />
              </button>
            </div>
            <Chatbot history={explanationData.history} onSendMessage={handleSendChatMessage} isLoading={isChatLoading} />
          </div>
        </Draggable>
      ) : (
        view !== "quiz" && (
          <button onClick={() => setIsChatOpen(true)} className="fixed bottom-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50" aria-label="Open chat">
            <MessageSquare size={28} />
          </button>
        )
      )}

      <style>{`
        .text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
        .blinking-cursor { animation: blink 1s step-end infinite; }
        @keyframes blink { from, to { color: transparent; } 50% { color: #f472b6; } }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <NotesProvider>
      <DashboardContent />
    </NotesProvider>
  );
}