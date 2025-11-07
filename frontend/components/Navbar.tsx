"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          VoteChain
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
          <Link href="#how-it-works" className="hover:text-indigo-600 transition">How It Works</Link>
          <Link href="#features" className="hover:text-indigo-600 transition">Features</Link>
          <Link href="/about" className="hover:text-indigo-600 transition">About</Link>
          <Link href="/contact" className="hover:text-indigo-600 transition">Contact</Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-indigo-600 px-4 py-2 rounded-full hover:text-indigo-800 transition"
          >
            Login
          </Link>
          <Link
            href="/admin/login"
            className="text-gray-600 px-4 py-2 rounded-full hover:text-gray-800 transition"
          >
            Admin
          </Link>
          <Link
            href="/register"
            className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="flex flex-col space-y-4 p-4 text-gray-700 font-medium">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="#how-it-works" onClick={() => setIsOpen(false)}>How It Works</Link>
            <Link href="#features" onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
            <div className="flex space-x-4 pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center text-indigo-600 px-4 py-2 rounded-full border border-indigo-600 hover:bg-indigo-50 transition"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center text-gray-600 px-4 py-2 rounded-full border border-gray-600 hover:bg-gray-50 transition"
              >
                Admin
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}