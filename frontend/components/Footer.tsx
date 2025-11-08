import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowUp,
  Instagram,
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* Decorative top wave */}
      <div className="absolute inset-x-0 -top-14 h-14">
        <svg
          viewBox="0 0 1440 200"
          className="h-full w-full text-slate-950"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C240,80 480,0 720,40 C960,80 1200,200 1440,120 L1440,200 L0,200 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-semibold text-white">VoteChain</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">National Digital Voting Portal</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Building a transparent, inclusive, and secure digital democracy. VoteChain leverages
              blockchain infrastructure, biometric verification, and national security standards to
              protect every ballot.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700/60 px-3 py-1">ISO 27001 Certified</span>
              <span className="rounded-full border border-slate-700/60 px-3 py-1">Zero Knowledge Audits</span>
              <span className="rounded-full border border-slate-700/60 px-3 py-1">24/7 Support Desk</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/" className="transition hover:text-indigo-400">Home</Link>
              <Link href="#how-it-works" className="transition hover:text-indigo-400">How It Works</Link>
              <Link href="#features" className="transition hover:text-indigo-400">Key Features</Link>
              <Link href="/about" className="transition hover:text-indigo-400">About VoteChain</Link>
              <Link href="/contact" className="transition hover:text-indigo-400">Contact</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Resources</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <Link href="/privacy" className="transition hover:text-indigo-400">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-indigo-400">Terms &amp; Conditions</Link>
              <Link href="/support" className="transition hover:text-indigo-400">Support Centre</Link>
              <Link href="/faq" className="transition hover:text-indigo-400">Frequently Asked Questions</Link>
              <Link href="/guidelines" className="transition hover:text-indigo-400">Voter Guidelines</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href="mailto:support@votechain.gov"
                className="flex items-center gap-3 transition hover:text-indigo-400"
              >
                <Mail className="h-4 w-4" /> support@votechain.gov
              </a>
              <a
                href="tel:+1800123456"
                className="flex items-center gap-3 transition hover:text-indigo-400"
              >
                <Phone className="h-4 w-4" /> +1 800 123 456
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 transition hover:border-indigo-500 hover:text-indigo-400"
                aria-label="VoteChain on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} VoteChain. All rights reserved. Ministry of Digital Democracy.</p>
          <div className="flex items-center gap-4">
            <Link href="/accessibility" className="transition hover:text-indigo-400">Accessibility Statement</Link>
            <Link href="/security" className="transition hover:text-indigo-400">Security &amp; Compliance</Link>
            <Link href="/status" className="transition hover:text-indigo-400">System Status</Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500 px-4 py-2 text-indigo-300 transition hover:bg-indigo-500/10"
          >
            <ArrowUp className="h-4 w-4" />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
