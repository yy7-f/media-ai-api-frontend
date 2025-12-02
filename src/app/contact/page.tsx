// src/app/contact/page.tsx

export const metadata = {
  title: "Contact | Media AI Tools",
  description: "Get in touch about Media AI Tools",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Contact
          </h1>
          <p className="text-gray-600">
            Questions, feedback, or bug reports about Media AI Tools?
            I’d love to hear from you.
          </p>
        </header>

        {/* Simple contact card */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Email</h2>
            <p className="text-sm text-gray-700">
              You can reach me directly at:
            </p>
            <p className="mt-1">
              <a
                href="mailto:media.ai@gmail.com"
                className="text-sm font-medium text-blue-600 underline"
              >
                media.ai@gmail.com
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              (Use this for support, feature requests, or collaboration ideas.)
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-1">What to include</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Short description of the problem or request</li>
              <li>Which tool you were using (trim, crop, color, etc.)</li>
              <li>
                Optional: a screenshot or error message (please don’t include
                secrets or API keys)
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-1">Response time</h2>
            <p className="text-sm text-gray-700">
              This is an early-stage MVP, so response times may vary,
              but I&apos;ll do my best to reply as soon as possible.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
