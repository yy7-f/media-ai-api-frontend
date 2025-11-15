export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Terms of Service</h1>

      <p>
        By using this service, you agree not to upload any illegal content,
        copyrighted materials you do not own rights to, or harmful files.
      </p>

      <p>
        You understand that all media processing is provided on a best-effort
        basis, without guarantees.
        We are not liable for data loss or damages resulting from using the
        service.
      </p>

      <p>
        This service may be updated or discontinued at any time.
      </p>
    </main>
  );
}
