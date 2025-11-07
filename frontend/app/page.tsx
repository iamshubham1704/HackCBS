"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { CheckCircle, Vote, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-900">
   <Navbar/>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          Vote Smart. Vote Secure. Vote Anytime.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-2xl max-w-2xl mb-8"
        >
          A decentralized voting platform ensuring transparency, trust, and privacy — powered by blockchain.
        </motion.p>

        <motion.a
          href="#how-it-works"
          whileHover={{ scale: 1.05 }}
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          How It Works
        </motion.a>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 md:px-20 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          How Voting Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto text-center">
          {[
            {
              title: "Register",
              icon: <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />,
              desc: "Sign up securely with your verified ID and get your unique voter key.",
            },
            {
              title: "Vote",
              icon: <Vote className="w-12 h-12 text-indigo-600 mx-auto mb-4" />,
              desc: "Cast your vote digitally through our blockchain-powered platform — fast and tamper-proof.",
            },
            {
              title: "Verify",
              icon: <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />,
              desc: "Track and verify your vote anytime while maintaining complete anonymity.",
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 rounded-2xl shadow-md hover:shadow-2xl transition bg-gradient-to-br from-indigo-50 to-purple-50"
            >
              {step.icon}
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "Blockchain Security",
              desc: "All votes are stored on the blockchain, making them immutable and transparent.",
            },
            {
              title: "Anonymous Voting",
              desc: "Vote with privacy — no one can trace your identity or choice.",
            },
            {
              title: "Real-Time Results",
              desc: "Get instant, verified results once voting ends — no delays, no errors.",
            },
            {
              title: "Cross-Platform Access",
              desc: "Vote from any device — mobile, tablet, or desktop securely.",
            },
            {
              title: "End-to-End Encryption",
              desc: "Every transaction and vote is encrypted to ensure data integrity.",
            },
            {
              title: "Zero Manipulation",
              desc: "Blockchain consensus eliminates human bias or tampering.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 bg-white rounded-2xl shadow-md hover:shadow-2xl transition"
            >
              <CheckCircle className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-indigo-600 text-center text-white">
        <h2 className="text-4xl font-bold mb-6">Ready to Make Your Vote Count?</h2>
        <p className="text-lg mb-8">
          Join the future of voting — secure, transparent, and accessible for everyone.
        </p>
        <a
          href="/register"
          className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </section>

        <Footer/>
    </div>
  );
}
