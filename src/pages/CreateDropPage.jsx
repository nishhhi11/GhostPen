import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  Plus, 
  Check, 
  Copy, 
  ArrowLeft,
  Link as LinkIcon 
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function CreateDropPage() {
  const [expiration, setExpiration] = useState('15m');
  const [createdDrop, setCreatedDrop] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/drops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiration })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setCreatedDrop({
        id: data.id,
        url: `${window.location.origin}/drop/${data.id}?token=${data.sourceToken}`,
        dashboardUrl: `${window.location.origin}/dashboard/${data.id}?token=${data.creatorToken}`,
        expires: expiration
      });
    } catch (err) {
      console.error('Error creating drop:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Cannot connect to server. Is the Express backend running?' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdDrop) return;
    try {
      await navigator.clipboard.writeText(createdDrop.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
          <span className="text-sm font-medium text-white/40">GhostPen</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!createdDrop ? (
            <FadeIn key="create-form" className="w-full">
              <div className="mb-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-semibold mb-3 text-white">Create an evidence drop</h1>
                <p className="text-white/50 text-balance">
                  Generate a temporary, encrypted submission space. The drop will automatically self-destruct once the evidence is accessed or the time expires.
                </p>
              </div>

              <div className="glass-panel p-6 mb-8">
                <div className="flex items-center gap-2 mb-4 text-white/80 font-medium">
                  <Clock className="w-4 h-4" />
                  <h2>Expiration time</h2>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '5m', label: '5 min' },
                    { value: '15m', label: '15 min' },
                    { value: '1h', label: '1 hour' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setExpiration(opt.value)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        expiration === opt.value
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/5 bg-transparent text-white/40 hover:bg-white/5 hover:text-white/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-white text-graphite-900 font-semibold hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                {isLoading ? 'Creating Drop...' : 'Create Secure Drop'}
              </button>
              
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </FadeIn>
          ) : (
            <FadeIn key="drop-result" className="w-full">
              <div className="mb-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <h1 className="text-3xl font-semibold mb-3 text-white">Drop Created</h1>
                <p className="text-white/50 text-balance">
                  Share this unique link with your source. It will expire in {
                    expiration === '5m' ? '5 minutes' : 
                    expiration === '15m' ? '15 minutes' : '1 hour'
                  } or immediately after being accessed.
                </p>
              </div>

              <div className="glass-panel p-6 mb-8">
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Source Submission Link (Give to Source)</h3>
                  <div className="flex items-center gap-3 bg-graphite-900 border border-white/10 rounded-lg p-3">
                    <LinkIcon className="w-4 h-4 text-white/40 shrink-0" />
                    <div className="font-mono text-sm text-white/80 truncate flex-1">
                      {createdDrop.url}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 p-2 rounded-md hover:bg-white/10 transition-colors"
                      title="Copy Link"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/70" />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Private Drop Dashboard</h3>
                  <div className="flex items-center gap-3 bg-graphite-900 border border-white/10 rounded-lg p-3">
                    <Shield className="w-4 h-4 text-white/40 shrink-0" />
                    <div className="font-mono text-sm text-white/80 truncate flex-1">
                      {createdDrop.dashboardUrl}
                    </div>
                    <Link
                      to={`/dashboard/${createdDrop.id}?token=${new URL(createdDrop.dashboardUrl).searchParams.get('token')}`}
                      className="shrink-0 px-3 py-1.5 bg-white text-graphite-900 text-xs font-semibold rounded hover:bg-white/90 transition-colors"
                    >
                      Open Dashboard
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Drop ID (Reference)</h3>
                  <div className="font-mono text-xs text-white/30 truncate">
                    {createdDrop.id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCreatedDrop(null)}
                className="w-full py-4 rounded-xl bg-transparent border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Create Another Drop
              </button>
            </FadeIn>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
