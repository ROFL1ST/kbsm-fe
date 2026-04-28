import { Check, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionProgressStep } from "@/types/transaction";

interface Props {
  steps: TransactionProgressStep[];
}

export default function TransactionProgress({ steps }: Props) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8">
      <h2 className="font-display text-2xl mb-8">Progress Pesanan</h2>

      <div className="relative flex flex-col gap-0 md:flex-row">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={step.key} className="relative flex md:flex-col md:flex-1">
              {/* Connector line */}
              {!isLast && (
                <>
                  {/* Mobile vertical line */}
                  <div
                    className={cn(
                      "absolute left-5 top-10 bottom-0 w-px md:hidden",
                      step.isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                  {/* Desktop horizontal line */}
                  <div
                    className={cn(
                      "hidden md:block absolute top-5 h-px",
                      "left-[calc(50%+20px)] right-[calc(-50%+20px)]",
                      step.isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                </>
              )}

              <div className="flex items-start gap-4 pb-8 md:pb-0 md:flex-col md:items-center md:text-center">
                {/* Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    step.isFailed &&
                      "border-destructive bg-destructive/10 text-destructive",
                    step.isCurrent &&
                      !step.isFailed &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]",
                    step.isCompleted &&
                      "border-primary bg-primary/10 text-primary",
                    !step.isCompleted &&
                      !step.isCurrent &&
                      !step.isFailed &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {step.isFailed ? (
                    <XCircle className="h-4 w-4" />
                  ) : step.isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>

                {/* Label */}
                <div className="pt-1 md:pt-4 space-y-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      step.isCurrent && "text-primary",
                      !step.isCurrent &&
                        !step.isCompleted &&
                        "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[140px]">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
