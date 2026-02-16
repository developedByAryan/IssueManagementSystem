"use client";

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Shield, Zap, Users } from 'lucide-react';

const Home = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              IM
            </div>
            <span className="font-bold text-xl text-slate-800">IssueManager</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 is now live
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Issue tracking <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                simplified for everyone.
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Streamline maintenance requests, IT support tickets, and inter-departmental issues in one unified platform. Real-time updates for real-time teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                View Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NzA4MDE3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Dashboard Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating Badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Efficiency</p>
                <p className="text-sm font-bold text-slate-900">+45% Productivity</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to manage requests</h2>
            <p className="text-slate-600">Powerful features to help your organization resolve issues faster and keep everyone in the loop.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-amber-500" />}
              title="Real-time Updates"
              description="See changes instantly across all devices. No refreshing required to stay up to date."
            />
            <FeatureCard
              icon={<Shield className="text-blue-500" />}
              title="Role-Based Access"
              description="Granular control over who can see, edit, and manage issues within your organization."
            />
            <FeatureCard
              icon={<Users className="text-purple-500" />}
              title="Department Workflows"
              description="Dedicated views for departments to manage their queue and track resolution times."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
              IM
            </div>
            <span className="font-bold text-slate-900">IssueManager</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 IssueManager Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">
      {description}
    </p>
  </div>
);

export default Home;
