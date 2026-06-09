// app/components/GrayCard.tsx
interface GrayCardProps {
  title: string;
  description: string;
}

export default function GrayCard({ title, description }: GrayCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      {/* Gray title area */}
      <div className="bg-gray-200 px-6 py-4 border-b border-gray-300">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {/* White content area */}
      <div className="p-6 flex-grow">
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}