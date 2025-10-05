import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { FileText, HelpCircle, Sparkles } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

/**
 * Custom hook for a stable typing effect.
 * @param {string[]} phrases - The array of phrases to type out.
 * @param {number} typingSpeed - The speed of typing (in ms).
 * @param {number} deletingSpeed - The speed of deleting (in ms).
 * @param {number} pauseTime - The pause time after a phrase is fully typed (in ms).
 * @returns {string} The current text to display.
 */
const useTypingEffect = (phrases, typingSpeed = 45, deletingSpeed = 28, pauseTime = 1200) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!phrases.length) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];
    
    // Determine the next action and speed
    const timeout = isDeleting ? deletingSpeed : typingSpeed;
    
    const ticker = setTimeout(() => {
      // Logic for typing a character
      if (!isDeleting && displayText.length < currentPhrase.length) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
      }
      // Logic for pausing and starting to delete
      else if (!isDeleting && displayText.length === currentPhrase.length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      }
      // Logic for deleting a character
      else if (isDeleting && displayText.length > 0) {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
      }
      // Logic for moving to the next phrase
      else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false);
        setPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
      }
    }, timeout);

    return () => clearTimeout(ticker);

  }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
};


export default function Home() {
  const [user] = useAuthState(auth);

  const phrases = [
    "Unlock Your Learning Potential with AI ✨",
    "Master Any Topic Instantly 🧠",
    "Create Quizzes from Any Content ✍️",
  ];
  const displayText = useTypingEffect(phrases, 45, 28, 1200);

  const controls = useAnimation();
  const sectionRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          controls.start("visible");
        }
      },
      { threshold: 0.15 }
    );

    ob.observe(node);
    return () => ob.disconnect();
  }, [controls]);

  const featureVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.18, duration: 0.6, ease: "easeOut" },
    }),
  };

  const features = [
    {
      icon: <FileText size={48} className="mx-auto text-pink-400 mb-6" />,
      title: "Upload Anything",
      desc: "Provide your notes, PDFs, or any text content you want to master.",
    },
    {
      icon: <HelpCircle size={48} className="mx-auto text-purple-400 mb-6" />,
      title: "Generate Quizzes",
      desc: "Instantly create interactive quizzes to test and sharpen your knowledge.",
    },
    {
      icon: <Sparkles size={48} className="mx-auto text-yellow-400 mb-6" />,
      title: "Get Explanations",
      desc: "Receive clear, detailed explanations and chat with an AI tutor for deeper understanding.",
    },
  ];

  return (
    <div className="min-h-screen text-white font-sans relative overflow-hidden bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-[28rem] h-[28rem] bg-purple-500/20 rounded-full blur-3xl bottom-20 right-10 animate-pulse"></div>
      <div className="absolute w-[20rem] h-[20rem] bg-blue-500/10 rounded-full blur-3xl top-1/3 left-1/2 animate-pulse"></div>

      <div className="relative z-10 container mx-auto px-6 pt-40 pb-20">
        <header className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white text-shadow-lg"
          >
            <span className="inline-flex items-baseline">
              <span className="whitespace-pre-wrap">{displayText}</span>
              <span
                aria-hidden
                className="ml-1 inline-block h-[1em] w-[2px] translate-y-[2px] bg-pink-300 animate-pulse"
              ></span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-pink-200 max-w-3xl mx-auto"
          >
            Transform your study materials into interactive quizzes and clear explanations instantly. Your personalized learning journey starts here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            className="mt-10"
          >
            <Link
              to={user ? "/dashboard" : "/login"}
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl hover:scale-110 hover:shadow-pink-500/40 transition-transform duration-300 will-change-transform"
            >
              Get Started
            </Link>
          </motion.div>
        </header>

        <section ref={sectionRef} className="mt-24">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={featureVariants}
                initial="hidden"
                animate={controls}
                className="feature-card hover:scale-105 transition-transform duration-300 will-change-transform"
              >
                {feature.icon}
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-pink-200 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse { animation: none !important; }
        }
        .text-shadow-lg {
          text-shadow: 0 0 25px rgba(236, 72, 153, 0.6), 0 0 40px rgba(168, 85, 247, 0.4);
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }
      `}</style>
    </div>
  );
}