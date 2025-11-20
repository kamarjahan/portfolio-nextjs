"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { 
  LogOut, MessageSquare, Layout, Plus, Trash2, ExternalLink, 
  Image as ImageIcon, Award, Map, FileQuestion 
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('messages'); 
  
  // Data
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [requests, setRequests] = useState([]); // NEW: Certificate Requests
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Forms States
  const [newProject, setNewProject] = useState({ title: '', desc: '', tech: '', link: '', imageUrl: '' });
  const [newAchieve, setNewAchieve] = useState({ title: '', issuer: '', year: '' });
  const [newGoal, setNewGoal] = useState({ title: '', org: '', year: '', status: 'future', desc: '' });

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
      // Messages
      const msgSnap = await getDocs(query(collection(db, "messages"), orderBy("timestamp", "desc")));
      setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Projects
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Achievements
      const achieveSnap = await getDocs(collection(db, "achievements"));
      setAchievements(achieveSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // Roadmap
      const roadSnap = await getDocs(collection(db, "roadmap"));
      setRoadmap(roadSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      // NEW: Cert Requests
      const reqSnap = await getDocs(query(collection(db, "cert_requests"), orderBy("timestamp", "desc")));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "projects"), { ...newProject, createdAt: new Date() });
    setNewProject({ title: '', desc: '', tech: '', link: '', imageUrl: '' });
    fetchData();
  };
  const handleAddAchieve = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "achievements"), newAchieve);
    setNewAchieve({ title: '', issuer: '', year: '' });
    fetchData();
  };
  const handleAddGoal = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "roadmap"), newGoal);
    setNewGoal({ title: '', org: '', year: '', status: 'future', desc: '' });
    fetchData();
  };

  const deleteItem = async (collectionName, id) => {
    if(!confirm("Delete this item?")) return;
    await deleteDoc(doc(db, collectionName, id));
    fetchData();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-oxford text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Kamar<span className="text-gold">Admin</span></h1>
        <nav className="space-y-2 flex-1">
          <MenuBtn icon={<MessageSquare size={20}/>} label="Messages" active={activeTab==='messages'} onClick={()=>setActiveTab('messages')} />
          <MenuBtn icon={<Layout size={20}/>} label="Projects" active={activeTab==='projects'} onClick={()=>setActiveTab('projects')} />
          <MenuBtn icon={<Award size={20}/>} label="Achievements" active={activeTab==='achievements'} onClick={()=>setActiveTab('achievements')} />
          <MenuBtn icon={<Map size={20}/>} label="Goals / Roadmap" active={activeTab==='roadmap'} onClick={()=>setActiveTab('roadmap')} />
          <MenuBtn icon={<FileQuestion size={20}/>} label="Cert Requests" active={activeTab==='requests'} onClick={()=>setActiveTab('requests')} />
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-white mt-6">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-oxford mb-6">Inbox ({messages.length})</h2>
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold">{msg.name} <span className="text-xs text-slate-400 font-normal">({msg.email})</span></h3>
                <p className="text-slate-600 mt-1">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gold">
              <h3 className="font-bold mb-4 flex gap-2"><Plus/> Add Project</h3>
              <form onSubmit={handleAddProject} className="grid gap-4">
                <input className="p-3 border rounded" placeholder="Title" value={newProject.title} onChange={e=>setNewProject({...newProject, title:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Tech Stack" value={newProject.tech} onChange={e=>setNewProject({...newProject, tech:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Image URL" value={newProject.imageUrl} onChange={e=>setNewProject({...newProject, imageUrl:e.target.value})} />
                <input className="p-3 border rounded" placeholder="Link" value={newProject.link} onChange={e=>setNewProject({...newProject, link:e.target.value})} />
                <textarea className="p-3 border rounded" placeholder="Description" value={newProject.desc} onChange={e=>setNewProject({...newProject, desc:e.target.value})} required />
                <button className="bg-oxford text-white py-3 rounded font-bold">Add Project</button>
              </form>
            </div>
            <div className="grid gap-4">
               {projects.map(p => <ItemCard key={p.id} title={p.title} sub={p.tech} onDelete={()=>deleteItem('projects', p.id)} />)}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
              <h3 className="font-bold mb-4 flex gap-2"><Plus/> Add Achievement</h3>
              <form onSubmit={handleAddAchieve} className="grid gap-4">
                <input className="p-3 border rounded" placeholder="Course Name" value={newAchieve.title} onChange={e=>setNewAchieve({...newAchieve, title:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Issuer" value={newAchieve.issuer} onChange={e=>setNewAchieve({...newAchieve, issuer:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Year" value={newAchieve.year} onChange={e=>setNewAchieve({...newAchieve, year:e.target.value})} required />
                <button className="bg-blue-600 text-white py-3 rounded font-bold">Add Achievement</button>
              </form>
            </div>
            <div className="grid gap-4">
               {achievements.map(a => <ItemCard key={a.id} title={a.title} sub={`${a.issuer} • ${a.year}`} onDelete={()=>deleteItem('achievements', a.id)} />)}
            </div>
          </div>
        )}

        {/* GOALS */}
        {activeTab === 'roadmap' && (
           <div className="space-y-8">
           <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
             <h3 className="font-bold mb-4 flex gap-2"><Plus/> Add Goal</h3>
             <form onSubmit={handleAddGoal} className="grid gap-4">
               <input className="p-3 border rounded" placeholder="Goal Title" value={newGoal.title} onChange={e=>setNewGoal({...newGoal, title:e.target.value})} required />
               <input className="p-3 border rounded" placeholder="Organization" value={newGoal.org} onChange={e=>setNewGoal({...newGoal, org:e.target.value})} required />
               <input className="p-3 border rounded" placeholder="Year" value={newGoal.year} onChange={e=>setNewGoal({...newGoal, year:e.target.value})} required />
               <select className="p-3 border rounded" value={newGoal.status} onChange={e=>setNewGoal({...newGoal, status:e.target.value})}>
                  <option value="completed">Completed</option>
                  <option value="current">In Progress</option>
                  <option value="future">Future</option>
               </select>
               <button className="bg-green-600 text-white py-3 rounded font-bold">Add to Roadmap</button>
             </form>
           </div>
           <div className="grid gap-4">
              {roadmap.map(r => <ItemCard key={r.id} title={r.title} sub={`${r.status} • ${r.year}`} onDelete={()=>deleteItem('roadmap', r.id)} />)}
           </div>
         </div>
        )}

        {/* NEW: CERT REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold text-oxford mb-6">Certificate Requests ({requests.length})</h2>
            {requests.length === 0 && <p className="text-slate-400">No requests yet.</p>}
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-4 mb-4 rounded-xl shadow-sm border-l-4 border-gold flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Requested for:</p>
                  <h3 className="font-bold text-lg text-oxford">{req.achievement}</h3>
                  <p className="text-slate-600 mt-2 font-medium">Contact: <span className="text-blue-600">{req.contact}</span></p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(req.timestamp?.seconds * 1000).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteItem('cert_requests', req.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2/></button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

function MenuBtn({icon, label, active, onClick}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-gold text-oxford font-bold' : 'hover:bg-white/10'}`}>
      {icon} {label}
    </button>
  )
}

function ItemCard({title, sub, onDelete}) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div>
        <h4 className="font-bold text-oxford">{title}</h4>
        <p className="text-xs text-slate-500 uppercase">{sub}</p>
      </div>
      <button onClick={onDelete} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
    </div>
  )
}