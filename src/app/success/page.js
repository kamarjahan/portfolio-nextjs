"use client";

import React from 'react';
import { CheckCircle, Download, Home, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-slate-light text-oxford flex items-center justify-center p-6">
      <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-2xl text-center border-t-8 border-green-500 animate-fade-up">
        
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold mb-2 text-oxford">Thank You!</h1>
        <p className="text-slate-500 mb-8 text-lg">
          Your support means the world to me. <br/>
          You are now an official supporter of my journey.
        </p>

        {/* Certificate Card */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-xl mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              PREMIUM
           </div>
           <Heart className="text-red-500 mx-auto mb-2" size={32} fill="currentColor" />
           <h3 className="font-bold text-xl mb-1">Certificate of Appreciation</h3>
           <p className="text-xs text-slate-400 mb-4">Issued to a generous supporter</p>
           
           {/* DOWNLOAD BUTTON */}
           <a 
             href="/certificate.pdf" 
             download="Kamar_Jahan_Supporter_Certificate.pdf"
             className="flex items-center justify-center gap-2 w-full py-3 bg-oxford text-white font-bold rounded-lg hover:bg-gold transition-all shadow-lg"
           >
             <Download size={18} /> Download Certificate
           </a>
        </div>

        {/* Home Button */}
        <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 hover:text-oxford font-medium transition-colors">
          <Home size={18} /> Back to Portfolio
        </Link>

      </div>
    </main>
  );
}