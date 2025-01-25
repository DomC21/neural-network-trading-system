import * as React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 2 | 4 | 6 | 8;
}

export function Grid({ children, cols = 1, gap = 4, className, ...props }: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        {
          "grid-cols-1": cols === 1,
          "grid-cols-1 md:grid-cols-2": cols === 2,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": cols === 3,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4": cols === 4,
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-6": cols === 6,
          "grid-cols-3 md:grid-cols-4 lg:grid-cols-12": cols === 12,
          "gap-2": gap === 2,
          "gap-4": gap === 4,
          "gap-6": gap === 6,
          "gap-8": gap === 8,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
