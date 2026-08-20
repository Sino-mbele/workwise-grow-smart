import { AlertTriangle, Check, Copy, Info, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-growth">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string | undefined;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive ring-destructive/20",
  medium: "bg-warn-soft text-warn ring-warn/25",
  low: "bg-growth-soft text-growth ring-growth/25",
};

export function PriorityBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        priorityStyles[key] ?? "bg-secondary text-secondary-foreground ring-border",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "growth" | "sky";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
        tone === "growth" && "bg-growth-soft text-growth ring-growth/20",
        tone === "sky" && "bg-sky-soft text-sky ring-sky/20",
        tone === "neutral" && "bg-secondary text-muted-foreground ring-border",
      )}
    >
      {children}
    </span>
  );
}

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </Button>
  );
}

export function AiLoading({ message }: { message: string }) {
  return (
    <div className="surface-card p-6 rise">
      <div className="flex items-center gap-3">
        <span className="relative grid size-9 place-items-center rounded-xl bg-sky-soft">
          <span className="size-3 animate-ping rounded-full bg-sky" />
          <span className="absolute size-2 rounded-full bg-sky" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">
            WorkWise AI is working — this usually takes a few seconds.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="h-3 w-3/4 rounded-full shimmer" />
        <div className="h-3 w-full rounded-full shimmer" />
        <div className="h-3 w-5/6 rounded-full shimmer" />
        <div className="h-3 w-2/3 rounded-full shimmer" />
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">
            That request didn't complete
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Info;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function ResponsibleAi({ variant = "default" }: { variant?: "default" | "research" }) {
  return (
    <p className="mt-6 flex items-start gap-2 rounded-lg bg-surface px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-growth" />
      <span>
        {variant === "research"
          ? "AI summaries are intended to support research, not replace verification of original sources. Check figures, claims and citations against the primary material before you rely on them."
          : "AI-generated content may contain errors or omissions. Review important information before using it for professional, financial, legal, academic or business decisions."}
      </span>
    </p>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function BulletList({ items }: { items?: string[] }) {
  if (!items?.length)
    return <p className="text-sm text-muted-foreground">None identified.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-growth" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
