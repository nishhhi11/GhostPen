import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  AlertCircle,
  Inbox,
  ArrowLeft,
  FileText,
  FileImage,
  CheckCircle2
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function DashboardPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [isExpired, setIsExpired] = useState(false);
  const [dropData, setDropData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId;
    
    const fetchDrop = async () => {
      try {
        const response = await fetch(`/api/dashboard/${id}?token=${token}`);
        if (!response.ok) {
          setIsExpired(true);
          setTimeLeft('Expired');
          setError('Drop not found, expired, or invalid token.');
          return;
        }
        const data = await response.json();
        setDropData(data);
        
        const updateTimer = () => {
          const now = Date.now();
          const diff = data.expiresAt - now;
          if (diff <= 0) {
            setTimeLeft('Expired');
            setIsExpired(true);
            clearInterval(intervalId);
            return;
          }
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        };
        
        updateTimer();
        intervalId = setInterval(updateTimer, 1000);
      } catch (err) {
        setIsExpired(true);
        setTimeLeft('Error');
        setError('Failed to connect to the server.');
      }
    };
    
    fetchDrop();
    return () => clearInterval(intervalId);
  }, [id, token]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/40">GhostPen Dashboard</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-20 flex flex-col">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
            <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-white">Access Denied</h1>
            <p className="text-white/50">{error}</p>
          </div>
        ) : (
          <>
            <FadeIn>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-semibold mb-3 text-white">Private Dashboard</h1>
                  <p className="text-white/50 text-balance leading-relaxed">
                    {dropData?.status === 'submitted' 
                      ? 'Evidence received securely.' 
                      : 'Waiting for the source to submit evidence securely.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="w-20 text-center font-mono">{timeLeft}</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="flex-1">
              {dropData?.status === 'submitted' ? (
                <div className="space-y-6">
                  {dropData.evidence?.text && (
                    <div className="glass-panel p-6">
                      <div className="flex items-center gap-2 mb-4 text-white/40">
                        <FileText className="w-4 h-4" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider">Submitted Text</h3>
                      </div>
                      <div className="text-white/90 whitespace-pre-wrap leading-relaxed font-mono text-sm bg-graphite-900 border border-white/10 rounded-xl p-4">
                        {dropData.evidence.text}
                      </div>
                    </div>
                  )}
                  
                  {dropData.evidence?.fileData && (
                    <div className="glass-panel p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-white/40">
                          <FileImage className="w-4 h-4" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider">Attached Image</h3>
                        </div>
                        <div className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded">
                          {dropData.evidence.fileName}
                        </div>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-graphite-900 flex justify-center">
                        <img 
                          src={dropData.evidence.fileData} 
                          alt="Evidence" 
                          className="max-w-full h-auto object-contain max-h-[500px]" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-white/[0.02]">
                  <Inbox className="w-10 h-10 text-white/20 mb-4" />
                  <h3 className="text-lg font-medium text-white/80 mb-1">Awaiting Submission...</h3>
                  <p className="text-sm text-white/40">Evidence will securely appear here once submitted by the source.</p>
                </div>
              )}
            </FadeIn>
            
            <FadeIn delay={0.2} className="mt-8">
              <div className="glass-panel p-6">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Drop Details</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Drop ID</span>
                    <span className="text-white/80 font-mono">{id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Status</span>
                    <span className={isExpired ? "text-red-400" : dropData?.status === 'submitted' ? "text-green-400 flex items-center gap-1" : "text-yellow-400"}>
                      {isExpired ? 'Expired' : dropData?.status === 'submitted' ? <><CheckCircle2 className="w-3.5 h-3.5"/> Submitted</> : 'Active / Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Created</span>
                    <span className="text-white/80">
                      {dropData?.createdAt ? new Date(dropData.createdAt).toLocaleTimeString() : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </main>
    </div>
  );
}
