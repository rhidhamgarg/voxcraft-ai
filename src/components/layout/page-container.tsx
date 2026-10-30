import * as React from "react";
import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
