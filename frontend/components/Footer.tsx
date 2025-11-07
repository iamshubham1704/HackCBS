import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">VoteChain</h2>
          <p className="text-gray-400">
            Building a transparent, accessible, and secure digital democracy through blockchain.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-indigo-400">Home</a></li>
            <li><a href="#how-it-works" className="hover:text-indigo-400">How It Works</a></li>
            <li><a href="#features" className="hover:text-indigo-400">Features</a></li>
            <li><a href="/about" className="hover:text-indigo-400">About</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-indigo-400"><Github /></a>
            <a href="#" className="hover:text-indigo-400"><Twitter /></a>
            <a href="#" className="hover:text-indigo-400"><Linkedin /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} VoteChain. All rights reserved.
      </div>
    </footer>
  );
}
