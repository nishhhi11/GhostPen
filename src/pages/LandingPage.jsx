import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  EyeOff, 
  Flame, 
  Lock, 
  FileImage, 
  CheckCircle, 
  ArrowRight,
  Fingerprint,
  FileSearch,
  ServerOff,
  ChevronRight,
  AlertTriangle,
  Ghost
} from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-mono-900">
      {/* Grid Noise */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-12">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded flex items-center justify-center border border-mono-border-strong bg-mono-900">
              <Ghost className="w-5 h-5 text-mono-text" />
            </div>
            <span className="font-semibold text-2xl tracking-tight text-mono-text font-sans">GhostPen</span>
          </div>
          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-8 ml-4">
            <a href="#how-it-works" className="text-[15px] font-mono text-mono-text-muted hover:text-mono-text transition-colors">How it works</a>
            <a href="#security" className="text-[15px] font-mono text-mono-text-muted hover:text-mono-text transition-colors">Security</a>
            <Link to="/demo" className="text-[15px] font-mono text-mono-text-muted hover:text-mono-text transition-colors">Demo</Link>
          </nav>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/create" className="hidden sm:flex px-6 py-3 text-[15px] font-mono text-mono-text border border-mono-border-strong rounded hover:bg-mono-800 transition-colors">
            Create drop
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full flex flex-col items-center px-4">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto pt-20 pb-24 text-center flex flex-col items-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded border border-mono-border-strong bg-mono-800 text-xs font-mono text-mono-text mb-6">
              <Lock className="w-3.5 h-3.5" />
              <span className="tracking-wide">Encrypted in your browser · Ephemeral by design</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-balance mb-5 text-mono-text leading-tight">
              Some information shouldn't live forever.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-mono-text-muted max-w-2xl text-balance mb-10">
              GhostPen is a temporary digital dead drop for sensitive evidence. 
              Deliver information without creating a permanent conversation.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link 
              to="/create" 
              className="px-6 py-3 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2"
            >
              Create Evidence Drop
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/demo" 
              className="px-6 py-3 border border-mono-border-strong text-mono-text font-mono rounded hover:bg-mono-800 transition-colors flex items-center justify-center gap-2"
            >
              Try Interactive Demo
            </Link>
          </FadeIn>
        </section>

        {/* Interactive Product Preview */}
        <section className="w-full max-w-4xl mx-auto mb-28 relative z-10">
          <FadeIn delay={0.4}>
            <div className="bg-mono-800 border border-mono-border rounded p-8 md:p-12 relative group">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                
                {/* Left: File simulation */}
                <div className="flex-1 w-full bg-mono-900 border border-mono-border-strong rounded p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded bg-mono-800 border border-mono-border flex items-center justify-center">
                      <FileImage className="w-6 h-6 text-mono-text-muted" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-mono-text">IMG_4821.jpg</div>
                      <div className="text-xs font-mono text-mono-text-faint">4.2 MB · Evidence</div>
                    </div>
                  </div>
                  
                  <div className="rounded border border-green-500/30 bg-mono-800 p-4 flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-green-500 font-mono">Privacy scan complete</div>
                      <div className="text-xs font-mono text-mono-text-muted mt-1">4 potentially identifying fields detected and sanitized.</div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Status */}
                <div className="w-full md:w-64 space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-mono-text-faint uppercase tracking-wider mb-4">Protection</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-mono-text-muted" />
                        <span className="text-sm font-mono text-mono-text">Client-side encrypted</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ServerOff className="w-4 h-4 text-mono-text-muted" />
                        <span className="text-sm font-mono text-mono-text">Ephemeral storage</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Flame className="w-4 h-4 text-mono-text-muted" />
                        <span className="text-sm font-mono text-mono-text">Burn available</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </FadeIn>
        </section>

        <section id="how-it-works" className="w-full max-w-5xl mx-auto py-20 border-t border-white/[0.05]">
          <FadeIn>
            <h2 className="text-3xl font-semibold mb-14 text-center">How it works</h2>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 items-stretch">
            {[
              { num: "01", title: "Create", desc: "Generate a temporary evidence drop with a time-limited secure link.", icon: Shield },
              { num: "02", title: "Protect", desc: "Scan files for potentially identifying EXIF metadata and strip it.", icon: FileSearch },
              { num: "03", title: "Deliver", desc: "Encrypt evidence with AES-256-GCM before it leaves the browser.", icon: Lock },
              { num: "04", title: "Burn", desc: "Destroy the active drop. Server data deleted, key purged.", icon: Flame }
            ].map((step, i, arr) => (
              <FadeIn key={step.num} delay={0.1 * i} className="flex">
                {/* Step card */}
                <div className="flex-1 flex flex-col bg-mono-800 border border-mono-border rounded p-7 hover:bg-mono-700 transition-colors duration-300">
                  <div className="text-mono-text-faint font-mono text-sm mb-5 border-b border-mono-border-strong pb-3 tracking-widest">{step.num}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="shrink-0">
                      <step.icon className="w-5 h-5 text-mono-text" />
                    </div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                  </div>
                  <p className="text-sm text-mono-text-muted leading-relaxed">{step.desc}</p>
                </div>
                {/* Connecting arrow (between cards, not after last) */}
                {i < arr.length - 1 && (
                  <div className="hidden md:flex items-center justify-center w-8 shrink-0">
                    <ChevronRight className="w-4 h-4 text-mono-text-faint" />
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="security" className="w-full max-w-5xl mx-auto py-20 border-t border-white/[0.05]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-semibold mb-6 text-mono-text">Security by design</h2>
                <p className="text-mono-text-muted text-lg mb-8 text-balance">
                  Engineered to protect sources and sensitive information through zero-trust principles.
                </p>
              </FadeIn>
              
              <div className="space-y-5">
                <FadeIn delay={0.1}>
                  <div className="flex gap-4 group">
                    <div className="shrink-0 mt-0.5">
                      <Lock className="w-5 h-5 text-mono-text" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-mono-text">Client-side encryption</h4>
                      <p className="text-sm text-mono-text-muted">Keys never leave your device. The server only sees ciphertext.</p>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <div className="flex gap-4 group">
                    <div className="shrink-0 mt-0.5">
                      <Flame className="w-5 h-5 text-mono-text" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-mono-text">Ephemeral by design</h4>
                      <p className="text-sm text-mono-text-muted">Drops self-destruct after viewing or when the timer expires. No backups.</p>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="flex gap-4 group">
                    <div className="shrink-0 mt-0.5">
                      <Fingerprint className="w-5 h-5 text-mono-text" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-mono-text">Metadata awareness</h4>
                      <p className="text-sm text-mono-text-muted">Automatic detection and removal of EXIF data, GPS coordinates, and device info.</p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
            
            {/* Code snippet with terminal header */}
            <FadeIn delay={0.4} className="bg-mono-800 border border-mono-border rounded p-0 group overflow-hidden">
              {/* Terminal header bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-mono-border bg-mono-900">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border border-mono-border-strong"></div>
                  <div className="w-2.5 h-2.5 rounded-full border border-mono-border-strong"></div>
                  <div className="w-2.5 h-2.5 rounded-full border border-mono-border-strong"></div>
                </div>
                <span className="text-[10px] font-mono text-mono-text-muted ml-2 tracking-wider">crypto.js — GhostPen</span>
              </div>
              {/* Code content */}
              <div className="bg-mono-800 p-8 md:p-10">
                <div className="font-mono text-xs text-mono-text-muted space-y-3 relative z-10">
                  <div className="text-mono-text-faint tracking-wider uppercase">// Encryption process</div>
                  <div className="text-mono-text">const key = <span className="text-mono-text-muted">await</span> crypto.subtle.generateKey(...)</div>
                  <div className="text-mono-text">const iv = crypto.getRandomValues(<span className="text-mono-text-muted">new Uint8Array</span>(12))</div>
                  <div className="text-mono-text-faint py-2">...</div>
                  <div className="text-mono-text-faint tracking-wider uppercase">// Data is encrypted locally</div>
                  <div className="text-mono-text">const ciphertext = <span className="text-mono-text-muted">await</span> crypto.subtle.encrypt(</div>
                  <div className="pl-6 text-mono-text-muted">{"{ name: 'AES-GCM', iv }"}</div>
                  <div className="pl-6 text-mono-text-muted">key,</div>
                  <div className="pl-6 text-mono-text-muted">encodedData</div>
                  <div className="text-mono-text">)</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Honest by design — distinct callout card */}
        <section className="w-full max-w-3xl mx-auto py-16 border-t border-white/[0.05] mb-8">
          <FadeIn>
            <div className="bg-mono-800 border border-mono-border rounded p-8 md:p-10 relative overflow-hidden">
              {/* Subtle monochrome left accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-mono-border-strong"></div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0 mt-1">
                  <AlertTriangle className="w-6 h-6 text-mono-text-muted" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-mono-text">Honest by design</h2>
                  <p className="text-mono-text-muted leading-relaxed text-sm text-balance">
                    Security tools should be transparent about their limitations. GhostPen does <strong className="text-mono-text">NOT</strong> claim to prevent screenshots, secure compromised devices, eliminate all network metadata, or control what recipients do with the information once decrypted. It is a secure delivery mechanism, not magic.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-mono-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-mono text-mono-text-faint">
        <div className="flex items-center gap-2">
          <Ghost className="w-4 h-4" />
          <span className="font-medium">GhostPen</span>
        </div>
        <div className="flex gap-4">
          <span>Open source</span>
          <span>&middot;</span>
          <span>Local-first</span>
          <span>&middot;</span>
          <span>Privacy-respecting</span>
        </div>
      </footer>
    </div>
  );
}
