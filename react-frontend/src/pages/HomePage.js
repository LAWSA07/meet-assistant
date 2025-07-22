import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BentoGridDemo } from '../components/bento-grid-demo';
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";
import { InfiniteMovingCards } from "../components/ui/InfiniteMovingCards";
import { CardSpotlight } from "../components/ui/card-spotlight";

// --- Logo (styled text) ---
const Logo = () => (
  <span className="text-2xl font-bold tracking-wide font-sans" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
    Co<span className="font-extrabold">Pilot</span>
  </span>
);

// --- Navbar ---
const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
    <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-8">
      <Logo />
      <div className="hidden md:flex gap-8 text-gray-300 font-medium items-center">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#company" className="hover:text-white transition-colors">Company</a>
        <a href="#resources" className="hover:text-white transition-colors">Resources</a>
        <a href="#help" className="hover:text-white transition-colors">Help</a>
        <a href="#docs" className="hover:text-white transition-colors">Docs</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-300 font-medium hover:text-white transition-colors">Sign in</Link>
        <Link to="/signup" className="bg-white text-black font-bold py-2 px-6 rounded-full shadow hover:bg-gray-200 transition-colors" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          Get Started
        </Link>
      </div>
    </div>
  </nav>
);

// --- Hero Section (Resend style, left-aligned, serif) ---
const Hero = () => (
  <section className="relative bg-black min-h-[70vh] flex flex-col md:flex-row items-center justify-center px-4 pt-40 pb-24">
    <div className="flex-1 flex flex-col items-start justify-center max-w-2xl z-10 ml-12 md:ml-32">
      <h1
        className="text-[3rem] md:text-[5rem] leading-[1.1] font-serif text-white mb-6"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        AI Meeting<br />
        Assistant for<br />
        Teams & Professionals
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-10">
        Get live transcripts, actionable insights, and AI-powered suggestions in every meeting.
      </p>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-white text-black font-semibold py-3 px-8 rounded-xl text-lg shadow hover:bg-gray-200 transition"
        >
          Get Started
        </Link>
        <Link
          to="/assistant"
          className="bg-transparent border border-white/30 text-white font-semibold py-3 px-8 rounded-xl text-lg hover:bg-white/10 transition"
        >
          See a Demo
        </Link>
      </div>
    </div>
    <div className="flex-1 flex justify-center items-center mt-12 md:mt-0">
      {/* Product Visual Image */}
      <div className="w-[350px] h-[350px] bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
        <img src="/images/visuals.png" alt="Product Visual" className="object-contain w-full h-full" />
      </div>
    </div>
  </section>
);

// --- Social Proof ---
const brandSvgs = [
  {
    name: "Google",
    svg: `<svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="18" fill="#4285F4" font-family="Arial Black" font-size="18">Google</text></svg>`
  },
  {
    name: "Microsoft",
    svg: `<svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="4" width="8" height="8" fill="#F25022"/><rect x="10" y="4" width="8" height="8" fill="#7FBA00"/><rect x="0" y="14" width="8" height="8" fill="#00A4EF"/><rect x="10" y="14" width="8" height="8" fill="#FFB900"/><text x="22" y="18" fill="#fff" font-family="Arial Black" font-size="14">Microsoft</text></svg>`
  },
  {
    name: "Netflix",
    svg: `<svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="18" fill="#E50914" font-family="Arial Black" font-size="18">Netflix</text></svg>`
  },
  {
    name: "Slack",
    svg: `<svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#611f69"/><text x="26" y="18" fill="#fff" font-family="Arial Black" font-size="14">Slack</text></svg>`
  },
  {
    name: "Spotify",
    svg: `<svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#1DB954"/><text x="26" y="18" fill="#fff" font-family="Arial Black" font-size="14">Spotify</text></svg>`
  },
];

