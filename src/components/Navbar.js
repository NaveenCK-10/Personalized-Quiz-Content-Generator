import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Bot, History, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="absolute top-0 left-0 w-full p-6 z-20 text-white">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center bg-black/20 backdrop-blur-lg rounded-full border border-white/10">
        <Link to="/" className="flex items-center gap-2">
            <Bot className="text-pink-400" />
            <span className="font-bold text-xl text-white">AI Learn</span>
        </Link>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 font-semibold hover:text-pink-300 transition">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/history" className="flex items-center gap-2 font-semibold hover:text-pink-300 transition">
                    <History size={20} />
                    <span>History</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 font-semibold hover:text-pink-300 transition">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-semibold hover:text-pink-300 transition">
                Log In
              </Link>
              <Link to="/signup" className="bg-white/10 backdrop-blur-md font-semibold py-2 px-5 rounded-full border border-white/20 hover:bg-white/20 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
