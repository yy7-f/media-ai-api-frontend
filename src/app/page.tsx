// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20 grid gap-10 lg:grid-cols-[1.4fr,1fr] items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Edit Videos &amp; Audio Instantly —
              <span className="block text-gray-700 mt-1">
                All in your browser
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
              <strong>Media AI Tools</strong> gives you fast, simple, powerful
              editing tools directly in your browser. Trim clips, crop and
              resize, burn captions, normalize audio, add watermarks, and more —
              backed by a cloud-native backend.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-900"
              >
                Try for Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                Sign In
              </Link>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              No credit card required. Runs securely on cloud infrastructure.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-xl border bg-gray-900 text-gray-50 p-4 shadow-xl">
              <div className="flex items-center gap-1 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="rounded-md bg-black/60 p-4 text-xs font-mono space-y-1">
                <p className="text-gray-300">
                  $ media-ai-tools trim input.mp4 --start 0 --duration 20
                </p>
                <p className="text-emerald-300">▶ Processing on cloud…</p>
                <p className="text-emerald-400">✔ Done: clip_trimmed.mp4</p>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                All processing happens on secure cloud servers. No local
                installation required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Editing shouldn’t take hours.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              Heavy desktop editors are overkill when you just need to trim a
              clip, adjust speed, burn subtitles, or normalize audio. Creators
              and social media managers need quick, reliable tools that work
              anywhere.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Media AI Tools is built for speed.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              Upload → choose tool → download. No installation, no timelines, no
              exports that take forever. Your browser talks to a Cloud Run
              backend tuned for real-world creator workflows.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="border-b bg-white" id="features">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            🚀 Core Tools Available Today
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="🎬 Video Trim"
              body="Cut clips precisely with frame-accurate trimming, or use fast keyframe copy for quick cuts."
              href="/tools/video/trim"
            />
            <FeatureCard
              title="🖼️ Crop & Resize"
              body="Crop to region or aspect ratio and add letterbox/pillarbox with EditResize."
              href="/tools/video/crop"      // or /tools/video/resize if you prefer
            />
            <FeatureCard
              title="📝 Text Overlay"
              body="Burn arbitrary text onto your video with Overlay — perfect for titles, callouts, and hooks."
              href="/tools/video/overlay-text" // if this is not live yet, you can leave href out
            />
            <FeatureCard
              title="💬 Captions Burn-in"
              body="Use the Captions endpoint to burn SRT/VTT subtitles directly into video as hard subs."
              href="/tools/captions/burn"
            />
            <FeatureCard
              title="🎨 Video Color"
              body="Apply color filters or LUT-style looks using VideoColor for consistent visual style."
              href="/tools/video/color"
            />
            <FeatureCard
              title="🔊 Audio Normalize & Mix"
              body="Normalize loudness with AudioNormalize and mix background music with AudioMix."
              href="/tools/audio/normalize"  // or /tools/audio/mix
            />
            <FeatureCard
              title="🎛️ Speed & Rotate"
              body="Change playback speed or rotate 90/180/270 degrees without opening a full editor."
              href="/tools/video/speed"
            />
            <FeatureCard
              title="🧩 Shuffle & Concat"
              body="Shuffle segments or concatenate multiple clips in order for quick highlight reels."
              href="/tools/video/shuffle"    // or /tools/video/concat
            />
            <FeatureCard
              title="💧 Watermark"
              body="Overlay an image watermark with control over position, opacity, scale, and timing."
              href="/tools/video/watermark"
            />
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Advanced tools like transcription, denoise, inpainting, and scene
            detection are on the roadmap and will roll out gradually.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b bg-gray-50" id="how-it-works">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Simple. Fast. Cloud-powered.
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <StepCard
              step="1"
              title="Upload media"
              body="Upload your video or audio file. Processing happens securely on Google Cloud Run."
            />
            <StepCard
              step="2"
              title="Choose a tool"
              body="Pick the operation you need — trim, crop, burn captions, normalize audio, watermark, and more."
            />
            <StepCard
              step="3"
              title="Download result"
              body="Instantly download edited media ready for YouTube, TikTok, Reels, or client delivery."
            />
          </div>
        </div>
      </section>

      {/* PRICING / FREEMIUM */}
      <section className="border-b bg-white" id="pricing">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Start free. Upgrade later.
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fair usage limits are enforced to keep the service sustainable,
            especially while the platform is in MVP.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900">
                Free Plan (MVP)
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Ideal for individual creators testing Media AI Tools.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>✔ Email &amp; password sign-in</li>
                <li>✔ Access to all current tools</li>
                <li>✔ Fair-use upload limits</li>
                <li>✔ Cloud processing on demand</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900">
                Pro Plan (Coming Soon)
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Designed for heavier creators, agencies, and teams.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>🚀 Faster processing</li>
                <li>🚫 Higher or no rate limits</li>
                <li>📁 Larger file sizes</li>
                <li>🔐 Priority queue &amp; support</li>
                <li>🤖 Advanced AI tools &amp; presets</li>
              </ul>
              <p className="mt-4 text-xs text-gray-500">
                Want early access? Reach out via the contact page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CREATORS LOVE IT */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Built for creators, editors, and teams.
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm text-gray-700">
            <BulletCard
              title="No installation"
              body="Everything runs in your browser. No plugins, no desktop installs, no GPU required."
            />
            <BulletCard
              title="Cloud-accelerated"
              body="Backed by Google Cloud Run and object storage for scalable processing."
            />
            <BulletCard
              title="Simple UI"
              body="Pick a tool, upload a file, tweak a few options, and you’re done."
            />
            <BulletCard
              title="Secure by design"
              body="Files are processed securely and cleaned up after a short retention window."
            />
            <BulletCard
              title="Global-ready"
              body="Create caption-ready videos and social clips that work across platforms and regions."
            />
            <BulletCard
              title="Constantly evolving"
              body="New tools and improvements are rolled out as the product grows."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-white" id="faq">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h2 className="text-2xl font-semibold text-gray-900">FAQ</h2>
          <div className="mt-6 space-y-5 text-sm text-gray-700">
            <FaqItem
              q="Is it really free?"
              a="Yes. The free plan includes generous usage for individual creators while the platform is in MVP. Heavy or commercial usage may move to a paid tier later."
            />
            <FaqItem
              q="Do I need to install anything?"
              a="No. Everything runs online in your browser. Just upload a file, choose a tool, and download the result."
            />
            <FaqItem
              q="Are my videos private?"
              a="Yes. Files are processed securely and are not made public. Temporary files are regularly cleaned from the processing environment and storage."
            />
            <FaqItem
              q="Which tools are available now?"
              a="Trim, crop, resize, overlay text, burn captions, change speed and rotation, shuffle and concat clips, apply color, normalize audio, mix audio, and add watermarks. Advanced AI tools such as transcription and noise removal are planned."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>Media AI Tools © {new Date().getFullYear()}</p>
          <p className="text-gray-400">
            Create better content, faster — directly in your browser.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* --- Small presentational components --- */

function FeatureCard(props: { title: string; body: string; href?: string }) {
  const content = (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:shadow-sm transition">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {props.title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600">{props.body}</p>
    </div>
  );

  // If href is set, make the whole card clickable
  if (props.href) {
    return (
      <Link href={props.href} className="block">
        {content}
      </Link>
    );
  }

  // Fallback: non-clickable card
  return content;
}


function StepCard(props: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
        {props.step}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">
        {props.title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-600">{props.body}</p>
    </div>
  );
}

function BulletCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">{props.title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-600">{props.body}</p>
    </div>
  );
}

function FaqItem(props: { q: string; a: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{props.q}</h3>
      <p className="mt-1 text-gray-600">{props.a}</p>
    </div>
  );
}
