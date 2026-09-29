import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="wrap pt-12">
      <article className="prose-doc max-w-[680px]">
        <h1 className="h-page">{title}</h1>
        <p className="num mt-2 text-[12px] text-fg-45">Last updated {updated}</p>
        <div className="mt-8 space-y-4 text-[14.5px] [&_h2]:mt-8 [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:text-ink">{children}</div>
      </article>
    </div>
  );
}
