"use client";

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DonationButton() {
  const [loading, setLoading] = useState(false);

  // Helper to load Razorpay script
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonation = async () => {
    setLoading(true);

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }

    // 1. Call our internal API to create an order
    const data = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500 }), // Example: 500 Rupees
    }).then((t) => t.json());

    // 2. Open Razorpay Options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "Kamar Jahan Portfolio",
      description: "Support my work",
      order_id: data.id,
      handler: async function (response) {
        // 3. Success! Save to Firebase
        await addDoc(collection(db, "donations"), {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: 500,
            timestamp: serverTimestamp()
        });
        alert("Donation Successful! Thank you.");
      },
      prefill: {
        name: "Supporter",
        email: "support@kamarjahan.in",
        contact: "9999999999",
      },
      theme: {
        color: "#0F172A", // Your Oxford Blue
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDonation}
      disabled={loading}
      className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-pulse"
    >
      {loading ? <Loader2 className="animate-spin" /> : <Heart fill="white" />}
      Support My Work (₹500)
    </button>
  );
}