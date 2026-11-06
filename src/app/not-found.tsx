import Link from "next/link";
export default function NotFound() {
  return (
    <main className="loading-screen">
      <h1>Page not found</h1>
      <p>This page is not available in this portal.</p>
      <Link className="btn primary" href="/">
        Back to overview
      </Link>
    </main>
  );
}
