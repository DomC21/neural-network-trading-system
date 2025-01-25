import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Section({ children, title, description, className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-8", className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            </div>
          )}
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
