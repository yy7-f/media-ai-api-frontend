// src/app/pricing/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Pricing | Media AI Tools",
  description: "Simple pricing for Media AI Tools",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pricing
          </h1>
          <p className="text-gray-600">
            Start free. Upgrade later when you need more power.
          </p>
        </header>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free plan – current MVP */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Free (MVP)</h2>
            <p className="text-3xl font-bold mb-1">$0</p>
            <p className="text-sm text-gray-500 mb-4">per month</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Email + password login</li>
              <li>• Access to core tools (trim, crop, color, watermark…)</li>
              <li>• Reasonable rate limits (MVP)</li>
              <li>• Best effort support</li>
            </ul>
            <div className="mt-auto">
              <Link
                href="/login"
                className="block text-center rounded-lg bg-black text-white py-2 text-sm font-medium hover:opacity-90"
              >
                Get started free
              </Link>
            </div>
          </div>

          {/* Creator plan – future */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col relative">
            <div className="absolute -top-3 right-4 rounded-full bg-black text-white text-xs px-3 py-1">
              Coming soon
            </div>
            <h2 className="text-lg font-semibold mb-2">Creator</h2>
            <p className="text-3xl font-bold mb-1">$X / mo</p>
            <p className="text-sm text-gray-500 mb-4">(planned)</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Higher upload limits</li>
              <li>• Faster queue priority</li>
              <li>• More tools unlocked</li>
              <li>• Priority email support</li>
            </ul>
            <div className="mt-auto">
              <button
                disabled
                className="block w-full text-center rounded-lg bg-gray-200 text-gray-500 py-2 text-sm font-medium cursor-not-allowed"
              >
                Not available yet
              </button>
            </div>
          </div>

          {/* Pro / Team – future */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Pro / Team</h2>
            <p className="text-3xl font-bold mb-1">Custom</p>
            <p className="text-sm text-gray-500 mb-4">(planned)</p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• Team usage & higher limits</li>
              <li>• Custom workflows</li>
              <li>• Priority feature requests</li>
              <li>• Dedicated support</li>
            </ul>
            <div className="mt-auto">
              <Link
                href="/contact"
                className="block text-center rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Contact for details
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">
          For now, all usage is on the current Free MVP plan. Limits and paid
          plans will be introduced later as the product grows.
        </p>
      </div>
    </main>
  );
}
