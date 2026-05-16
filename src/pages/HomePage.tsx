import { useState } from 'react';
import { Zap, Trash2, Calendar, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/layout/Navbar';

export default function HomePage() {
  const [sessions, setSessions] = useState([
    { 
      id: 'inv-pitch-88', 
      title: 'Example 1 - Seed Round Pitch - FinTech', 
      date: '2026-05-10',
      duration: '08:42',
      scores: { tone: 81, voice: 94, visual: 72 },
      aiSuggestions: [
        "Slow down your delivery during the financial projections slide.",
        "Your confidence peaks when discussing the market opportunity.",
        "Try to maintain more consistent eye contact during transitions.",
        "The closing value proposition was your strongest segment."
      ],
      metrics: [
        { time: '0:00', confidence: 70, pace: 130 },
        { time: '1:30', confidence: 85, pace: 140 },
        { time: '3:00', confidence: 82, pace: 145 },
        { time: '4:30', confidence: 90, pace: 138 },
        { time: '6:00', confidence: 88, pace: 142 },
        { time: '7:30', confidence: 95, pace: 135 },
        { time: '8:42', confidence: 92, pace: 130 },
      ]
    },
    { 
      id: 'keynote-ethics', 
      title: 'Example 2 - AI Ethics Keynote Rehearsal', 
      date: '2026-05-12',
      duration: '15:20',
      scores: { tone: 92, voice: 88, visual: 95 },
      aiSuggestions: [
        "Excellent use of theatrical pauses after key ethical questions.",
        "Visual presence is very authoritative; good alignment with framing.",
        "Tone remains inspiring throughout the long-form delivery.",
        "Slight vocal fry detected near the 10-minute mark; stay hydrated."
      ],
      metrics: [
        { time: '0:00', confidence: 80, pace: 120 },
        { time: '3:00', confidence: 92, pace: 125 },
        { time: '6:00', confidence: 85, pace: 130 },
        { time: '9:00', confidence: 94, pace: 122 },
        { time: '12:00', confidence: 90, pace: 128 },
        { time: '15:20', confidence: 96, pace: 118 },
      ]
    }
  ]);
  const navigate = useNavigate();

  const deleteSession = (id: string | number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const viewReport = (session: any) => {
    navigate('/session-report', { 
      state: { 
        sessionId: session.id.toString(),
        title: session.title,
        duration: session.duration,
        metrics: session.metrics,
        aiSuggestions: session.aiSuggestions,
        scores: session.scores
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Navbar />

      <main className="pt-32 px-4 max-w-7xl mx-auto pb-20">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back!</h1>
            <p className="text-slate-500 dark:text-slate-400">Track your progress and start new practice sessions.</p>
          </div>
          <button 
            onClick={() => navigate('/new-session')}
            className="sm:hidden w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-5 h-5" /> Create New Session
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            onClick={() => navigate('/new-session')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-rose-600/5 dark:bg-rose-600/5 border border-rose-500/10 dark:border-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-full min-h-[240px]"
          >
             <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-rose-600/20">
                <Plus className="text-white w-7 h-7" />
             </div>
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">New Session</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Start a real-time analysis of your next pitch.</p>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => viewReport(session)}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group h-full min-h-[240px] shadow-sm hover:shadow-md cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <Zap className="text-rose-600 w-5 h-5" />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/5"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{session.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {session.date}
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="text-rose-600 dark:text-rose-400 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Results <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
