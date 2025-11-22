"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, Search, Filter, MessageCircle, Send, User, 
  Calendar, XCircle, Loader2, Clock 
} from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export default function InsightsPage() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'oldest'
  
  // Reading State
  const [readBlog, setReadBlog] = useState(null);
  
  // Comment States
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentStatus, setCommentStatus] = useState('idle');

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogSnap = await getDocs(collection(db, "blogs"));
      const data = blogSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Initial Sort (Latest)
      const sorted = data.sort((a, b) => b.date?.seconds - a.date?.seconds);
      
      setBlogs(sorted);
      setFilteredBlogs(sorted);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  // Handle Sorting
  const handleSort = (order) => {
    setSortOrder(order);
    const sorted = [...blogs].sort((a, b) => {
      return order === 'latest' 
        ? b.date?.seconds - a.date?.seconds 
        : a.date?.seconds - b.date?.seconds;
    });
    setFilteredBlogs(sorted);
  };

  // Fetch Comments when opening a blog
  const openBlog = async (blog) => {
    setReadBlog(blog);
    // Fetch comments for this specific blog ID
    const q = query(collection(db, "comments"), where("blogId", "==", blog.id), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    setComments(snap.docs.map(d => d.data()));
  };

  // Post Comment
  // Post Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    setCommentStatus('loading');
    try {
      // 1. Prepare data for Database (Uses Server Time)
      const dbPayload = {
        blogId: readBlog.id,
        name: commentName || 'Anonymous',
        text: newComment,
        timestamp: serverTimestamp()
      };
      
      // 2. Prepare data for Local Display (Uses Your Computer's Time)
      // We fake the Firestore format { seconds: ... } so the list doesn't break
      const localPayload = {
        ...dbPayload,
        timestamp: { seconds: Date.now() / 1000 } 
      };
      
      // Send to DB
      await addDoc(collection(db, "comments"), dbPayload);
      
      // Update Screen Immediately with the Local version
      setComments([localPayload, ...comments]); 
      
      setNewComment('');
      setCommentStatus('success');
      setTimeout(() => setCommentStatus('idle'), 2000);
    } catch (error) {
      setCommentStatus('error');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-oxford font-sans">
      
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Insights<span className="text-gold">Hub</span></h1>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-oxford">
            <Home size={18} /> Back to Portfolio
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-oxford">Latest Articles</h2>
            <p className="text-slate-500">Thoughts on Finance, Tech, and the Future.</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
              onClick={() => handleSort('latest')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${sortOrder === 'latest' ? 'bg-oxford text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Latest
            </button>
            <button 
              onClick={() => handleSort('oldest')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${sortOrder === 'oldest' ? 'bg-oxford text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Oldest
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin" /> Loading Articles...
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} onClick={() => openBlog(blog)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full">
                {blog.imageUrl && <div className="w-full h-48 mb-4 overflow-hidden rounded-xl"><img src={blog.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase font-bold tracking-wider">{blog.category}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {blog.readTime}</span>
                </div>
                <h3 className="font-bold text-lg text-oxford mb-2 group-hover:text-gold transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{blog.content}</p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                   <span className="text-slate-400">{new Date(blog.date?.seconds * 1000).toLocaleDateString()}</span>
                   <span className="font-bold text-oxford group-hover:text-gold flex items-center gap-1">Read <Filter size={14}/></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- READER & COMMENT MODAL --- */}
      {readBlog && (
        <div className="fixed inset-0 z-[100] bg-oxford/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 relative animate-fade-up flex flex-col max-h-[90vh]">
            
            {/* Close */}
            <button onClick={() => setReadBlog(null)} className="absolute top-4 right-4 bg-slate-100 hover:bg-red-100 hover:text-red-500 p-2 rounded-full z-10 transition-colors"><XCircle size={24} /></button>
            
            {/* Content Scroll Area */}
            <div className="overflow-y-auto p-8 md:p-12">
                {/* Article Header */}
                <span className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">{readBlog.category}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-oxford mb-6">{readBlog.title}</h1>
                {readBlog.imageUrl && <img src={readBlog.imageUrl} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />}
                
                {/* Article Body */}
                <div className="prose max-w-none text-slate-700 leading-loose whitespace-pre-wrap text-lg">
                  {readBlog.content}
                </div>

                <hr className="my-12 border-gray-200" />

                {/* --- COMMENT SECTION --- */}
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-oxford mb-6 flex items-center gap-2"><MessageCircle /> Discussion ({comments.length})</h3>
                  
                  {/* Comment Form */}
                  <form onSubmit={handlePostComment} className="mb-8 space-y-3">
                    <input 
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-gold" 
                      placeholder="Your Name (Optional)"
                      value={commentName}
                      onChange={e=>setCommentName(e.target.value)}
                    />
                    <textarea 
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-gold" 
                      placeholder="Share your thoughts..." 
                      rows="3"
                      value={newComment}
                      onChange={e=>setNewComment(e.target.value)}
                      required
                    ></textarea>
                    <button disabled={commentStatus==='loading'} className="bg-oxford text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2">
                      {commentStatus === 'loading' ? <Loader2 className="animate-spin" size={16}/> : <><Send size={16}/> Post Comment</>}
                    </button>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4">
                    {comments.length === 0 && <p className="text-slate-400 text-sm italic">Be the first to comment.</p>}
                    {comments.map((c, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-gold/20 p-1 rounded-full text-oxford"><User size={14}/></div>
                          <span className="font-bold text-sm text-oxford">{c.name}</span>
                          <span className="text-xs text-slate-400">• {c.timestamp?.seconds 
  ? new Date(c.timestamp.seconds * 1000).toLocaleDateString() 
  : 'Just now'}
  </span>
                        </div>
                        <p className="text-slate-600 text-sm ml-8">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}