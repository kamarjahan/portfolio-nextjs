import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { amount } = await req.json();

  const options = {
    amount: amount * 100, // Razorpay takes amount in Paise (1 INR = 100 Paise)
    currency: "INR",
    receipt: "receipt_" + Math.random().toString(36).substring(7),
  };

  try {
    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}