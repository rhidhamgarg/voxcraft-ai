import { NextResponse } from "next/server";
import { UserCredits } from "@/types";
import { addTransaction } from "@/lib/transaction-store";

let userCredits: UserCredits = {
  balance: 10000,
  tier: "free",
  resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  totalUsed: 0,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: userCredits,
  });
}

export async function POST(req: Request) {
  try {
    const { action, amount, tier, description } = await req.json();

    if (action === "deduct" && typeof amount === "number") {
      if (userCredits.balance < amount) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_CREDITS",
              message: `Generation requires ${amount} credits. Current balance is ${userCredits.balance}.`,
              available: userCredits.balance,
              required: amount,
            },
          },
          { status: 402 }
        );
      }

      userCredits.balance -= amount;
      userCredits.totalUsed += amount;
      addTransaction(-amount, userCredits.balance, "tts_generation", description || `Synthesized ${amount} characters`);
    } else if (action === "upgrade" && tier) {
      userCredits.tier = tier;
      let added = 0;
      if (tier === "starter") added = 30000;
      if (tier === "creator") added = 121000;
      if (tier === "pro") added = 600000;

      userCredits.balance += added;
      addTransaction(added, userCredits.balance, "tier_upgrade", `Upgraded to ${tier} plan`);
    } else if (action === "refill") {
      userCredits.balance += 10000;
      addTransaction(10000, userCredits.balance, "top_up", "Manual test credit replenishment");
    }

    return NextResponse.json({ success: true, data: userCredits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
