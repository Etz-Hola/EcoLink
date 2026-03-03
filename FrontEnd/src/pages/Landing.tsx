import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Recycle, TrendingUp, Users, Shield } from 'lucide-react';

import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const Landing: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [ 
    
    {
      icon: <Recycle className="h-6 w-6" />,
      title: 'Smart Material Upload',
      description: 'Upload photos, get instant pricing, and track your recyclable materials with our AI-powered system.'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Real-time Pricing',
      description: 'Get market-based pricing for different material types, conditions, and quality grades.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Connected Network',
      description: 'Join collectors, processing branches, and buyers in one integrated platform.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Quality Assurance',
      description: 'Professional quality grading and transparent tracking from collection to processing.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-20 md:pb-32 px-6 lg:px-12">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 animate-gradient-x" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 backdrop-blur-sm rounded-full border border-primary-500/20 mb-6"
          >
            <Leaf className="h-5 w-5 text-primary-500" />
            <span className="text-sm font-bold text-primary-700">Sustainable • On-chain • Nigeria-first</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-neutral-900 via-primary-600 to-accent-600 bg-clip-text text-transparent mb-8 pb-2"
          >
            Turn Waste Into Wealth
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            The smart recycling platform that connects collectors, branches and exporters with transparent pricing, on-chain traceability and real rewards.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link
              to="/register"
              className="group relative px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-primary-500/50 flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="inline ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-10 py-5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl font-bold text-lg hover:border-primary-500 transition-colors">
              Watch 30s Demo
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-14 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '2M+', label: 'Tons plastic waste/yr in NG', from: 'from-green-400', to: 'to-emerald-500', glow: 'shadow-green-500/20' },
            { value: '₦800', label: 'Avg clean PET price/kg', from: 'from-amber-400', to: 'to-orange-500', glow: 'shadow-amber-500/20' },
            { value: '100%', label: 'On-chain NFT tracking', from: 'from-indigo-400', to: 'to-purple-500', glow: 'shadow-indigo-500/20' },
            { value: 'Eco+', label: 'Tokenized reward points', from: 'from-rose-400', to: 'to-pink-500', glow: 'shadow-rose-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/8 p-6 text-center shadow-xl ${stat.glow}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.from} ${stat.to} opacity-5 pointer-events-none`} />
              <p className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.from} ${stat.to} bg-clip-text text-transparent`}>{stat.value}</p>
              <p className="mt-2 text-xs md:text-sm text-white/50 font-medium leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6">
              Everything You Need to Start Recycling
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Our platform makes it easy to turn your recyclable materials into income while contributing to a sustainable future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-10 border border-neutral-100 dark:border-neutral-800 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/5 transition-all group"
              >
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6">
              Simple. Smart. Sustainable.
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Get started in just 3 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                step: '01',
                title: 'Upload Materials',
                desc: 'Take photos of your recyclable materials and upload them with weight and condition details.',
                color: 'bg-primary-500'
              },
              {
                step: '02',
                title: 'Get Pricing',
                desc: 'Receive instant, market-based pricing for your materials based on type, quality, and current demand.',
                color: 'bg-accent-500'
              },
              {
                step: '03',
                title: 'Get Paid',
                desc: 'Schedule pickup or drop-off at nearby branches, and get paid directly to your account.',
                color: 'bg-primary-600'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center text-xl font-black mb-8 shadow-xl shadow-primary-500/20`}>
                  {item.step}
                </div>
                <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto glass dark:bg-neutral-900/80 p-16 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 -z-10" />
          <div className="relative z-10 space-y-10">
            <Leaf className="h-20 w-20 text-primary-500 mx-auto animate-float" />
            <h2 className="text-4xl md:text-7xl font-black text-neutral-900 dark:text-white leading-tight">
              Ready to Make a<br /> <span className="gradient-text">Difference?</span>
            </h2>
            <p className="text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Join thousands of Nigerians who are earning money while creating a cleaner, more sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link
                to="/register"
                className="px-12 py-6 bg-primary-600 hover:bg-primary-700 text-white font-black text-xl rounded-2xl shadow-2xl transition-all hover:-translate-y-1"
              >
                Start Recycling Today
              </Link>
              <Link
                to="/contact"
                className="px-12 py-6 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl font-black text-xl hover:border-primary-500 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
