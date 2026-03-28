interface LegalSection {
  heading: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20 md:py-28">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111113]">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[#999]">{lastUpdated}</p>
      <p className="mt-8 text-[15px] leading-relaxed text-[#555]">{intro}</p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-[#111113]">
              {section.heading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#555]">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
