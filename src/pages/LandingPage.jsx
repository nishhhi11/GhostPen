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
  ServerOff
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-lg tracking-tight">GhostPen</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center px-4">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto pt-24 pb-32 text-center flex flex-col items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/80 mb-8 backdrop-blur-sm">
              <Lock className="w-3 h-3" />
              <span>Encrypted in your browser · Ephemeral by design</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-balance mb-6 text-white">
              Some information shouldn't live forever.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl text-balance mb-12">
              GhostPen is a temporary digital dead drop for sensitive evidence. 
              Deliver information without creating a permanent conversation.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/create" 
              className="px-6 py-3 rounded-lg bg-white text-graphite-900 font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Create Evidence Drop
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/demo" 
              className="px-6 py-3 rounded-lg bg-glass border border-glass-border text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Try Interactive Demo
            </Link>
          </FadeIn>
        </section>

        {/* Interactive Product Preview */}
        <section className="w-full max-w-3xl mx-auto mb-40">
          <FadeIn delay={0.4}>
            <div className="glass-panel p-2 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="bg-graphite-800 rounded-xl border border-white/5 p-6 md:p-10 relative">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left: File simulation */}
                  <div className="flex-1 w-full bg-graphite-900 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/90">IMG_4821.jpg</div>
                        <div className="text-xs text-white/40">4.2 MB · Evidence</div>
                      </div>
                    </div>
                    
                    <div className="rounded border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-green-400 font-medium">Privacy scan complete</div>
                        <div className="text-xs text-green-400/70 mt-1">4 potentially identifying fields detected and sanitized.</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Status */}
                  <div className="w-full md:w-64 space-y-6">
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Protection</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white/80">Client-side encrypted</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ServerOff className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white/80">Ephemeral storage</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Flame className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white/80">Burn available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="w-full max-w-5xl mx-auto py-24 border-t border-white/5">
          <FadeIn>
            <h2 className="text-3xl font-semibold mb-16 text-center">How it works</h2>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Create", desc: "Generate a temporary evidence drop.", icon: Shield },
              { num: "02", title: "Protect", desc: "Scan files for potentially identifying metadata.", icon: FileSearch },
              { num: "03", title: "Deliver", desc: "Encrypt evidence before it leaves the browser.", icon: Lock },
              { num: "04", title: "Burn", desc: "Destroy the active drop when finished.", icon: Flame }
            ].map((step, i) => (
              <FadeIn key={step.num} delay={0.1 * i} className="flex flex-col">
                <div className="text-white/20 font-mono text-sm mb-4 border-b border-white/10 pb-4">{step.num}</div>
                <div className="flex items-center gap-2 mb-3">
                  <step.icon className="w-4 h-4 text-white/70" />
                  <h3 className="text-lg font-medium">{step.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Security by design */}
        <section id="security" className="w-full max-w-5xl mx-auto py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-semibold mb-6">Security by design</h2>
                <p className="text-white/50 text-lg mb-8 text-balance">
                  Engineered to protect sources and sensitive information through zero-trust principles.
                </p>
              </FadeIn>
              
              <div className="space-y-6">
                <FadeIn delay={0.1}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Lock className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Client-side encryption</h4>
                      <p className="text-sm text-white/50">Keys never leave your device. The server only sees ciphertext.</p>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Flame className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Ephemeral by design</h4>
                      <p className="text-sm text-white/50">Drops self-destruct after viewing or when the timer expires. No backups.</p>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Fingerprint className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Metadata awareness</h4>
                      <p className="text-sm text-white/50">Automatic detection and removal of EXIF data, GPS coordinates, and device info.</p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
            
            <FadeIn delay={0.4} className="glass-panel p-8 md:p-12 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="font-mono text-xs text-white/40 space-y-2">
                <div className="text-white/60">// Encryption process</div>
                <div>const key = await crypto.subtle.generateKey(...)</div>
                <div>const iv = crypto.getRandomValues(new Uint8Array(12))</div>
                <div className="text-white/20 pt-2 pb-2">...</div>
                <div className="text-white/60">// Data is encrypted locally</div>
                <div>const ciphertext = await crypto.subtle.encrypt(</div>
                <div className="pl-4">{"{ name: 'AES-GCM', iv }"}</div>
                <div className="pl-4">key,</div>
                <div className="pl-4">encodedData</div>
                <div>)</div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Honest by design */}
        <section className="w-full max-w-3xl mx-auto py-24 border-t border-white/5 text-center mb-12">
          <FadeIn>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-6">
              <EyeOff className="w-6 h-6 text-white/70" />
            </div>
            <h2 className="text-3xl font-semibold mb-6">Honest by design</h2>
            <p className="text-white/60 leading-relaxed text-balance">
              Security tools should be transparent about their limitations. GhostPen does <strong>NOT</strong> claim to prevent screenshots, secure compromised devices, eliminate all network metadata, or control what recipients do with the information once decrypted. It is a secure delivery mechanism, not magic.
            </p>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>GhostPen</span>
        </div>
        <div>
          Open source &bull; Local-first &bull; Privacy-respecting
        </div>
      </footer>
    </div>
  );
}