const SocialProof = () => (
  <section className="py-10 bg-black">
    <div className="container mx-auto px-4 text-center">
      <p className="text-lg text-gray-400 mb-6">
        Companies of all sizes trust CoPilot to deliver their most important meetings.
      </p>
      <div className="mx-auto rounded-3xl bg-black/70 border border-white/10 shadow-lg backdrop-blur-md p-8 max-w-3xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
          {brandSvgs.map((brand, i) => (
            <div key={i} className="flex flex-col items-center justify-center h-12 min-w-[120px]">
              <span
                className="w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: brand.svg }}
                style={{ filter: "brightness(1.2)" }}
              />
              <span className="text-xs text-white mt-1 font-bold">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// --- Stats Section ---
const Stats = () => {
  const [stats, setStats] = useState({ active_users: 0, meetings_transcribed: 0, hours_of_insights: 0 });

  useEffect(() => {
    fetch('http://localhost:8001/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-x-16 gap-y-8">
        <div className="text-center">
          <div className="text-5xl font-extrabold text-white mb-2">{(stats.active_users ?? 0).toLocaleString()}+</div>
          <div className="text-gray-400 text-lg">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-extrabold text-white mb-2">{(stats.meetings_transcribed ?? 0).toLocaleString()}+</div>
          <div className="text-gray-400 text-lg">Meetings Transcribed</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-extrabold text-white mb-2">{(stats.hours_of_insights ?? 0).toLocaleString()}+</div>
          <div className="text-gray-400 text-lg">Hours of Insights Delivered</div>
        </div>
      </div>
    </section>
  );
};

// --- Feature Highlights ---
const bentoItems = [
  {
    title: "Live Transcription",
    description: "Accurate, real-time transcription of your meetings and interviews.",
    image: "/images/transcript.png",
  },
  {
    title: "AI-Powered Insights",
    description: "Continuous summaries, action items, and talking points as you speak.",
    image: "/images/liveinsight.png",
  },
  {
    title: "Multi-device Support",
    description: "Works seamlessly on desktop, tablet, and mobile.",
    image: "/images/multidevicesupport.png",
  },
  {
    title: "Ask AI Anything",
    description: "Get instant answers, clarifications, and next steps from your AI copilot.",
    image: "/images/askaianything.png",
  },
];
const BentoGridSection = () => (
  <section className="py-24 bg-black">
    <div className="container mx-auto px-4">
      <BentoGrid className="max-w-6xl mx-auto">
        {bentoItems.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
            }
            className={i === 3 || i === 4 ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>
    </div>
  </section>
);

const FeatureSection = () => (
  <section className="py-24 bg-white dark:bg-black">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
      {/* Left: Features */}
      <div className="flex-1">
        <h2 className="text-4xl font-bold mb-8 text-black dark:text-white">Why CoPilot?</h2>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-6 py-3 text-lg text-gray-800 dark:text-gray-200">
            <span>📝</span>
            Live transcription and AI-powered summaries for every meeting.
          </li>
          <li className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-6 py-3 text-lg text-gray-800 dark:text-gray-200">
            <span>⚡</span>
            Instant feedback, clarity, and action items as you speak.
          </li>
          <li className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-6 py-3 text-lg text-gray-800 dark:text-gray-200">
            <span>🔒</span>
            Secure, private, and works across all your devices.
          </li>
        </ul>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition">
          Start Your First Meeting
        </button>
      </div>
      {/* Right: Product Visual */}
      <div className="flex-1 flex justify-center">
        <div className="w-[400px] h-[350px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
          <img src="/images/visuals.png" alt="Product Visual" className="object-contain w-full h-full" />
        </div>
      </div>
    </div>
  </section>
);

// --- Pricing Section ---
const PricingSection = () => (
  <section className="py-24 bg-black">
    <h2 className="text-4xl font-bold text-center text-white mb-12">Pricing</h2>
    <div className="flex justify-center items-center gap-12 w-full">
      <CardSpotlight className="h-96 w-96">
        <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
        <p className="text-white mb-4">Basic features for individuals</p>
        <div className="text-4xl font-bold text-white mb-4">$0</div>
        <ul className="text-white mb-6">
          <li>✓ Live Transcription</li>
          <li>✓ AI Insights</li>
          <li>✓ 1 Device</li>
        </ul>
        <button className="bg-white text-black font-bold py-2 px-6 rounded-full shadow hover:bg-gray-200 transition">Start Free</button>
      </CardSpotlight>
      <CardSpotlight className="h-96 w-96">
        <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
        <p className="text-white mb-4">Advanced features for teams</p>
        <div className="text-4xl font-bold text-white mb-4">$12<span className="text-lg font-normal">/mo</span></div>
        <ul className="text-white mb-6">
          <li>✓ Everything in Free</li>
          <li>✓ Unlimited Devices</li>
          <li>✓ Priority Support</li>
        </ul>
        <button className="bg-white text-black font-bold py-2 px-6 rounded-full shadow hover:bg-gray-200 transition">Start Pro Trial</button>
      </CardSpotlight>
    </div>
  </section>
);

// --- Testimonials ---
const testimonials = [
  { name: "Krishna Sharma", quote: "The live insights are a game changer!", role: "4th year GEHU", img: "/images/krishna.png" },
  { name: "Himanshu Bisht", quote: "I never miss an action item now.", role: "4th year GEHU", img: "/images/himanshu.png" },
  { name: "Pranav Uniyal", quote: "The best meeting assistant I've tried.", role: "", img: "/images/pranav.jpg" },
  { name: "Srijan", quote: "The clarity score is so helpful!", role: "", img: "/images/srijan.png" },
];
const Testimonials = () => (
  <section className="py-24 bg-gradient-to-b from-black to-gray-900">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-12 text-white">What People Are Saying</h2>
      <InfiniteMovingCards
        items={testimonials.map(t => ({
          card: (
            <div className="flex flex-col h-full justify-between p-6">
              <p className="text-lg text-white italic mb-6 font-serif">“{t.quote}”</p>
              <div className="flex items-center gap-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white" />
                <div>
                  <div className="font-bold text-white text-lg">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            </div>
          )
        }))}
        speed="normal"
        direction="left"
        pauseOnHover={true}
        className="max-w-5xl mx-auto"
      />
    </div>
  </section>
);

// --- Social Links ---
const SocialLinks = () => (
  <section className="py-8 bg-black text-center">
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 justify-center">
        <a href="https://www.linkedin.com/in/himanshu-singh-aswal-093186271/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white text-2xl transition-colors">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
        </a>
        <a href="https://github.com/LAWSA07" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-white text-2xl transition-colors">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576 4.765-1.589 8.199-6.085 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://x.com/lawsaquickwork" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="text-gray-400 hover:text-white text-2xl transition-colors">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M22.162 0h-20.324c-.995 0-1.838.843-1.838 1.838v20.324c0 .995.843 1.838 1.838 1.838h20.324c.995 0 1.838-.843 1.838-1.838v-20.324c0-.995-.843-1.838-1.838-1.838zm-5.845 7.548l-2.293 2.635 2.293 2.635h-1.285l-1.65-1.899-1.65 1.899h-1.285l2.293-2.635-2.293-2.635h1.285l1.65 1.899 1.65-1.899h1.285zm-7.317 8.452h-1.5v-6h1.5v6zm-.75-6.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75.75.336.75.75-.336.75-.75.75zm10.5 6.75h-1.5v-2.25c0-.414-.336-.75-.75-.75s-.75.336-.75.75v2.25h-1.5v-6h1.5v2.25c0 .414.336.75.75.75s.75-.336.75-.75v-2.25h1.5v6z"/></svg>
        </a>
      </div>
      <div className="text-gray-500 text-sm mt-2">
        Connect with me: LinkedIn, GitHub, Twitter/X
      </div>
    </div>
  </section>
);

// --- Footer ---
const Footer = () => (
  <footer className="py-16 bg-black border-t border-white/10">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col items-center md:items-start">
        <span className="text-2xl font-bold text-white mb-2">Co-Pilot</span>
        <span className="text-gray-400">AI Meeting Assistant</span>
      </div>
      <div className="flex flex-wrap gap-8 text-gray-400 text-sm">
        <a href="#features" className="hover:text-white">Features</a>
        <a href="#" className="hover:text-white">Pricing</a>
        <a href="#" className="hover:text-white">Docs</a>
        <a href="#" className="hover:text-white">Blog</a>
        <a href="#" className="hover:text-white">Contact</a>
      </div>
      <div className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Co-Pilot Inc. All rights reserved.</div>
    </div>
  </footer>
);

// --- Main HomePage ---
const HomePage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <Navbar />
      <main className="pt-32">
        <Hero />
        <SocialProof />
        <Stats />
        <BentoGridSection />
        <FeatureSection />
        <PricingSection />
        <Testimonials />
        <SocialLinks />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage; 