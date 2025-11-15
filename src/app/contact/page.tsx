export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Contact</h1>

      <p>
        If you have questions, feedback, or want support, feel free to send me
        an email:
      </p>

      <a
        href="mailto:media.ai@gmail.com"
        className="text-blue-600 underline text-lg"
      >
        your-email@example.com
      </a>

      <p>
        I normally respond within 24–48 hours.
      </p>
    </main>
  );
}
