"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, QrCode } from 'lucide-react';

export default function MarketTicker({ onShowID }) {
  const [rates, setRates] = useState([
    { symbol: "USD/INR", price: "83.50", change: "+0.12%", up: true },
    { symbol: "BTC/USD", price: "Loading...", change: "0.00%", up: true },
    { symbol: "ETH/USD", price: "Loading...", change: "0.00%", up: true },
    { symbol: "GOLD/USD", price: "2030.50", change: "+0.45%", up: true },
    { symbol: "NIFTY 50", price: "22,150.00", change: "-0.20%", up: false },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        setRates(prev => {
          const newRates = [...prev];
          newRates[1] = {
            symbol: "BTC/USD",
            price: `$${data.bitcoin.usd.toLocaleString()}`,
            change: `${data.bitcoin.usd_24h_change.toFixed(2)}%`,
            up: data.bitcoin.usd_24h_change > 0
          };
          newRates[2] = {
            symbol: "ETH/USD",
            price: `$${data.ethereum.usd.toLocaleString()}`,
            change: `${data.ethereum.usd_24h_change.toFixed(2)}%`,
            up: data.ethereum.usd_24h_change > 0
          };
          return newRates;
        });
      } catch (error) { console.error("Ticker Error", error); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-oxford text-white border-b border-gray-800 relative z-50 flex items-center justify-between h-10">
      
      {/* Scrolling Ticker Area */}
      <div className="overflow-hidden flex-1 relative h-full flex items-center">
        <div className="flex items-center animate-ticker whitespace-nowrap">
          {[...rates, ...rates].map((rate, index) => (
            <div key={index} className="flex items-center gap-2 mx-6 font-mono text-xs md:text-sm font-medium">
              <span className="text-gold font-bold">{rate.symbol}</span>
              <span>{rate.price}</span>
              <span className={`flex items-center ${rate.up ? 'text-green-400' : 'text-red-400'}`}>
                {rate.up ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                {rate.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Static Button on the Right */}
      <button 
        onClick={onShowID}
        className="bg-gold text-oxford h-full px-4 font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2 z-10 shadow-[-10px_0_20px_rgba(15,23,42,1)]"
      >
        <QrCode size={16} /> <span className="hidden sm:inline">Digital ID</span>
      </button>

    </div>
  );
}