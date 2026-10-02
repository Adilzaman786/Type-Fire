import React, { useState, useRef } from 'react';
import { X, Download, Printer, Share2, Check, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { TestRecord } from '../types/typing';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TestRecord;
  defaultName?: string;
  isUrduTest?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  record,
  defaultName = 'Candidate Typist',
  isUrduTest = false,
}) => {
  const [candidateName, setCandidateName] = useState(defaultName || 'Candidate Typist');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Generate a reproducible certificate verification serial ID
  const certId = `AZ-FIRE-${Math.abs(record.timestamp || Date.now()).toString(36).toUpperCase()}-${record.netWpm}W`;
  const formattedDate = new Date(record.timestamp || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate skill rank title
  const getRankTitle = (wpm: number) => {
    if (wpm >= 100) return 'Legendary Grandmaster Typist';
    if (wpm >= 80) return 'Master Speed Typist';
    if (wpm >= 65) return 'Professional Fast Typist';
    if (wpm >= 50) return 'Skilled Touch Typist';
    if (wpm >= 35) return 'Certified Intermediate Typist';
    return 'Developing Touch Typist';
  };

  const rankTitle = getRankTitle(record.netWpm);

  // Download certificate as crisp PNG image
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use html2canvas or Canvas API drawing
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark luxurious certificate background
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#0c101d');
      grad.addColorStop(0.5, '#141d33');
      grad.addColorStop(1, '#070a12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Gold ornamental border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, 1140, 740);

      // Inner thin border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, 1110, 710);

      // Header Brand
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AZ TYPING FIRE · SPEED CERTIFICATION', 600, 105);

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 46px system-ui, sans-serif';
      ctx.fillText('CERTIFICATE OF TYPING PROFICIENCY', 600, 175);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('This official credential certifies that', 600, 230);

      // Candidate Name
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText(candidateName.toUpperCase(), 600, 295);

      // Achievement Description
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '20px system-ui, sans-serif';
      const desc = `has achieved verified proficiency in ${isUrduTest ? 'Urdu Nastaliq' : 'English Touch'} typing on the test titled:`;
      ctx.fillText(desc, 600, 350);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(`"${record.title || 'Official Typing Speed Assessment'}"`, 600, 390);

      // Metrics Box Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(200, 430, 800, 140);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(200, 430, 800, 140);

      // Net WPM
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 52px system-ui, sans-serif';
      ctx.fillText(`${record.netWpm}`, 330, 500);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('NET WPM (SPEED)', 330, 535);

      // Accuracy
      ctx.fillStyle = '#34d399';
      ctx.font = '900 52px system-ui, sans-serif';
      ctx.fillText(`${record.accuracy}%`, 600, 500);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('ACCURACY', 600, 535);

      // Rank Title
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(rankTitle, 870, 495);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('CERTIFIED RANK', 870, 535);

      // Bottom Signatures & Verification Details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('MALIK MUHAMMAD ADIL ZAMAN', 150, 675);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('Platform Founder & Lead Engineer', 150, 700);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`ID: ${certId}`, 1050, 665);
      ctx.fillText(`Issued: ${formattedDate}`, 1050, 690);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('Verified by AZ Typing Fire Official Standard', 1050, 715);

      // Convert to image download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AZ-Typing-Fire-Certificate-${candidateName.replace(/\s+/g, '_')}-${record.netWpm}WPM.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Certificate generation error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://az-typing-fire.app/verify/${certId} · Certified ${record.netWpm} WPM with ${record.accuracy}% accuracy by Malik Muhammad Adil Zaman`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl glass-panel border border-amber-500/40 bg-gradient-to-b from-[#141d33] via-[#0e1424] to-[#070a12] p-5 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-6">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Verified Typing Speed Certificate</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Verified ✅
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official credential issued by Malik Muhammad Adil Zaman platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Name Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Candidate Name on Certificate:</span>
            {isEditingName ? (
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="px-3 py-1 text-sm font-bold text-white bg-slate-800 rounded-lg border border-cyan-400 focus:outline-none"
              />
            ) : (
              <span className="text-sm font-bold text-cyan-300 bg-white/[0.06] px-3 py-1 rounded-lg border border-white/10">
                {candidateName}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsEditingName((prev) => !prev)}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
          >
            {isEditingName ? 'Done Editing' : 'Edit Candidate Name'}
          </button>
        </div>

        {/* Visual Certificate Card Preview (Printable) */}
        <div
          ref={certRef}
          className="relative rounded-2xl p-6 sm:p-10 border-4 border-amber-500/70 bg-gradient-to-br from-[#0c1222] via-[#10172c] to-[#080d1a] shadow-2xl text-center space-y-6 overflow-hidden"
        >
          {/* Inner Decorative Framing Ring */}
          <div className="absolute inset-2 border border-cyan-400/30 rounded-xl pointer-events-none" />

          {/* Watermark Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5 select-none">
            <Award className="w-96 h-96 text-white" />
          </div>

          {/* Header */}
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-mono tracking-widest text-amber-400 uppercase font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>AZ TYPING FIRE · SPEED CERTIFICATION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Certificate of Typing Proficiency
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              This official credential certifies that
            </p>
          </div>

          {/* Candidate Name in Gold / Cyan */}
          <div className="py-2 relative z-10">
            <span className="text-2xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 underline decoration-amber-500/50 decoration-2 underline-offset-8">
              {candidateName.toUpperCase()}
            </span>
          </div>

          {/* Achievement Statement */}
          <div className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 relative z-10 leading-relaxed">
            has achieved verified proficiency in{' '}
            <strong className="text-cyan-300 font-bold">
              {isUrduTest ? 'Urdu Nastaliq Script' : 'English Touch Typing'}
            </strong>{' '}
            on the standardized speed evaluation:
            <div className="text-amber-300 font-semibold mt-1">
              "{record.title || 'Official Typing Speed Assessment'}"
            </div>
          </div>

          {/* Key Metrics Display */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-lg mx-auto p-4 rounded-2xl bg-black/50 border border-white/10 relative z-10 font-mono">
            <div>
              <div className="text-2xl sm:text-4xl font-extrabold text-cyan-300 tabular-nums">
                {record.netWpm}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                Net WPM
              </div>
            </div>

            <div className="border-x border-white/10 px-2">
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-300 tabular-nums">
                {record.accuracy}%
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                Accuracy
              </div>
            </div>

            <div>
              <div className="text-base sm:text-lg font-bold text-amber-300 mt-1 sm:mt-2">
                {rankTitle}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">
                Proficiency Rank
              </div>
            </div>
          </div>

          {/* Bottom Authority & Serial Section */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-10">
            {/* Signature Block */}
            <div className="text-left space-y-0.5">
              <div className="font-serif text-lg font-bold text-amber-200 italic tracking-wider">
                Malik Muhammad Adil Zaman
              </div>
              <div className="text-xs font-semibold text-white">
                MALIK MUHAMMAD ADIL ZAMAN
              </div>
              <div className="text-[11px] text-slate-400">
                Platform Founder &amp; Chief Engineer
              </div>
            </div>

            {/* Seal / Emblem */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-[8px] font-black tracking-widest uppercase">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="text-right space-y-0.5 font-mono text-[11px] text-slate-400">
              <div>Serial: <strong className="text-slate-200">{certId}</strong></div>
              <div>Issue Date: <strong className="text-slate-200">{formattedDate}</strong></div>
              <div className="text-cyan-400 font-sans text-[10px]">Official AZ Typing Fire Standard</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Verification Copied!' : 'Copy Verification'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating Image...' : 'Download Official Certificate (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
