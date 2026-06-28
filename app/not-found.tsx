import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl md:text-9xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/en"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
      >
        ← Back to home
      </Link>
    </div>
  );
}
