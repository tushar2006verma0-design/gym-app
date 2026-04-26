import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_ShQ7ZDWnvFmdMU',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '1PhGJ25HyDJ0eaI06RUldoHy',
    });
  }
  return razorpayInstance;
}

export async function POST(req: Request) {
  try {
    const razorpay = getRazorpay();
    const { amount, currency } = await req.json();

    if (!amount || amount < 1) { 
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise / cents
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
