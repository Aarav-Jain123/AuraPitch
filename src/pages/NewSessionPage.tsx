import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowLeft, ArrowRight, Video, Mic, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function NewSessionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Creating session...', formData);
    navigate('/practice-session', { state: formData });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Navbar />
      
      <main className="pt-32 px-4 max-w-3xl mx-auto pb-20">
        <Link 
          to="/home" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Setup New Session</h1>
          <p className="text-slate-500 dark:text-slate-400">Tell AuraPitch what you're practicing today so we can provide tailored feedback.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Series A Pitch, Internal Sync..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Brief Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What are the key points you want to convey?"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all"
            >
              Initialize AI Coach <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-500">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium">Powered by Gemini Flash</span>
           </div>
           <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
           <span className="text-xs">Low-latency analytics enabled</span>
        </div>
      </main>
    </div>
  );
}
