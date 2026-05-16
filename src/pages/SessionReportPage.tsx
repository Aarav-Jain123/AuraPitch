import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Mic, 
  Video as VideoIcon, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  Award,
  History,
  Timer,
  Volume2,
  Smile,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Navbar from '../components/layout/Navbar';

export default function SessionReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionId = "N/A",
    title = "Public Speaking Practice", 
    duration = "00:00", 
    metrics = [],
    aiSuggestions = [],
    scores = { tone: 85, voice: 92, visual: 88 }
  } = (location.state as any) || {};

  // Default suggestions if none were captured
  const displaySuggestions = aiSuggestions.length > 0 ? aiSuggestions : [
    "Focus on reducing filler words like 'um' and 'ah'",
    "Maintain steady eye contact with the camera",
    "Vary your pitch to emphasize key points",
    "Use power pauses for more impact"
  ];

  // Calculate an overall score based on metrics
  const overallScore = metrics.length > 0 
    ? Math.round(metrics.reduce((acc: number, m: any) => acc + m.confidence, 0) / metrics.length)
    : Math.round((scores.tone + scores.voice + scores.visual) / 3);

  const handleSave = async () => {
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuraPitch Report - ${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #020617; color: white; }
        .grid-bg { background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; }
        .chart-container { position: relative; height: 300px; width: 100%; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    </style>
</head>
<body class="p-8 md:p-16 grid-bg min-h-screen">
    <div class="max-w-5xl mx-auto">
        <header class="mb-12">
            <div class="flex items-center gap-2 text-rose-500 font-black uppercase tracking-widest text-[10px] mb-2 leading-none">
                Session ID: <span class="font-mono text-slate-400">${sessionId.slice(0, 13)}...</span>
            </div>
            <h1 class="text-5xl font-black text-white tracking-tight leading-tight">
                Performance <span class="text-rose-600">Analysis</span> Report
            </h1>
            <p class="text-slate-400 mt-4 text-xl font-bold">${title} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div class="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col items-center text-center">
                <div class="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-4">Overall Score</div>
                <div class="text-6xl font-black text-white tracking-tighter">${overallScore}%</div>
                <div class="mt-4 px-4 py-1 bg-rose-600/20 text-rose-500 rounded-full text-xs font-black uppercase tracking-widest leading-none">Rating: ${getGrade(overallScore)}</div>
            </div>
            <div class="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col items-center text-center">
                <div class="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-4">Session Duration</div>
                <div class="text-6xl font-black text-white tracking-tighter">${duration}</div>
                <div class="mt-4 text-slate-500 text-xs font-black uppercase tracking-widest">Minutes/Seconds</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
                <div class="p-8 rounded-[2.5rem] bg-rose-600 text-white shadow-2xl shadow-rose-600/20 relative overflow-hidden">
                    <div class="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="flex items-center gap-4 mb-8">
                        <div>
                            <h3 class="font-black text-2xl uppercase tracking-tight leading-none mb-1">AI Master Suggestions</h3>
                            <p class="text-rose-100/80 text-xs font-black uppercase tracking-widest">Strategic improvements detected</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                        ${displaySuggestions.map(insight => `
                            <div class="flex items-start gap-4 p-5 rounded-[1.8rem] bg-white/10 border border-white/20">
                                <div class="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0"></div>
                                <span class="text-sm font-black leading-relaxed">${insight}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800">
                    <div class="flex justify-between items-center mb-8">
                        <h3 class="text-xs font-black uppercase tracking-widest text-slate-500 leading-none">Statistical Consistency</h3>
                        <div class="flex gap-4">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span class="text-[9px] font-black uppercase text-slate-400">Confidence</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span class="text-[9px] font-black uppercase text-slate-400">Pace</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="metricsChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                ${[
                  { label: 'Tone Analysis', score: getGrade(scores.tone), raw: scores.tone, summary: scores.tone >= 97 ? 'Flawless tonal stability. Professional resonance throughout.' : scores.tone >= 90 ? 'Acceptable energy, but minor fluctuations detected. Focus on sustained drive.' : 'Significant tonal inconsistency. Your delivery lacks the authority required for high-stakes pitching.' },
                  { label: 'Voice Clarity', score: getGrade(scores.voice), raw: scores.voice, summary: scores.voice >= 96 ? 'Exceptional articulation. Zero significant filler usage. High-tier clarity.' : scores.voice >= 88 ? 'Clear overall, but subtle enunciation lapses occurred. Eliminate all glottal stops.' : 'Common filler words detected. Clarity falls below professional standards. Practice articulation drills.' },
                  { label: 'Visual Presence', score: getGrade(scores.visual || 85), raw: scores.visual || 85, summary: (scores?.visual || 85) >= 95 ? 'Commanding visual presence. Absolute eye-contact consistency.' : (scores?.visual || 85) >= 85 ? 'Stationary overall, but minor gaze drifting noted. Stabilize your focus.' : 'Unstable framing and poor gaze discipline. Your visual cues undermine your message.' }
                ].map(aspect => `
                    <div class="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-black uppercase tracking-widest text-white">${aspect.label}</span>
                            <span class="text-xs font-black px-2 py-1 bg-slate-800 rounded-md py-1 px-3 text-white">${aspect.score}</span>
                        </div>
                        <p class="text-[12px] font-black text-slate-300 leading-relaxed mb-6">${aspect.summary}</p>
                        <div class="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-rose-600" style="width: ${aspect.raw}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <footer class="mt-24 pt-8 border-t border-slate-800 flex justify-between items-center opacity-50">
            <div></div>
            <div class="text-[10px] font-black tracking-widest uppercase text-rose-500 italic font-bold">Powered by AuraPitch</div>
        </footer>
    </div>

    <script>
        const ctx = document.getElementById('metricsChart').getContext('2d');
        const metrics = ${JSON.stringify(metrics)};
        
        const labels = metrics.map(m => m.time);
        const confidenceData = metrics.map(m => m.confidence);
        const paceData = metrics.map(m => m.pace);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Confidence',
                        data: confidenceData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0
                    },
                    {
                        label: 'Pace',
                        data: paceData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#475569', font: { size: 10, weight: 'bold' } }
                    },
                    y: {
                        beginAtZero: true,
                        max: 200,
                        grid: { color: 'rgba(30, 41, 59, 0.5)' },
                        ticks: { display: false }
                    }
                }
            }
        });
    </script>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraPitch-Report-${title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getGrade = (score: number) => {
    if (score >= 98) return 'A+';
    if (score >= 95) return 'A';
    if (score >= 92) return 'A-';
    if (score >= 88) return 'B+';
    if (score >= 84) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      <main id="report-content" className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-black uppercase tracking-widest text-[10px] mb-2 leading-none">
              <History className="w-3.5 h-3.5" />
              Session ID: <span className="font-mono text-slate-500">{sessionId.slice(0, 13)}...</span>
            </div>
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Performance <span className="text-rose-600">Analysis</span> Report
            </h1>
            <p className="text-slate-700 dark:text-slate-400 mt-2 font-semibold">{title} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-rose-500/25 active:scale-95"
            >
              <Zap className="w-4 h-4" /> Save Results
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-500/10 active:scale-95"
            >
              Back Home <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { label: 'Overall Score', value: overallScore.toString(), suffix: '%', icon: Award, color: 'text-rose-600', bg: 'bg-rose-600/10' },
            { label: 'Session Duration', value: duration, suffix: '', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-3xl ${metric.bg} flex items-center justify-center mb-6`}>
                <metric.icon className={`w-7 h-7 ${metric.color}`} />
              </div>
              <div className="text-4xl font-black text-slate-950 dark:text-slate-50 mb-1 tracking-tight">
                {metric.value}<span className="text-xl opacity-80 font-bold ml-0.5">{metric.suffix}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-300">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white">Confidence & Pace</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-300 font-medium">Real-time metrics tracking during session</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200">Confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200">Pace</span>
                  </div>
                </div>
              </div>
              
              <div className="h-72 w-full relative">
                {metrics && metrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        dy={10}
                        minTickGap={20}
                      />
                      <YAxis domain={[0, 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorConfidence)" 
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="pace" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorPace)" 
                        animationDuration={1500}
                        animationDelay={300}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-bold">No performance data captured</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-rose-600 dark:bg-rose-700 text-white shadow-2xl shadow-rose-600/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-tight">AI Master Suggestions</h3>
                  <p className="text-rose-100/80 text-sm font-medium">Expert coaching for your next presentation</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySuggestions.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 rounded-[1.5rem] bg-white/10 border border-white/20 hover:bg-white/20 transition-all cursor-default">
                    <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-black leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Breakdown Cards */}
          <div className="space-y-6">
            {[
              { 
                id: 'tone', 
                label: 'Tone Analysis', 
                summary: scores.tone >= 97 ? 'Flawless tonal stability. Professional resonance throughout.' : scores.tone >= 90 ? 'Acceptable energy, but minor fluctuations detected. Focus on sustained drive.' : 'Significant tonal inconsistency. Your delivery lacks the authority required for high-stakes pitching.', 
                score: getGrade(scores.tone),
                rawScore: scores.tone,
                icon: Volume2,
                color: 'text-rose-600',
                bgColor: 'bg-rose-600'
              },
              { 
                id: 'voice', 
                label: 'Voice Clarity', 
                summary: scores.voice >= 96 ? 'Exceptional articulation. Zero significant filler usage. High-tier clarity.' : scores.voice >= 88 ? 'Clear overall, but subtle enunciation lapses occurred. Eliminate all glottal stops.' : 'Common filler words detected. Clarity falls below professional standards. Practice articulation drills.', 
                score: getGrade(scores.voice),
                rawScore: scores.voice,
                icon: Mic,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-600'
              },
              { 
                id: 'visual', 
                label: 'Visual Presence', 
                summary: (scores?.visual || 85) >= 95 ? 'Commanding visual presence. Absolute eye-contact consistency.' : (scores?.visual || 85) >= 85 ? 'Stationary overall, but minor gaze drifting noted. Stabilize your focus.' : 'Unstable framing and poor gaze discipline. Your visual cues undermine your message.', 
                score: getGrade(scores?.visual || 85),
                rawScore: scores?.visual || 85,
                icon: VideoIcon,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500'
              }
            ].map((aspect, i) => (
              <motion.div
                key={aspect.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-rose-200 dark:hover:border-rose-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <aspect.icon className={`w-5 h-5 ${aspect.color}`} />
                    <h4 className="font-black text-slate-950 dark:text-slate-100">{aspect.label}</h4>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-black text-slate-950 dark:text-white">
                    {aspect.score}
                  </div>
                </div>
                <p className="text-[13px] text-slate-900 dark:text-slate-100 leading-relaxed font-black">
                  {aspect.summary}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-950 dark:text-slate-400 tracking-widest leading-none">Strength</span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      key={`${aspect.id}-${aspect.rawScore}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${aspect.rawScore}%` }}
                      transition={{ bounce: 0, duration: 1.5, delay: 0.8 }}
                      className={`h-full ${aspect.bgColor} opacity-80`} 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center opacity-60"
        >
          <div></div>
          <div className="text-[10px] font-black tracking-widest uppercase text-rose-500 italic">Powered by AuraPitch</div>
        </motion.footer>
      </main>
    </div>
  );
}
