"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy 
} from 'firebase/firestore';
import { 
  LogOut, MessageSquare, Layout, Plus, Trash2, Pencil, 
  Award, Map, FileQuestion, PenTool, Loader2, Save, UploadCloud, Link as LinkIcon 
} from 'lucide-react';

// --- CONFIGURATION ---
// Replace with your Cloudinary info
const CLOUDINARY_PRESET = "Portfolio_me"; 
const CLOUDINARY_CLOUD_NAME = "dboikgfsn"; 

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('projects'); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const router = useRouter();
  
  // Data States
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Editing States
  const [editId, setEditId] = useState(null);

  // Forms
  const [projectForm, setProjectForm] = useState({ title: '', desc: '', tech: '', link: '', imageUrl: '' });
  const [achieveForm, setAchieveForm] = useState({ title: '', issuer: '', year: '' });
  const [goalForm, setGoalForm] = useState({ title: '', org: '', year: '', status: 'future', desc: '' });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', category: 'Finance', imageUrl: '' });

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
      const msgSnap = await getDocs(query(collection(db, "messages"), orderBy("timestamp", "desc")));
      setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const achieveSnap = await getDocs(collection(db, "achievements"));
      setAchievements(achieveSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const roadSnap = await getDocs(collection(db, "roadmap"));
      setRoadmap(roadSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const reqSnap = await getDocs(query(collection(db, "cert_requests"), orderBy("timestamp", "desc")));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const blogSnap = await getDocs(query(collection(db, "blogs"), orderBy("date", "desc")));
      setBlogs(blogSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  const resetForms = () => {
    setProjectForm({ title: '', desc: '', tech: '', link: '', imageUrl: '' });
    setBlogForm({ title: '', content: '', category: 'Finance', imageUrl: '' });
    setAchieveForm({ title: '', issuer: '', year: '' });
    setGoalForm({ title: '', org: '', year: '', status: 'future', desc: '' });
    setEditId(null);
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e, formSetter, currentForm) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        formSetter({ ...currentForm, imageUrl: data.secure_url });
      } else {
        alert("Upload failed. Check Cloudinary settings.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploadingImg(false);
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        if (editId) await updateDoc(doc(db, "projects", editId), projectForm);
        else await addDoc(collection(db, "projects"), { ...projectForm, createdAt: new Date() });
        resetForms();
        fetchData();
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        const blogData = {
            ...blogForm,
            readTime: Math.ceil(blogForm.content.split(' ').length / 200) + " min read",
            date: editId ? blogForm.date || new Date() : new Date()
        };
        if (editId) await updateDoc(doc(db, "blogs", editId), blogData);
        else await addDoc(collection(db, "blogs"), blogData);
        resetForms();
        fetchData();
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  // Standard Add Handlers
  const handleAddAchieve = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "achievements"), achieveForm);
    resetForms();
    fetchData();
  };
  const handleAddGoal = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "roadmap"), goalForm);
    resetForms();
    fetchData();
  };

  const deleteItem = async (collectionName, id) => {
    if(!confirm("Delete this item?")) return;
    await deleteDoc(doc(db, collectionName, id));
    fetchData();
  };

  const startEdit = (item, type) => {
    setEditId(item.id);
    if(type === 'project') setProjectForm(item);
    if(type === 'blog') setBlogForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => { await signOut(auth); router.push('/admin'); };

  if (loading) return <div className="h-screen flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-oxford text-white p-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8">Kamar<span className="text-gold">Admin</span></h1>
        <nav className="space-y-2 flex-1">
          <MenuBtn icon={<Layout size={20}/>} label="Projects" active={activeTab==='projects'} onClick={()=>{setActiveTab('projects'); resetForms();}} />
          <MenuBtn icon={<PenTool size={20}/>} label="Insights / Blog" active={activeTab==='blogs'} onClick={()=>{setActiveTab('blogs'); resetForms();}} />
          <MenuBtn icon={<MessageSquare size={20}/>} label="Messages" active={activeTab==='messages'} onClick={()=>setActiveTab('messages')} />
          <MenuBtn icon={<Award size={20}/>} label="Achievements" active={activeTab==='achievements'} onClick={()=>setActiveTab('achievements')} />
          <MenuBtn icon={<Map size={20}/>} label="Roadmap" active={activeTab==='roadmap'} onClick={()=>setActiveTab('roadmap')} />
          <MenuBtn icon={<FileQuestion size={20}/>} label="Requests" active={activeTab==='requests'} onClick={()=>setActiveTab('requests')} />
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-white mt-6"><LogOut size={16} /> Logout</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-slate-50">
        
        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-3xl font-bold text-oxford mb-6">Inbox ({messages.length})</h2>
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-6 mb-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{msg.name}</h3>
                    <span className="text-xs text-slate-400">{msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                </div>
                <p className="text-sm text-blue-600 mb-2">{msg.email}</p>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className={`p-6 rounded-xl shadow-lg border-t-4 transition-colors ${editId ? 'bg-blue-50 border-blue-600' : 'bg-white border-gold'}`}>
              <h3 className="font-bold mb-4 flex gap-2 items-center text-xl">
                {editId ? <><Pencil size={20}/> Edit Project</> : <><Plus size={20}/> Add Project</>}
              </h3>
              
              <form onSubmit={handleProjectSubmit} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <input className="p-3 border rounded focus:outline-gold" placeholder="Title" value={projectForm.title} onChange={e=>setProjectForm({...projectForm, title:e.target.value})} required />
                    <input className="p-3 border rounded focus:outline-gold" placeholder="Tech Stack" value={projectForm.tech} onChange={e=>setProjectForm({...projectForm, tech:e.target.value})} required />
                </div>
                
                {/* --- HYBRID IMAGE SECTION --- */}
                <div className="border p-4 rounded bg-slate-50">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Project Image</label>
                    
                    {/* Option 1: Upload */}
                    <div className="flex gap-4 items-center mb-3">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setProjectForm, projectForm)} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-oxford file:text-white hover:file:bg-slate-700 cursor-pointer"
                        />
                        {uploadingImg && <Loader2 className="animate-spin text-gold" />}
                    </div>

                    <div className="text-center text-xs font-bold text-slate-400 mb-2">- OR PASTE LINK -</div>

                    {/* Option 2: Paste Link */}
                    <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input 
                            className="p-3 pl-10 border rounded w-full text-sm focus:outline-gold" 
                            placeholder="https://example.com/image.jpg" 
                            value={projectForm.imageUrl} 
                            onChange={e=>setProjectForm({...projectForm, imageUrl:e.target.value})} 
                        />
                    </div>

                    {projectForm.imageUrl && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1 font-bold">
                            <UploadCloud size={14}/> Image Ready! 
                            <a href={projectForm.imageUrl} target="_blank" className="underline ml-1">Preview</a>
                        </div>
                    )}
                </div>
                {/* ----------------------------- */}

                <input className="p-3 border rounded focus:outline-gold" placeholder="Project Link (URL)" value={projectForm.link} onChange={e=>setProjectForm({...projectForm, link:e.target.value})} />
                <textarea className="p-3 border rounded h-32 focus:outline-gold" placeholder="Description" value={projectForm.desc} onChange={e=>setProjectForm({...projectForm, desc:e.target.value})} required />
                
                <div className="flex gap-2">
                    <button disabled={submitting || uploadingImg} className="flex-1 bg-oxford text-white py-3 rounded font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin"/> : (editId ? <><Save size={18}/> Update Project</> : <><Plus size={18}/> Add Project</>)}
                    </button>
                    {editId && <button type="button" onClick={resetForms} className="px-6 border border-red-200 text-red-500 rounded font-bold hover:bg-red-50">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="grid gap-4">
               {projects.map(p => <ItemCard key={p.id} title={p.title} sub={p.tech} onEdit={() => startEdit(p, 'project')} onDelete={()=>deleteItem('projects', p.id)} />)}
            </div>
          </div>
        )}

        {/* BLOGS TAB */}
        {activeTab === 'blogs' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className={`p-6 rounded-xl shadow-lg border-t-4 transition-colors ${editId ? 'bg-blue-50 border-blue-600' : 'bg-white border-purple-600'}`}>
              <h3 className="font-bold mb-4 flex gap-2 items-center text-xl">
                 {editId ? <><Pencil size={20}/> Edit Article</> : <><Plus size={20}/> Write New Article</>}
              </h3>
              <form onSubmit={handleBlogSubmit} className="grid gap-4">
                <input className="p-3 border rounded focus:outline-purple-500" placeholder="Article Title" value={blogForm.title} onChange={e=>setBlogForm({...blogForm, title:e.target.value})} required />
                
                <div className="flex gap-4">
                    <select className="p-3 border rounded w-1/3 focus:outline-purple-500" value={blogForm.category} onChange={e=>setBlogForm({...blogForm, category:e.target.value})}>
                        <option>Finance</option>
                        <option>Tech</option>
                        <option>Audit</option>
                        <option>General</option>
                    </select>
                </div>

                {/* --- HYBRID IMAGE SECTION (BLOGS) --- */}
                <div className="border p-4 rounded bg-slate-50">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image</label>
                    
                    <div className="flex gap-4 items-center mb-3">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setBlogForm, blogForm)} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                        {uploadingImg && <Loader2 className="animate-spin text-purple-600" />}
                    </div>

                    <div className="text-center text-xs font-bold text-slate-400 mb-2">- OR PASTE LINK -</div>

                    <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400"/>
                        <input 
                            className="p-3 pl-10 border rounded w-full text-sm focus:outline-purple-500" 
                            placeholder="https://example.com/image.jpg" 
                            value={blogForm.imageUrl} 
                            onChange={e=>setBlogForm({...blogForm, imageUrl:e.target.value})} 
                        />
                    </div>
                    {blogForm.imageUrl && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1 font-bold">
                            <UploadCloud size={14}/> Image Ready!
                        </div>
                    )}
                </div>
                {/* ----------------------------- */}

                <textarea className="p-3 border rounded h-48 focus:outline-purple-500" placeholder="Write your thoughts here..." value={blogForm.content} onChange={e=>setBlogForm({...blogForm, content:e.target.value})} required />
                
                <div className="flex gap-2">
                    <button disabled={submitting || uploadingImg} className="flex-1 bg-purple-600 text-white py-3 rounded font-bold hover:bg-purple-700 flex justify-center items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin"/> : (editId ? <><Save size={18}/> Update Article</> : <><Plus size={18}/> Publish Article</>)}
                    </button>
                    {editId && <button type="button" onClick={resetForms} className="px-6 border border-red-200 text-red-500 rounded font-bold hover:bg-red-50">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="grid gap-4">
               {blogs.map(b => <ItemCard key={b.id} title={b.title} sub={`${b.category} • ${b.date?.seconds ? new Date(b.date.seconds * 1000).toLocaleDateString() : 'No Date'}`} onEdit={() => startEdit(b, 'blog')} onDelete={()=>deleteItem('blogs', b.id)} />)}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
              <h3 className="font-bold mb-4 flex gap-2"><Plus/> Add Achievement</h3>
              <form onSubmit={handleAddAchieve} className="grid gap-4">
                <input className="p-3 border rounded" placeholder="Course Name" value={achieveForm.title} onChange={e=>setAchieveForm({...achieveForm, title:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Issuer" value={achieveForm.issuer} onChange={e=>setAchieveForm({...achieveForm, issuer:e.target.value})} required />
                <input className="p-3 border rounded" placeholder="Year" value={achieveForm.year} onChange={e=>setAchieveForm({...achieveForm, year:e.target.value})} required />
                <button className="bg-blue-600 text-white py-3 rounded font-bold">Add Achievement</button>
              </form>
            </div>
            <div className="grid gap-4">
               {achievements.map(a => <ItemCard key={a.id} title={a.title} sub={`${a.issuer} • ${a.year}`} onDelete={()=>deleteItem('achievements', a.id)} />)}
            </div>
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
           <div className="space-y-8 max-w-4xl mx-auto">
           <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
             <h3 className="font-bold mb-4 flex gap-2"><Plus/> Add Goal</h3>
             <form onSubmit={handleAddGoal} className="grid gap-4">
               <input className="p-3 border rounded" placeholder="Goal Title" value={goalForm.title} onChange={e=>setGoalForm({...goalForm, title:e.target.value})} required />
               <input className="p-3 border rounded" placeholder="Organization" value={goalForm.org} onChange={e=>setGoalForm({...goalForm, org:e.target.value})} required />
               <input className="p-3 border rounded" placeholder="Year" value={goalForm.year} onChange={e=>setGoalForm({...goalForm, year:e.target.value})} required />
               <select className="p-3 border rounded" value={goalForm.status} onChange={e=>setGoalForm({...goalForm, status:e.target.value})}>
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

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold text-oxford mb-6">Requests ({requests.length})</h2>
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-4 mb-4 rounded-xl shadow-sm border-l-4 border-gold flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-oxford">{req.achievement}</h3>
                  <p className="text-slate-600 mt-2">Contact: <span className="text-blue-600">{req.contact}</span></p>
                  <p className="text-xs text-slate-400 mt-2">{req.timestamp?.seconds ? new Date(req.timestamp.seconds * 1000).toLocaleString() : ''}</p>
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
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${active ? 'bg-gold text-oxford font-bold shadow-md' : 'hover:bg-white/10'}`}>{icon} {label}</button>
}

function ItemCard({title, sub, onDelete, onEdit}) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div>
        <h4 className="font-bold text-oxford">{title}</h4>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{sub}</p>
      </div>
      <div className="flex gap-2">
        {onEdit && <button onClick={onEdit} className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors" title="Edit"><Pencil size={18}/></button>}
        <button onClick={onDelete} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Delete"><Trash2 size={18}/></button>
      </div>
    </div>
  )
}
