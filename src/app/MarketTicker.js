"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function MarketTicker() {
  const [rates, setRates] = useState([
    { symbol: "USD/INR", price: "83.50", change: "+0.12%", up: true },
    { symbol: "BTC/USD", price: "Loading...", change: "0.00%", up: true },
    { symbol: "ETH/USD", price: "Loading...", change: "0.00%", up: true },
    { symbol: "GOLD/USD", price: "2030.50", change: "+0.45%", up: true },
    { symbol: "NIFTY 50", price: "22,150.00", change: "-0.20%", up: false },
  ]);

  useEffect(() => {
    // Fetch Real Crypto Data
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        setRates(prev => {
          const newRates = [...prev];
          
          // Update Bitcoin
          newRates[1] = {
            symbol: "BTC/USD",
            price: `$${data.bitcoin.usd.toLocaleString()}`,
            change: `${data.bitcoin.usd_24h_change.toFixed(2)}%`,
            up: data.bitcoin.usd_24h_change > 0
          };

          // Update Ethereum
          newRates[2] = {
            symbol: "ETH/USD",
            price: `$${data.ethereum.usd.toLocaleString()}`,
            change: `${data.ethereum.usd_24h_change.toFixed(2)}%`,
            up: data.ethereum.usd_24h_change > 0
          };

          return newRates;
        });
      } catch (error) {
        console.error("Ticker Error", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-oxford text-white overflow-hidden py-2 border-b border-gray-800 relative z-50">
      <div className="flex items-center animate-ticker w-full">
        {/* Repeat the list twice to make the scroll look infinite */}
        {[...rates, ...rates].map((rate, index) => (
          <div key={index} className="flex items-center gap-2 mx-8 font-mono text-xs md:text-sm font-medium">
            <span className="text-gold font-bold">{rate.symbol}</span>
            <span>{rate.price}</span>
            <span className={`flex items-center ${rate.up ? 'text-green-400' : 'text-red-400'}`}>
              {rate.up ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
              {rate.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}