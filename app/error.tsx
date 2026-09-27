'use client';

// Shown when a page throws, e.g. the sign-in check on an article failed
// because of a network error.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
      <p className="text-gray-700">Something went wrong loading this page. Please try again.</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Try again
      </button>
    </div>
  );
}
