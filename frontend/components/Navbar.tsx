"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    []
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200/80"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo + Tagline */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
              VoteChain
            </span>
            <p className="text-xs text-slate-500">National Digital Voting Portal</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-base font-semibold text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative pb-1 transition-colors hover:text-indigo-600"
            >
              <span className="relative inline-block">
                {link.label}
                <span className="absolute inset-x-0 -bottom-1 h-[3px] origin-left scale-x-0 rounded-full bg-indigo-500 transition-transform duration-200 ease-out group-hover:scale-x-100" />
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 text-sm font-semibold">
          <Link
            href="/login"
            className="rounded-full border border-transparent px-4 py-2 text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            Login
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-transparent px-4 py-2 text-slate-600 transition hover:border-slate-200 hover:bg-slate-50"
          >
            Admin
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-white shadow-md transition hover:shadow-lg hover:from-indigo-500 hover:to-purple-500"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden transform transition-transform duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-lg">
          <div className="space-y-2 p-5 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 grid gap-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-indigo-500 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-400 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
              >
                Admin Portal
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:shadow-lg"
              >
                Begin Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}