import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  AlertCircle,
  Inbox,
  ArrowLeft,
  FileText,
  FileImage,
  CheckCircle2,
  Key,
  Flame,
  ShieldOff
} from 'lucide-react';
import { decryptData, importKeyFromBase64 } from '../lib/crypto';
import ThemeToggle from '../components/ui/ThemeToggle';

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
  
  const [decryptedText, setDecryptedText] = useState(null);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState(null);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isBurned, setIsBurned] = useState(false);

  const handleBurn = async () => {
    try {
      setIsBurning(true);
      const response = await fetch(`/api/drops/${id}?token=${token}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to destroy session');
      }
      
      // Clear the encryption key from URL hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      // Clear local state
      setDecryptedText(null);
      setDecryptedImage(null);
      setDropData(null);
      setShowBurnModal(false);
      setIsBurned(true);
    } catch (err) {
      console.error(err);
      setError('Failed to destroy session.');
      setShowBurnModal(false);
    } finally {
      setIsBurning(false);
    }
  };

  const handleDecrypt = async () => {
    try {
      setIsDecrypting(true);
      setDecryptError(null);
      
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const keyString = hashParams.get('key');
      if (!keyString) throw new Error("No session key found in URL.");
      
      const key = await importKeyFromBase64(keyString);

      if (dropData.evidence.text) {
        const encryptedTextObj = JSON.parse(dropData.evidence.text);
        const decryptedT = await decryptData(encryptedTextObj, key);
        setDecryptedText(decryptedT);
      }
      
      if (dropData.evidence.fileData) {
        const encryptedFileObj = JSON.parse(dropData.evidence.fileData);
        const decryptedF = await decryptData(encryptedFileObj, key);
        setDecryptedImage(decryptedF);
      }
    } catch (err) {
      console.error(err);
      setDecryptError("Decryption failed. Invalid key or data.");
    } finally {
      setIsDecrypting(false);
    }
  };

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-mono-800">
      {/* Header */}
      <header className="relative w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group text-mono-text-muted hover:text-mono-text transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono font-medium">Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mono-text-faint" />
            <span className="text-sm font-mono font-medium text-mono-text-faint">GhostPen Dashboard</span>
          </div>
        </div>
      </header>

      <main className="relative flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-20 flex flex-col">
        {isBurned ? (
          <FadeIn>
            <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="flex items-center justify-center mb-8"
              >
                <ShieldOff className="w-14 h-14 text-mono-text" />
              </motion.div>
              <h1 className="text-3xl font-bold font-mono mb-3 text-mono-text tracking-tight">SESSION DESTROYED</h1>
              <div className="text-mono-text-muted space-y-1.5 text-sm mt-2 font-mono">
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>• Server-side evidence deleted</motion.p>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>• Encryption key cleared</motion.p>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>• Drop invalidated</motion.p>
              </div>
              <Link
                to="/"
                className="mt-10 px-8 py-3 rounded bg-mono-accent text-mono-900 font-mono hover:bg-mono-text transition-colors flex items-center justify-center"
              >
                Return to Home
              </Link>
            </div>
          </FadeIn>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
            <div className="w-16 h-16 rounded bg-mono-900 border border-red-500/30 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-mono font-semibold mb-3 text-mono-text">Access Denied</h1>
            <p className="text-mono-text-muted font-mono">{error}</p>
          </div>
        ) : (
          <>
            <FadeIn>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-mono font-semibold mb-3 text-mono-text">Private Dashboard</h1>
                  <p className="text-mono-text-muted text-balance font-mono leading-relaxed">
                    {dropData?.status === 'submitted' 
                      ? 'Evidence received securely.' 
                      : 'Waiting for the source to submit evidence securely.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-mono-text-muted bg-mono-900 border border-mono-border px-4 py-2 rounded text-sm font-mono font-medium mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="w-20 text-center font-mono">{timeLeft}</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="flex-1">
              {dropData?.status === 'submitted' ? (
                <div className="space-y-6">
                  {dropData.evidence?.text && (
                    <div className="bg-mono-800 border border-mono-border rounded p-6">
                      <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                        <FileText className="w-4 h-4" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Submitted Text</h3>
                      </div>
                      
                      {!decryptedText ? (
                        <div className="flex flex-col items-center justify-center p-6 border border-mono-border-strong rounded bg-mono-900 gap-4">
                          <p className="text-sm font-mono text-mono-text-muted text-center max-w-sm">
                            This evidence is encrypted. You need the session key from the URL to view it.
                          </p>
                          <button
                            onClick={handleDecrypt}
                            disabled={isDecrypting}
                            className="px-5 py-2.5 rounded bg-mono-accent text-mono-900 font-mono hover:bg-mono-text transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <Key className="w-4 h-4" />
                            {isDecrypting ? 'Decrypting...' : 'Decrypt & View Evidence'}
                          </button>
                          {decryptError && (
                            <p className="text-red-500 font-mono text-xs mt-2">{decryptError}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-3 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Decrypted locally</span>
                          </div>
                          <div className="text-mono-text whitespace-pre-wrap leading-relaxed font-mono text-sm bg-mono-900 border border-green-500/30 rounded p-4">
                            {decryptedText}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {dropData.evidence?.fileData && (
                    <div className="bg-mono-800 border border-mono-border rounded p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-mono-text-muted">
                          <FileImage className="w-4 h-4" />
                          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Attached Image</h3>
                        </div>
                        <div className="text-xs font-mono text-mono-text-muted bg-mono-900 border border-mono-border px-2 py-1 rounded">
                          {dropData.evidence.fileName}
                        </div>
                      </div>
                      <div className="rounded border border-mono-border-strong bg-mono-900 flex justify-center p-4">
                        {!decryptedImage ? (
                          <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
                            <FileImage className="w-8 h-8 text-mono-text-faint" />
                            <p className="text-sm font-mono text-mono-text-muted max-w-sm">
                              This image is encrypted. Click the "Decrypt & View Evidence" button above to view it.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2 mb-1 text-green-500 self-start">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs font-mono font-semibold uppercase tracking-wider">Decrypted locally</span>
                            </div>
                            <img 
                              src={decryptedImage} 
                              alt="Evidence" 
                              className="max-w-full h-auto object-contain max-h-[500px] mx-auto rounded" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-mono-border-strong rounded bg-mono-800 flex flex-col items-center justify-center text-center">
                  <Inbox className="w-10 h-10 text-mono-text-faint mb-4" />
                  <h3 className="text-lg font-mono font-medium text-mono-text mb-1">Awaiting Submission...</h3>
                  <p className="text-sm font-mono text-mono-text-muted">Evidence will securely appear here once submitted by the source.</p>
                </div>
              )}
            </FadeIn>
            
            <FadeIn delay={0.2} className="mt-8">
              <div className="bg-mono-800 border border-mono-border rounded p-6">
                <h3 className="text-xs font-mono font-semibold text-mono-text-muted uppercase tracking-wider mb-2">Drop Details</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-mono-text-muted">Drop ID</span>
                    <span className="text-mono-text">{id}</span>
                  </div>
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-mono-text-muted">Status</span>
                    <span className={isExpired ? "text-red-500" : dropData?.status === 'submitted' ? "text-green-500 flex items-center gap-1" : "text-yellow-500"}>
                      {isExpired ? 'Expired' : dropData?.status === 'submitted' ? <><CheckCircle2 className="w-3.5 h-3.5"/> Submitted</> : 'Active / Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-mono-text-muted">Created</span>
                    <span className="text-mono-text">
                      {dropData?.createdAt ? new Date(dropData.createdAt).toLocaleTimeString() : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3} className="mt-6">
              <button
                onClick={() => setShowBurnModal(true)}
                className="w-full py-3.5 rounded bg-mono-900 border border-red-500/30 text-red-500 font-mono hover:bg-mono-800 transition-colors flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Burn Session
              </button>
            </FadeIn>
          </>
        )}
      </main>

      {/* Burn Confirmation Modal */}
      <AnimatePresence>
        {showBurnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6"
            onClick={() => setShowBurnModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full max-w-sm bg-mono-800 border border-mono-border-strong p-6 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded bg-mono-900 border border-red-500/30 flex items-center justify-center mb-5">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-lg font-mono font-semibold text-mono-text mb-2">Burn this evidence session?</h2>
                <p className="text-sm font-mono text-mono-text-muted mb-6">All stored evidence will be permanently deleted.</p>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowBurnModal(false)}
                    className="flex-1 py-3 rounded bg-mono-900 border border-mono-border text-mono-text font-mono hover:bg-mono-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBurn}
                    disabled={isBurning}
                    className="flex-1 py-3 rounded bg-red-900 border border-red-500/50 text-white font-mono hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {isBurning ? 'Destroying...' : 'Burn Session'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
