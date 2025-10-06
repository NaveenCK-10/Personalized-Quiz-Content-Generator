import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans relative overflow-hidden bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Animated background elements - same as Home */}
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-[28rem] h-[28rem] bg-purple-500/20 rounded-full blur-3xl bottom-20 right-10 animate-pulse"></div>
      <div className="absolute w-[20rem] h-[20rem] bg-blue-500/10 rounded-full blur-3xl top-1/3 left-1/2 animate-pulse"></div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">
            Create Your Account
          </h1>
          <p className="text-lg text-pink-200 mt-4 max-w-md mx-auto">
            Join and start learning with AI today!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          className="w-full max-w-md auth-card"
        >
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-lg text-center backdrop-blur-sm"
              >
                {error}
              </motion.p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center items-center gap-3 py-4 px-6 rounded-full text-base font-bold bg-gradient-to-r from-pink-500 to-purple-600 shadow-xl transition-all duration-300 will-change-transform ${
                submitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:scale-110 hover:shadow-pink-500/40'
              }`}
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <UserPlus size={20} />
              )}
              {submitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-pink-200">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-bold text-pink-400 hover:text-pink-300 transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse { animation: none !important; }
        }
        .text-shadow-lg {
          text-shadow: 0 0 25px rgba(236, 72, 153, 0.6), 0 0 40px rgba(168, 85, 247, 0.4);
        }
        .auth-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          padding: 2.5rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .auth-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.95rem;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .auth-input:focus {
          outline: none;
          border-color: rgba(236, 72, 153, 0.6);
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
