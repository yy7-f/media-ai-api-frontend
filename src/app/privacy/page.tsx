export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <p>
        We respect your privacy. We do not sell or share your data with any
        third parties.
        This service only processes the files you upload for the purpose of
        generating edited media results.
      </p>

      <p>
        Uploaded files may be temporarily stored for processing and deleted
        automatically after the operation is completed.
        Authentication data is stored securely and never shared.
      </p>

      <p>
        If you have any concerns, please contact us at{" "}
        <a
          href="mailto:media.ai@gmail.com"
          className="text-blue-600 underline"
        >
          your-email@example.com
        </a>.
      </p>
    </main>
  );
}
