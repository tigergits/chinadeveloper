import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-foreground/60 mb-8">Page not found</p>
      <Link href="/en" className="text-foreground hover:underline">
        Go back home
      </Link>
    </div>
  );
}

