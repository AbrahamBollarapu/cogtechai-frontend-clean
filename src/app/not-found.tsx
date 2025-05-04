// /app/not-found.tsx

export default function NotFound() {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center">
        <h1 className="text-5xl font-bold text-red-600">404</h1>
        <p className="text-gray-600 text-lg mt-2">This page could not be found.</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">← Go back home</a>
      </div>
    );
  }
  