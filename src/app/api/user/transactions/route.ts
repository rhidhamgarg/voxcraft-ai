import { NextResponse } from "next/server";
import { globalTransactionsStore } from "@/lib/transaction-store";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      transactions: globalTransactionsStore,
      total: globalTransactionsStore.length,
    },
  });
}
