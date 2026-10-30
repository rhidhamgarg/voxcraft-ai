import { NextResponse } from "next/server";
import { UserCredits } from "@/types";

// Default demo user credit balance
let userCredits: UserCredits = {
  balance: 10000,
  tier: "free",
  resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  totalUsed: 1420,
};

export async function GET() {
  return NextResponse.json(userCredits);
}

export async function POST(req: Request) {
  try {
    const { action, amount, tier } = await req.json();

    if (action === "deduct" && typeof amount === "number") {
      userCredits.balance = Math.max(0, userCredits.balance - amount);
      userCredits.totalUsed += amount;
    } else if (action === "upgrade" && tier) {
      userCredits.tier = tier;
      if (tier === "starter") userCredits.balance += 30000;
      if (tier === "creator") userCredits.balance += 121000;
      if (tier === "pro") userCredits.balance += 600000;
    } else if (action === "refill") {
      userCredits.balance += 10000;
    }

    return NextResponse.json({ success: true, credits: userCredits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
