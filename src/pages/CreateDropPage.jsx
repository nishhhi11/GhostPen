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
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { generateKey, exportKeyToBase64 } from '../lib/crypto';
import ThemeToggle from '../components/ui/ThemeToggle';

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
  const [copiedDash, setCopiedDash] = useState(false);
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
      
      const key = await generateKey();
      const b64Key = await exportKeyToBase64(key);
      
      setCreatedDrop({
        id: data.id,
        url: `${window.location.origin}/drop/${data.id}?token=${data.sourceToken}#key=${b64Key}`,
        dashboardUrl: `${window.location.origin}/dashboard/${data.id}?token=${data.creatorToken}#key=${b64Key}`,
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

  const handleCopy = async (url, type) => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === 'dash') {
        setCopiedDash(true);
        setTimeout(() => setCopiedDash(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-mono-900">
      {/* Grid Noise */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group text-mono-text-muted hover:text-mono-text transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mono-text-muted" />
            <span className="text-sm font-medium font-mono text-mono-text-muted">GhostPen</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!createdDrop ? (
            <FadeIn key="create-form" className="w-full">
              <div className="mb-10 text-center">
                <div className="flex justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-mono-text" />
                </div>
                <h1 className="text-3xl font-semibold mb-3 text-mono-text">Create an evidence drop</h1>
                <p className="text-mono-text-muted text-balance">
                  Generate a temporary, encrypted submission space. The drop will automatically self-destruct once the evidence is accessed or the time expires.
                </p>
              </div>

              <div className="bg-mono-800 border border-mono-border rounded p-8 mb-8">
                <div className="flex items-center gap-2 mb-4 text-mono-text font-medium">
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
                      className={`py-3 px-4 rounded border text-sm font-medium font-mono transition-all duration-300 ${
                        expiration === opt.value
                          ? 'border-mono-border-strong bg-mono-900 text-mono-text'
                          : 'border-mono-border bg-mono-900 text-mono-text-muted hover:text-mono-text'
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
                className="w-full py-4 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors"
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-mono-text" />
                </motion.div>
                <h1 className="text-3xl font-semibold mb-3 text-mono-text">Drop Created</h1>
                <p className="text-mono-text-muted text-balance">
                  Share this unique link with your source. It will expire in {
                    expiration === '5m' ? '5 minutes' : 
                    expiration === '15m' ? '15 minutes' : '1 hour'
                  } or immediately after being accessed.
                </p>
              </div>

              {/* Two-column layout on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Source link card */}
                <div className="bg-mono-800 border border-mono-border rounded p-6">
                  <h3 className="text-xs font-semibold font-mono text-mono-text-faint uppercase tracking-wider mb-3">Source Submission Link</h3>
                  <p className="text-[11px] text-mono-text-muted mb-4">Give this to your source — they'll submit evidence here.</p>
                  <div className="bg-mono-900 border border-mono-border-strong rounded p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5 text-mono-text-muted shrink-0" />
                      <div className="font-mono text-xs text-mono-text truncate flex-1">
                        {createdDrop.url}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(createdDrop.url, 'source')}
                    className={`w-full py-2.5 rounded text-sm font-mono transition-colors duration-300 flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-mono-900 border border-green-500/30 text-green-500'
                        : 'bg-mono-900 border border-mono-border-strong text-mono-text-muted hover:text-mono-text hover:bg-mono-800'
                    }`}
                  >
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Source Link</>}
                  </button>
                </div>

                {/* Dashboard card */}
                <div className="bg-mono-800 border border-mono-border rounded p-6">
                  <h3 className="text-xs font-semibold font-mono text-mono-text-faint uppercase tracking-wider mb-3">Private Dashboard</h3>
                  <p className="text-[11px] text-mono-text-muted mb-4">Your private view — decrypt evidence and manage the drop.</p>
                  <div className="bg-mono-900 border border-mono-border-strong rounded p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-mono-text-muted shrink-0" />
                      <div className="font-mono text-xs text-mono-text truncate flex-1">
                        {createdDrop.dashboardUrl}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopy(createdDrop.dashboardUrl, 'dash')}
                      className={`flex-1 py-2.5 rounded text-sm font-mono transition-colors duration-300 flex items-center justify-center gap-2 ${
                        copiedDash
                          ? 'bg-mono-900 border border-green-500/30 text-green-500'
                          : 'bg-mono-900 border border-mono-border-strong text-mono-text-muted hover:text-mono-text hover:bg-mono-800'
                      }`}
                    >
                      {copiedDash ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                    <Link
                      to={(() => {
                        const u = new URL(createdDrop.dashboardUrl);
                        return `${u.pathname}${u.search}${u.hash}`;
                      })()}
                      className="flex-1 py-2.5 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drop ID */}
              <div className="text-center mb-8">
                <span className="text-[10px] font-semibold font-mono text-mono-text-faint uppercase tracking-wider">Drop ID: </span>
                <span className="font-mono text-[10px] text-mono-text-muted">{createdDrop.id}</span>
              </div>

              <button
                onClick={() => setCreatedDrop(null)}
                className="w-full py-4 rounded border border-mono-border-strong text-mono-text font-mono hover:bg-mono-800 transition-colors"
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
