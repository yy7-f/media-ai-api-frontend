import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 py-8 border-t text-center text-sm text-gray-600">
      <div className="space-x-4">
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </div>
      <p className="mt-2">© {new Date().getFullYear()} Media Tools</p>
    </footer>
  );
}
