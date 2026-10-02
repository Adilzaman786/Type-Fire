import React, { useState, useMemo } from 'react';
import { UserStats, TestRecord } from '../types/typing';
import { ThemeConfig } from '../types/theme';
import { TypingArena } from './TypingArena';
import { URDU_BENCHMARK_TEXTS } from '../data/urduParagraphs';
import {
  Timer,
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  FileText,
  Flame,
  ShieldAlert,
  Globe,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { CertificateModal } from './CertificateModal';

const ENGLISH_BENCHMARK_TEXTS: Record<string, { title: string; subtitle: string; text: string }> = {
  standard: {
    title: 'Standard English Benchmark',
    subtitle: 'Balanced prose for true cognitive speed verification',
    text: 'The ability to type quickly and accurately is one of the most valuable cognitive and professional skills in our modern digital society. When your thoughts flow directly through your fingers without conscious mechanical hesitation, writing becomes an effortless extension of the mind. Consistent daily practice, proper posture, and trust in muscle memory will gradually elevate your typing speed to exceptional levels.'
  },
  advanced: {
    title: 'Advanced Literature & Rhetoric',
    subtitle: 'Complex syntax, diverse vocabulary, and elevated cadence',
    text: 'Throughout human history, language has remained the foremost vessel of civilization and philosophy. Precision in prose requires not only nuanced vocabulary, but deliberate rhythm and cadence. When the keyboard yields to the rhythm of intellect, syntax flows unhindered across the glowing matrix, transforming contemplation into enduring expression.'
  },
  code: {
    title: 'Software Developer Syntax Test',
    subtitle: 'Braces, semicolons, function signatures, and arrow operators',
    text: 'const evaluatePerformance = (wpm: number, accuracy: number): string => { if (wpm >= 90 && accuracy >= 98) { return "Grandmaster"; } else if (wpm >= 65 && accuracy >= 95) { return "Professional"; } return "Practicing"; }; export default evaluatePerformance;'
  },
  roman_urdu: {
    title: 'Roman Urdu Speed Benchmark',
    subtitle: 'Subcontinent conversational phrases and speed rhythm',
    text: 'Zindagi mein kisi bhi nayi maharat ko seekhne ke liye lagan, mehnat aur musalsal mashq sab se zaroori anasir hain. Jab aap rozana apna thora waqt nikal kar typing ki practice karte hain to aap ki unglian bila jhijhak keyboard par har lafz ko sahi tarah se type karna shuru kar deti hain aur aap ki raftaar bohat tezi se barh jati hai.'
  }
};

interface TypingTestViewProps {
  stats: UserStats;
  onCompleteTest: (test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => void;
  theme?: ThemeConfig;
}

export const TypingTestView: React.FC<TypingTestViewProps> = ({
  stats,
  onCompleteTest,
  theme,
}) => {
  const [testLanguage, setTestLanguage] = useState<'en' | 'ur'>('en');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 60s (1 min) default
  const [selectedCategory, setSelectedCategory] = useState<string>('standard');
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{
    netWpm: number;
    grossWpm: number;
    accuracy: number;
    errors: number;
    timeSeconds: number;
    characters: number;
    cpm: number;
    consistency: number;
    date: string;
    isUrduTest: boolean;
  } | null>(null);

  const [candidateName, setCandidateName] = useState<string>('AZ Typing Fire Master');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);

  const activeBenchmarkMap = testLanguage === 'ur' ? URDU_BENCHMARK_TEXTS : ENGLISH_BENCHMARK_TEXTS;
  const activeBenchmark = activeBenchmarkMap[selectedCategory] || Object.values(activeBenchmarkMap)[0];

  // Handle test completion
  const handleTestFinished = (test: Omit<TestRecord, 'id' | 'timestamp'>, keyErrors: Record<string, number>) => {
    const grossWpm = Math.round((test.characterCount / 5) / (test.timeSeconds / 60));
    const cpm = Math.round(test.characterCount / (test.timeSeconds / 60));
    const consistency = Math.max(70, Math.min(99, Math.round(100 - (test.errors * 2.5))));

    const isUrduCurrent = testLanguage === 'ur';

    setLastResult({
      netWpm: test.netWpm,
      grossWpm,
      accuracy: test.accuracy,
      errors: test.errors,
      timeSeconds: test.timeSeconds,
      characters: test.characterCount,
      cpm,
      consistency,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      isUrduTest: isUrduCurrent
    });

    setIsTestActive(false);

    // Call parent handler
    onCompleteTest(test, keyErrors);

    // Celebration sounds and confetti
    soundEngine.playSuccess();
    if (test.netWpm >= 50) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#06b6d4', '#ec4899', '#10b981'],
      });
    }
  };

  // Rank determination
  const rankInfo = useMemo(() => {
    if (!lastResult) return { title: 'Typist', color: 'text-slate-300', percentile: '50th' };
    const w = lastResult.netWpm;
    if (w >= 100) return { title: 'Legendary Apex Typist', color: 'text-amber-400', percentile: 'Top 1%' };
    if (w >= 80) return { title: 'Master Speedster', color: 'text-rose-400', percentile: 'Top 5%' };
    if (w >= 65) return { title: 'Pro Fast Typist', color: 'text-cyan-400', percentile: 'Top 15%' };
    if (w >= 50) return { title: 'Skilled Typist', color: 'text-emerald-400', percentile: 'Top 35%' };
    if (w >= 35) return { title: 'Intermediate Cadence', color: 'text-indigo-400', percentile: 'Top 55%' };
    return { title: 'Developing Typist', color: 'text-slate-400', percentile: 'Top 75%' };
  }, [lastResult]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>AZ Typing Fire · Official Speed Benchmark</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {testLanguage === 'ur' ? 'اردو و انگلش اسپیڈ ٹیسٹ و تصدیقی سرٹیفکیٹ' : 'Official Speed Test & Verified Certificate'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {testLanguage === 'ur'
              ? 'اپنا ٹائم اور اردو یا انگریزی پیراگراف منتخب کریں، ٹیسٹ مکمل کریں اور اپنا آفیشل اسپیڈ سرٹیفکیٹ ڈاؤن لوڈ کریں۔'
              : 'Test your certified WPM under standardized conditions and generate an official printable certificate.'}
          </p>
        </div>

        {/* Language Switcher Tab */}
        <div className="inline-flex p-1 rounded-2xl bg-white/[0.06] border border-white/[0.1] shadow-inner self-start md:self-auto">
          <button
            onClick={() => {
              setTestLanguage('en');
              setSelectedCategory('standard');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              testLanguage === 'en'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>English Test</span>
          </button>
          <button
            onClick={() => {
              setTestLanguage('ur');
              setSelectedCategory('standard');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-urdu-clean flex items-center gap-1.5 ${
              testLanguage === 'ur'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>اردو اسپیڈ ٹیسٹ</span>
          </button>
        </div>
      </div>

      {/* Active Test Arena */}
      {isTestActive ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsTestActive(false)}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              ← Cancel Official Test
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Official {selectedDuration}s Benchmark Running ({testLanguage === 'ur' ? 'اردو' : 'English'})</span>
            </div>
          </div>

          <TypingArena
            title={activeBenchmark.title}
            categoryLabel={testLanguage === 'ur' ? 'اردو اسپیڈ ٹیسٹ' : 'Official Speed Test'}
            sourceText={activeBenchmark.text}
            timedMode={selectedDuration}
            onComplete={handleTestFinished}
            theme={theme}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Test Configuration Card */}
          <div className="p-5 sm:p-7 rounded-3xl glass-panel border border-white/[0.1] space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                1. Select Benchmark Duration:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[
                  { sec: 15, label: testLanguage === 'ur' ? '۱۵ سیکنڈ اسپرنٹ' : '15 Seconds', desc: 'Sprint Burst' },
                  { sec: 30, label: testLanguage === 'ur' ? '۳۰ سیکنڈ شارٹ' : '30 Seconds', desc: 'Agility Check' },
                  { sec: 60, label: testLanguage === 'ur' ? '۶۰ سیکنڈ معیاری' : '60 Seconds', desc: 'Standard (1 Min)' },
                  { sec: 120, label: testLanguage === 'ur' ? '۱۲۰ سیکنڈ حتمی' : '120 Seconds', desc: 'Endurance Exam' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => setSelectedDuration(item.sec)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedDuration === item.sec
                        ? 'bg-amber-500/20 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Timer className={`w-4 h-4 ${selectedDuration === item.sec ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-mono font-bold">{item.sec}s</span>
                    </div>
                    <div className={`text-sm font-bold mt-2 ${selectedDuration === item.sec ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                {testLanguage === 'ur' ? '۲۔ اسپیڈ ٹیسٹ کا موضوع منتخب کریں:' : '2. Select Benchmark Content:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(activeBenchmarkMap).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedCategory === key
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`text-xs font-bold truncate ${testLanguage === 'ur' ? 'font-urdu-clean text-sm' : ''}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      "{item.text.slice(0, 70)}..."
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setIsTestActive(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all cursor-pointer text-center"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>
                  {testLanguage === 'ur'
                    ? `آفیشل ${selectedDuration} سیکنڈ اردو اسپیڈ ٹیسٹ شروع کریں`
                    : `Start Official ${selectedDuration / 60} Min Typing Test`}
                </span>
              </button>
            </div>
          </div>

          {/* Test Result & Speed Certificate Showcase */}
          {lastResult && (
            <div className="space-y-6">
              {/* Detailed Performance Statistics Grid */}
              <div className="p-4 sm:p-6 lg:p-8 rounded-3xl glass-panel border border-white/[0.1] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Benchmark Completed
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">Official Test Telemetry Analysis</h3>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs font-mono text-slate-400">Class Rank: </span>
                    <span className={`text-sm sm:text-base font-bold font-mono ${rankInfo.color}`}>
                      {rankInfo.title}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 my-4 sm:my-6 font-mono">
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Net WPM</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 tabular-nums">
                      {lastResult.netWpm}
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Accuracy</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1 tabular-nums">
                      {lastResult.accuracy}%
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Gross WPM</span>
                    <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1 tabular-nums">
                      {lastResult.grossWpm}
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Keystrokes (CPM)</span>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums">
                      {lastResult.cpm}
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Errors</span>
                    <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 tabular-nums">
                      {lastResult.errors}
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase">Consistency</span>
                    <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1 tabular-nums">
                      {lastResult.consistency}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Printable Certificate */}
              <div
                id="printable-certificate"
                className="relative p-5 sm:p-8 md:p-12 rounded-3xl glass-panel border-2 border-amber-500/50 bg-gradient-to-br from-slate-950 via-[#101424] to-[#1a120b] shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
              >
                {/* Certificate corner decorative marks */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-amber-400/60" />
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-amber-400/60" />
                <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-amber-400/60" />
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-amber-400/60" />

                <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-amber-400 text-[10px] sm:text-xs font-mono uppercase tracking-widest">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 shrink-0" />
                    <span className="truncate">AZ Typing Fire · Official Speed Certificate</span>
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 shrink-0" />
                  </div>

                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-serif">
                    {lastResult.isUrduTest
                      ? 'سندِ مہارتِ اردو ٹائپنگ (Urdu Keystroke Mastery)'
                      : 'Certificate of Keystroke Mastery'}
                  </h2>

                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {lastResult.isUrduTest
                      ? 'یہ سند اس بات کی باضابطہ تصدیق کرتی ہے کہ امیدوار نے مقررہ وقت کے اندر اردو زبان کے اسپیڈ امتحان کو کامیابی سے مکمل کیا ہے۔'
                      : 'This certifies that the candidate has successfully completed an official timed keystroke speed examination.'}
                  </p>

                  <div className="py-1 sm:py-2">
                    <span className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-wider font-mono">
                      {lastResult.isUrduTest ? 'امیدوار کا نام:' : 'Candidate:'}
                    </span>
                    {isEditingName ? (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="px-3 py-1 rounded bg-black/60 border border-amber-400 text-amber-200 text-base sm:text-lg font-bold text-center font-serif focus:outline-none max-w-xs"
                        />
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="px-2.5 py-1 text-xs bg-amber-500 text-black font-bold rounded cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingName(true)}
                        className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-200 font-serif cursor-pointer hover:underline decoration-amber-400/40"
                        title="Click to customize name"
                      >
                        {candidateName} ✏️
                      </div>
                    )}
                  </div>

                  {/* Certified Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-black/40 border border-amber-500/30 font-mono my-3 sm:my-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Speed</span>
                      <div className="text-xl sm:text-3xl font-black text-amber-300 tabular-nums">
                        {lastResult.netWpm} <span className="text-xs font-normal">WPM</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Accuracy</span>
                      <div className="text-xl sm:text-3xl font-black text-emerald-300 tabular-nums">
                        {lastResult.accuracy}%
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase">Ranking</span>
                      <div className="text-[11px] sm:text-sm font-bold text-white mt-1 leading-tight line-clamp-1">
                        {rankInfo.title}
                      </div>
                    </div>
                  </div>

                  {/* Creator Signature Credit in Certificate */}
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-300 font-mono flex items-center justify-between">
                    <span>Certification Issued By: <strong>AZ Typing Fire Engine</strong></span>
                    <span className="text-amber-300 font-bold uppercase">Architect: MALIK MUHAMMAD ADIL ZAMAN</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] sm:text-xs text-slate-400 font-mono pt-3 sm:pt-4 border-t border-white/[0.08]">
                    <span>Verified on: {lastResult.date}</span>
                    <span className="text-amber-300 font-semibold">{rankInfo.percentile}</span>
                    <span className="text-slate-500">AZ-FIRE-VERIFIED</span>
                  </div>
                </div>

                {/* Certificate Action Buttons */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Certificate (PNG)</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* High-Resolution Certificate Modal with PNG download */}
              {isCertModalOpen && (
                <CertificateModal
                  isOpen={isCertModalOpen}
                  onClose={() => setIsCertModalOpen(false)}
                  record={{
                    id: 'cert-' + Date.now(),
                    timestamp: Date.now(),
                    mode: 'custom',
                    title: activeBenchmark.title,
                    wpm: lastResult.netWpm,
                    netWpm: lastResult.netWpm,
                    accuracy: lastResult.accuracy,
                    timeSeconds: lastResult.timeSeconds,
                    characterCount: lastResult.characters,
                    errors: lastResult.errors,
                  }}
                  defaultName={candidateName}
                  isUrduTest={lastResult.isUrduTest}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
