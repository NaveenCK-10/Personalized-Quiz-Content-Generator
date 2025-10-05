import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 text-white pt-24">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mt-4 text-shadow-lg">Welcome Back!</h1>
            <p className="text-lg text-pink-200 mt-2">Log in to continue your learning journey.</p>
        </div>
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20">
            <form onSubmit={handleLogin} className="space-y-6">
                 {error && <p className="bg-red-500/30 text-red-200 p-3 rounded-lg text-center">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-pink-200">Email Address</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-pink-200">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                </div>
                <button type="submit" className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition-transform">
                    <LogIn size={18} />
                    Log In
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-pink-200">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-pink-400 hover:text-pink-300">
                    Sign up
                </Link>
            </p>
        </div>
        <style jsx>{`.text-shadow-lg { text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }`}</style>
    </div>
  );
}
