"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { LogOut, MessageSquare, Layout, Plus, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('messages'); 
  
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Updated Form State with Image URL
  const [newProject, setNewProject] = useState({ title: '', desc: '', tech: '', link: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/admin');
      else {
        setUser(currentUser);
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const msgQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const msgSnap = await getDocs(msgQuery);
      setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "projects"), {
        ...newProject,
        createdAt: new Date()
      });
      setNewProject({ title: '', desc: '', tech: '', link: '', imageUrl: '' }); 
      fetchData(); 
      alert("Project Added Successfully!");
    } catch (error) {
      alert("Error adding project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if(!confirm("Are you sure you want to delete this project?")) return;
    await deleteDoc(doc(db, "projects", id));
    fetchData();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-oxford text-white hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-10">Kamar<span className="text-gold">Admin</span></h1>
        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-gold text-oxford font-bold' : 'hover:bg-white/10'}`}
          >
            <MessageSquare size={20} /> Messages
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'projects' ? 'bg-gold text-oxford font-bold' : 'hover:bg-white/10'}`}
          >
            <Layout size={20} /> Manage Projects
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-white transition-colors mt-auto">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-xl font-bold text-oxford">Admin Panel</h1>
          <button onClick={handleLogout} className="text-red-500"><LogOut size={20}/></button>
        </div>

        {/* --- MESSAGES TAB --- */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-oxford mb-6">Inbox ({messages.length})</h2>
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-oxford">{msg.name}</h3>
                  <span className="text-xs text-slate-400">{new Date(msg.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gold mb-2">{msg.email}</p>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-oxford">Project Manager</h2>
            
            {/* Add Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gold">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20}/> Add New Project</h3>
              <form onSubmit={handleAddProject} className="grid gap-4">
                <input 
                  className="p-3 border rounded-lg outline-none focus:border-oxford" 
                  placeholder="Project Title" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  required
                />
                 <input 
                  className="p-3 border rounded-lg outline-none focus:border-oxford" 
                  placeholder="Tech Stack" 
                  value={newProject.tech}
                  onChange={(e) => setNewProject({...newProject, tech: e.target.value})}
                  required
                />
                {/* NEW: Image URL Input */}
                <div className="flex gap-2 items-center border rounded-lg p-3 focus-within:border-oxford">
                  <ImageIcon size={20} className="text-slate-400" />
                  <input 
                    className="w-full outline-none" 
                    placeholder="Paste Image URL here (e.g. from ImgBB)" 
                    value={newProject.imageUrl}
                    onChange={(e) => setNewProject({...newProject, imageUrl: e.target.value})}
                  />
                </div>

                <input 
                  className="p-3 border rounded-lg outline-none focus:border-oxford" 
                  placeholder="Live Link or GitHub URL" 
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                />
                <textarea 
                  className="p-3 border rounded-lg outline-none focus:border-oxford" 
                  placeholder="Short Description..." 
                  rows="3"
                  value={newProject.desc}
                  onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
                  required
                />
                <button disabled={submitting} className="bg-oxford text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">
                  {submitting ? 'Saving...' : 'Publish Project'}
                </button>
              </form>
            </div>

            {/* Existing Projects List */}
            <div className="grid gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-4">
                    {/* Show Thumbnail if exists */}
                    {proj.imageUrl && <img src={proj.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                    <div>
                      <h4 className="font-bold text-oxford">{proj.title}</h4>
                      <p className="text-xs text-slate-500">{proj.tech}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {proj.link && <a href={proj.link} target="_blank" className="text-blue-500"><ExternalLink size={18}/></a>}
                    <button onClick={() => handleDeleteProject(proj.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}