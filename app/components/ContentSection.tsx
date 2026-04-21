interface Section {
  heading: string
  body: string
}

interface Props {
  title: string
  sections: Section[]   // matches your a.json() field
}

export default function ContentSection({ title, sections }: Props) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {sections.map((section, idx) => (
        <div key={idx} className="mb-8">
          {section.heading && (
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
          )}
          <p className="text-gray-700 leading-relaxed">{section.body}</p>
        </div>
      ))}
    </main>
  )
}