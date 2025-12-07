"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ExternalLink, Loader2, AlertCircle, X, Calendar, Tag, Search } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Popup
  const [selectedProject, setSelectedProject] = useState(null);
  // State for Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsRef = collection(db, "projects");
        const projSnap = await getDocs(projectsRef); 
        
        const projectList = projSnap.docs.map(d => ({ 
            id: d.id, 
            ...d.data() 
        }));

        setProjects(projectList);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter Logic: filters based on Title, Tech, or Description
  const filteredProjects = projects.filter((proj) => {
    const query = searchQuery.toLowerCase();
    return (
      proj.title?.toLowerCase().includes(query) ||
      proj.tech?.toLowerCase().includes(query) ||
      proj.desc?.toLowerCase().includes(query)
    );
  });

  const closeModal = () => setSelectedProject(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-oxford dark:text-white font-sans relative">
      
      {/* Header */}
      <nav className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">All<span className="text-gold">Projects</span></h1>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-oxford dark:hover:text-white">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-oxford dark:text-white mb-4">My Complete Portfolio</h2>
          <p className="text-slate-500 dark:text-slate-400">A collection of my technical and financial projects.</p>
        </div>

        {/* ------------------------------------------- */}
        {/* SEARCH BAR SECTION                          */}
        {/* ------------------------------------------- */}
        <div className="max-w-xl mx-auto mb-12 relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name, tech, or description..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* Error State */}
        {error && (
            <div className="flex flex-col items-center justify-center py-10 text-red-500">
                <AlertCircle size={48} className="mb-2" />
                <p>{error}</p>
            </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-20 flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" /> Loading Projects...
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            {filteredProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">No projects match your search.</p>
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="text-gold font-bold mt-2 hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((proj) => (
                    <div 
                        key={proj.id} 
                        onClick={() => setSelectedProject(proj)}
                        className="group bg-white dark:bg-slate-card p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 hover:-translate-y-2 transition-all flex flex-col h-full cursor-pointer"
                    >
                        {proj.imageUrl && (
                            <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-900">
                                <img 
                                    src={proj.imageUrl} 
                                    alt={proj.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        )}
                        <h3 className="font-bold text-xl text-oxford dark:text-white mb-2">{proj.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3">
                            {proj.desc}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4">
                            <span className="text-xs font-bold text-gold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                                {proj.tech}
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                                View Details
                            </span>
                        </div>
                    </div>
                    ))}
                </div>
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------- */}
      {/* POPUP MODAL                                 */}
      {/* ------------------------------------------- */}
      {selectedProject && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
        >
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 relative animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-10"
                >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>

                <div>
                    {selectedProject.imageUrl && (
                        <div className="w-full h-64 md:h-80 bg-gray-100 dark:bg-slate-950 relative">
                             <img 
                                src={selectedProject.imageUrl} 
                                alt={selectedProject.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-gold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                                    <Tag size={12} /> {selectedProject.tech}
                                </span>
                                {selectedProject.date && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar size={12} /> {selectedProject.date}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-oxford dark:text-white">
                                {selectedProject.title}
                            </h2>
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedProject.desc}
                        </div>

                        {selectedProject.link && (
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <a 
                                    href={selectedProject.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-oxford dark:bg-white text-white dark:text-oxford px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                                >
                                    Visit Project <ExternalLink size={18} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
