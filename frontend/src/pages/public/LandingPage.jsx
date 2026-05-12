import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/common/Navbar";
import AppIcon from "../../components/common/AppIcon";

const features = [
  {
    icon: "target",
    title: "Curated Activities",
    desc: "Age-aware missions for learning, creativity, responsibility and physical movement.",
  },
  {
    icon: "gift",
    title: "Reward Planning",
    desc: "Parents define rewards and children earn them through approved activity completion.",
  },
  {
    icon: "chart",
    title: "Progress Reports",
    desc: "Dashboards and charts show activity patterns, points and category distribution.",
  },
  {
    icon: "shield",
    title: "Parent Controls",
    desc: "Ownership checks, approval flows and configurable settings keep the experience supervised.",
  },
  {
    icon: "check",
    title: "Approval Workflow",
    desc: "Children submit completed missions and parents approve or reject before points are awarded.",
  },
  {
    icon: "users",
    title: "Family Management",
    desc: "Manage multiple child profiles with separate activities, points, rewards and reports.",
  },
];

const steps = [
  {
    step: "01",
    icon: "child",
    title: "Create Profiles",
    desc: "Add children, age groups and settings from the parent dashboard.",
  },
  {
    step: "02",
    icon: "pin",
    title: "Assign Missions",
    desc: "Choose activities from the library and assign them with optional due dates.",
  },
  {
    step: "03",
    icon: "trophy",
    title: "Review Progress",
    desc: "Approve submissions, award points and monitor progress with reports.",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />

      <section className="relative overflow-hidden bg-white pt-20 pb-28 border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg mb-8"
          >
            <AppIcon name="shield" className="w-4 h-4" />
            Parent-led activity and reward management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02]"
          >
            A structured activity platform for families.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-6 max-w-2xl text-lg text-slate-600 leading-8"
          >
            Kidzvi helps parents replace passive screen time with supervised activities, measurable progress and meaningful rewards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/register"
              className="bg-slate-950 hover:bg-black text-white font-bold text-base px-7 py-3 rounded-lg transition-colors text-center"
            >
              Create Parent Account
            </Link>
            <a
              href="#how-it-works"
              className="border border-slate-300 hover:border-slate-950 text-slate-900 font-bold text-base px-7 py-3 rounded-lg transition-colors text-center"
            >
              View Workflow
            </a>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 max-w-3xl">
            {[
              { val: "100+", label: "Activities" },
              { val: "9", label: "Categories" },
              { val: "3", label: "Age Groups" },
      
            ].map((stat) => (
              <div key={stat.label} className="border border-slate-200 bg-white rounded-xl p-4">
                <p className="text-2xl font-extrabold tracking-tight">{stat.val}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { stat: "Supervised", desc: "Children use parent-managed profiles instead of public accounts." },
              { stat: "Purposeful", desc: "Activities are assigned intentionally and reviewed by parents." },
              { stat: "Measurable", desc: "Progress is tracked through completions, points and reports." },
            ].map((item) => (
              <div key={item.stat} className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-2xl font-extrabold text-slate-950 mb-2">{item.stat}</p>
                <p className="text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="mb-12">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.25em]">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3">How Kidzvi Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="border border-slate-200 rounded-xl p-6 bg-white"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-11 h-11 rounded-lg bg-slate-950 text-white flex items-center justify-center">
                    <AppIcon name={step.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-300">{step.step}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-950 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-6">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className="mb-12">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.25em]">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3">Built for parents, clear for children</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-950 flex items-center justify-center mb-5">
                  <AppIcon name={feature.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-950 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-6">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <div className="mx-auto w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center mb-6">
              <AppIcon name="shield" className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">Safety-first by design</h2>
            <p className="text-slate-300 leading-7 max-w-2xl mx-auto">
              Kidzvi avoids public profiles and social interactions. Parent ownership checks and approval workflows keep child data supervised.
            </p>
          </motion.div>
        </div>
      </section>

      {/* <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mb-5">Ready to organize activities?</h2>
            <p className="text-lg text-slate-600 mb-9">Create a parent account and start building structured routines for your family.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-slate-950 hover:bg-black text-white font-bold px-8 py-3 rounded-lg transition-colors">
                Start Now
              </Link>
              <Link to="/login" className="border border-slate-300 hover:border-slate-950 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}

      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-3 text-sm">
          <p className="font-bold text-white">Kidzvi</p>
          <p>Child Activity, Reward Monitoring and Parental Control App</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
