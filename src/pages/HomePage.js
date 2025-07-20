import React from 'react';
import { Link } from 'react-router-dom';

// --- SVG Icons (Components) ---
const IconCpuChip = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-4 text-cyan-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H7.5A2.25 2.25 0 005.25 7.5v9a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);

const IconChatBubble = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-4 text-cyan-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0.375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0.375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0.375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const IconDocumentText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-4 text-cyan-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0.621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

// --- Page Components ---
const Navbar = () => (
  <nav className="bg-gray-900/50 backdrop-blur-md p-4 fixed top-0 left-0 right-0 z-50">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">Project Co-Pilot</h1>
      <div>
        <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Get Started
        </Link>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-32 pb-20 text-center">
    <div className="container mx-auto px-4">
      <h2 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
        Your AI Co-Pilot for Every Conversation
      </h2>
      <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
        Never miss a detail again. Get real-time summaries, intelligent talking points, and comprehensive reports for all your meetings.
      </p>
      <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
        Launch Your Co-Pilot
      </Link>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-cyan-500 transition-all">
    {icon}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const Features = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <h3 className="text-4xl font-bold text-center mb-12">How It Works</h3>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<IconCpuChip />} 
          title="Real-Time Summaries"
          description="Our AI listens and provides a running summary of your conversation, so you're always in the loop, even if you get distracted."
        />
        <FeatureCard 
          icon={<IconChatBubble />} 
          title="Intelligent Talking Points"
          description="Get smart, context-aware suggestions on what to say next, helping you ask the right questions and make impactful contributions."
        />
        <FeatureCard 
          icon={<IconDocumentText />} 
          title="Complete Meeting Reports"
          description="Receive a full, structured summary with action items and key decisions as soon as your meeting ends."
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
    <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
            <p>&copy; 2025 Project Co-Pilot. All rights reserved.</p>
        </div>
    </footer>
);

const HomePage = () => {
  return (
    <div className="bg-gray-900 text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage; 