import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/common/Navbar";

const features = [
  {
    icon: "🎯",
    title: "Curated Activity Library",
    desc: "100+ age-appropriate activities across language, math, creativity, physical play, and more.",
    color: "bg-blue-50 border-blue-200",
  },
  {
    icon: "🏆",
    title: "Reward System",
    desc: "Children earn points for completing activities and redeem them for meaningful rewards.",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    desc: "Visual dashboards and weekly reports show your child's growth across all categories.",
    color: "bg-green-50 border-green-200",
  },
  {
    icon: "🛡️",
    title: "Parent Controls",
    desc: "Set daily limits, require approval, block passive content, and choose allowed categories.",
    color: "bg-purple-50 border-purple-200",
  },
  {
    icon: "✅",
    title: "Activity Approval",
    desc: "Review and approve activities your child completes before points are awarded.",
    color: "bg-pink-50 border-pink-200",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Multi-Child Support",
    desc: "Manage multiple children with individualized settings, activities, and rewards.",
    color: "bg-orange-50 border-orange-200",
  },
];

const steps = [
  {
    step: "1",
    icon: "👤",
    title: "Create Child Profile",
    desc: "Add your child's profile with age and preferences. Set parental controls and allowed categories.",
    color: "bg-indigo-600",
  },
  {
    step: "2",
    icon: "🎯",
    title: "Assign Activities",
    desc: "Browse our activity library and assign age-appropriate missions for your child to complete.",
    color: "bg-purple-600",
  },
  {
    step: "3",
    icon: "🏆",
    title: "Earn Rewards",
    desc: "Your child completes activities, earns points, and redeems them for exciting rewards you set.",
    color: "bg-pink-600",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-800 pt-20 pb-32">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-medium px-4 py-2 rounded-full border border-white/20 mb-8"
          >
            <span>🚀</span>
            The screen-time solution parents actually love
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Replace Screen Time with
            <span className="text-yellow-400"> Meaningful</span>
            <br className="hidden sm:block" /> Activities
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto mb-10"
          >
            Kidzvi helps parents guide their children toward enriching activities
            through a reward-based system that makes learning feel like play.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-0.5"
            >
              Get Started Free 🚀
            </Link>
            <a
              href="#how-it-works"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-xl border border-white/30 transition-all"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-8 mt-16 text-center"
          >
            {[
              { val: "100+", label: "Activities" },
              { val: "9", label: "Categories" },
              { val: "3", label: "Age Groups" },
              { val: "100%", label: "Child Safe" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-yellow-400">{stat.val}</p>
                <p className="text-sm text-indigo-300 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <span className="text-4xl mb-4 block">😟</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              The Screen Time Problem is Real
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Children are spending more time than ever on passive digital content —
              watching videos, scrolling feeds, playing mindless games. While parents
              know this isn't ideal, saying "no" without an alternative just creates conflict.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: "📱", stat: "7+ hours", desc: "Average daily screen time for kids aged 8-12" },
                { icon: "🧠", stat: "60% less", desc: "Creative play compared to a decade ago" },
                { icon: "😴", stat: "1 in 3", desc: "Children show signs of digital overuse" },
              ].map((item) => (
                <div key={item.stat} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <span className="text-3xl block mb-2">{item.icon}</span>
                  <p className="text-2xl font-bold text-indigo-600 mb-1">{item.stat}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">
              How Kidzvi Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-indigo-200 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center z-10"
              >
                <div className={`w-24 h-24 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <span className="text-4xl">{step.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-400 hidden md:flex">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 mb-4">
              Powerful Features for Parents
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Designed with both parent oversight and child experience in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`${feature.color} border rounded-2xl p-6 hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety First */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <span className="text-5xl mb-6 block">🛡️</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Safety First, Always
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Kidzvi is built with child safety at its core. No ads, no social features,
              no external links. Just a safe, supervised space where children can grow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "🔒 No Ads",
                "✅ Parent Approved Content",
                "🚫 No Social Features",
                "👁️ Full Transparency",
              ].map((item) => (
                <span
                  key={item}
                  className="bg-white/20 text-white font-medium px-5 py-2.5 rounded-full text-sm border border-white/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Ready to Transform Screen Time?
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Join thousands of families who've replaced passive scrolling with purposeful play.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-300"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-indigo-600 text-indigo-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <span className="text-lg font-bold text-white">Kidzvi</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Kidzvi. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
