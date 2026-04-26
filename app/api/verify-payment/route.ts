import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '1PhGJ25HyDJ0eaI06RUldoHy';

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const body = crypto.createHmac('sha256', keySecret).update(text.toString()).digest('hex');

    if (body === razorpay_signature) {
      // In a real app, you would update the user's pro status in the database here
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify signature" }, { status: 500 });
  }
}
