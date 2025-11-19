"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { LogOut, MessageSquare, User, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin'); // Kick out if not logged in
      } else {
        setUser(currentUser);
        fetchMessages(); // Load data only if logged in
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Function to get messages from Firebase
  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <nav className="bg-oxford text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">Admin Control Center</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden md:block">{user?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-600 px-4 py-2 rounded-lg transition-all text-sm font-bold border border-red-500/50">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gold/20 rounded-xl text-oxford">
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-oxford">Inbox</h2>
            <p className="text-slate-gray">You have {messages.length} messages.</p>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 py-12">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                  <div className="flex items-center gap-3 mb-2 md:mb-0">
                    <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-oxford">{msg.name}</h3>
                      <p className="text-xs text-slate-500">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    {/* Convert Firestore Timestamp to Readable Date */}
                    {msg.timestamp?.seconds 
                      ? new Date(msg.timestamp.seconds * 1000).toLocaleDateString() + " " + new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()
                      : "Just now"}
                  </div>
                </div>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-gray-100 text-sm leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}