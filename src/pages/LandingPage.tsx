import { 
  Mic, 
  Video, 
  Zap, 
  BarChart3, 
  MessageSquare, 
  Brain, 
  ArrowRight, 
  Play,
  Monitor,
  Shield,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center transform rotate-12">
          <Zap className="text-white w-5 h-5" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">Aura<span className="text-rose-600">Pitch</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <Link to="/landing-page" className="hover:text-rose-400 transition-colors">Landing Page</Link>
        <a href="#how-it-works" className="hover:text-rose-400 transition-colors">How it Works</a>
        <Link to="/home" className="hover:text-rose-400 transition-colors">Dashboard</Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link 
          to="/home" 
          className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="text-rose-500 w-6 h-6" />
    </div>
    <h3 className="font-display font-bold text-xl mb-3 text-slate-100">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden">
    {/* Animated Background Gradient */}
    <div className="absolute inset-0 -z-20">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 opacity-30 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950" />
    </div>
    
    {/* Background Glows */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-rose-500/10 blur-[120px] rounded-full -z-10" />
    
    <div className="max-w-7xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-8 leading-[1.1]">
          Master the Art of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">Perfect Delivery</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The real-time AI coach that analyzes your tone, body language, and confidence. Train for pitches, interviews, and speeches with agentic intelligence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/home" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 group">
            Start Live Practice <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-slate-700 flex items-center justify-center gap-2">
            View Live Demo <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Hero Visual */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-20 relative max-w-5xl mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-rose-500/10">
          <img 
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" 
            alt="AI Coaching Platform" 
            className="w-full aspect-video object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-rose-600/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Video className="text-white w-8 h-8" />
             </div>
             <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">Camera Standby</p>
          </div>
          
          <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end gap-4 flex-wrap">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 hidden md:block w-48">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Confidence Score</span>
                <span className="text-rose-400 font-bold text-sm">88%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[88%]" />
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-1 max-w-md hidden lg:block text-left">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-rose-500 w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Tone Analysis</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">"Your conviction in the last sentence was strong. Try to maintain that eye contact during the closing segment."</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 hidden md:block">
              <div className="flex items-center gap-3">
                <Mic className="text-green-500 w-4 h-4" />
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1 bg-green-500/50 rounded-full" style={{ height: `${Math.random() * 20 + 10}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Step = ({ number, title, description, icon: Icon }: { number: string, title: string, description: string, icon: any }) => (
  <div className="flex flex-col items-center text-center max-w-xs relative">
    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group hover:border-rose-500 transition-colors relative z-10">
      <Icon className="text-rose-500 w-7 h-7" />
      <div className="absolute -top-2 -right-2 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-slate-950">
        {number}
      </div>
    </div>
    <h4 className="font-display font-bold text-lg mb-3 text-white">{title}</h4>
    <p className="text-sm text-slate-400">{description}</p>
  </div>
);

const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center transform rotate-12">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">Aura<span className="text-rose-600">Pitch</span></span>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Democratizing elite communication coaching through the power of Gemini AI.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs border-t border-slate-900 pt-10">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="opacity-30">Powered by Gemini</p>
        </div>
        <div className="flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-red-500 fill-current" />
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      
      <Hero />

      <section id="landing-page" className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6">Expert Coaching at Scale</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            AuraPitch uses advanced multimodal models to see and hear you just like a human coach would—but with 10x the precision.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Video} 
            title="Facial Confidence" 
            description="AI tracks micro-expressions to measure authentic confidence and emotional resonance."
            delay={0.1}
          />
          <FeatureCard 
            icon={Mic} 
            title="Tone & Cadence" 
            description="Analyze pitch, speed, and filler words in real-time to ensure your message hits the mark."
            delay={0.2}
          />
          <FeatureCard 
            icon={MessageSquare} 
            title="Adaptive Q&A" 
            description="Gemini AI asks challenging follow-up questions and provides instant feedback on your answers."
            delay={0.3}
          />
          <FeatureCard 
            icon={Brain} 
            title="Cognitive Analysis" 
            description="Evaluates the logical structure of your arguments and suggests better phrasing."
            delay={0.4}
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Performance Reports" 
            description="Deep-dive into every session with visual maps showing your progress over time."
            delay={0.5}
          />
          <FeatureCard 
            icon={Shield} 
            title="Privacy First" 
            description="Your video and audio data is processed in real-time and never stored permanently."
            delay={0.6}
          />
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6 tracking-tight">The Training Blueprint</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Your journey from scattered thoughts to world-class delivery in three steps.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0" />
            
            <Step 
              number="01" 
              icon={Monitor} 
              title="Set the Stage" 
              description="Tell AuraPitch your topic, target audience, and key goals. We'll tailor the AI to your specific scenario."
            />
            <Step 
              number="02" 
              icon={Mic} 
              title="Speak Naturally" 
              description="Start speaking. The agentic AI listens and watches, analyzing every subtle cue in real time."
            />
            <Step 
              number="03" 
              icon={Brain} 
              title="Evolve Instantly" 
              description="Get a comprehensive breakdown of your performance plus an AI-moderated Q&A session."
            />
          </div>
        </div>
      </section>

      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-rose-600/10 blur-[100px] rounded-full -z-10" />
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-6xl text-white mb-8 tracking-tighter">Your Next Great Speech Starts Here.</h2>
          <p className="text-slate-400 text-xl mb-12">Whether talking with startup founders, executives, or students use AuraPitch to own the room.</p>
          <Link to="/home" className="bg-white text-slate-950 hover:bg-slate-200 px-10 py-5 rounded-full font-bold text-xl transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 mx-auto">
            Get Practice Started <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
