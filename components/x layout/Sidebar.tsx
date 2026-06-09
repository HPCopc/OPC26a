// components/layout/Sidebar.tsx

const SUBTOPICS = {
  news: [
    { label: "Markets",   sub: "markets" },
    { label: "Shale Oil", sub: "shale" },
    { label: "OPC",       sub: "opc" },
  ],
  videos: [
    { label: "Presentations", sub: "presentations" },
    { label: "Seminars",      sub: "seminars" },
  ],
  events: [
    { label: "Upcoming", sub: "upcoming" },
    { label: "Past",     sub: "past" },
  ],
};

export default function Sidebar({ topic }: { topic: string }) {
  const links = SUBTOPICS[topic] ?? [];
  return (
    <nav>
      {links.map(link => (
        <a key={link.sub} href={`/?topics=${topic}&sub=${link.sub}`}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}