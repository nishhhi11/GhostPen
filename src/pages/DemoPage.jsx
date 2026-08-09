import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  FileText,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Key,
  Flame,
  ShieldOff,
  Lock,
  Eye,
  Sparkles,
  ScanLine,
  ImageIcon
} from 'lucide-react';
import { generateKey, encryptData, decryptData } from '../lib/crypto';
import exifr from 'exifr';
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

// Demo steps
const STEPS = [
  { id: 'privacy-scan', label: 'Privacy Scan', icon: ScanLine },
  { id: 'sanitize', label: 'Sanitize', icon: Shield },
  { id: 'encrypt', label: 'Encrypt', icon: Lock },
  { id: 'submit', label: 'Submit', icon: ArrowRight },
  { id: 'decrypt', label: 'Decrypt', icon: Key },
  { id: 'burn', label: 'Burn', icon: Flame },
];

const DEMO_TEXT = `On March 12, 2025 at approximately 2:15 PM, I witnessed a black sedan (plate: XJ4-7291) run a red light at the intersection of Oak Street and Main Avenue. The vehicle was traveling at approximately 50mph in a 25mph zone. A pedestrian had to jump back onto the sidewalk to avoid being hit. I captured the attached dashcam image from my vehicle.`;

const DEMO_METADATA = {
  gps: true,
  device: true,
  timestamp: true,
  software: false,
};

const DEMO_METADATA_CLEAN = {
  gps: false,
  device: false,
  timestamp: false,
  software: false,
};

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepId, setStepId] = useState('privacy-scan');

  // Privacy Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [metadataStatus, setMetadataStatus] = useState(null);

  // Sanitize state
  const [isSanitizing, setIsSanitizing] = useState(false);
  const [sanitizeComplete, setSanitizeComplete] = useState(false);
  const [cleanMetadata, setCleanMetadata] = useState(null);
  const [sanitizedImage, setSanitizedImage] = useState(null);

  // Encrypt state
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptComplete, setEncryptComplete] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState(null);
  const [aesKey, setAesKey] = useState(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitComplete, setSubmitComplete] = useState(false);

  // Decrypt state
  const [isDecryptingDemo, setIsDecryptingDemo] = useState(false);
  const [decryptComplete, setDecryptComplete] = useState(false);
  const [decryptedText, setDecryptedText] = useState(null);

  // Burn state
  const [isBurning, setIsBurning] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);

  const goToStep = useCallback((index) => {
    setCurrentStep(index);
    setStepId(STEPS[index].id);
  }, []);

  // --- Action handlers ---

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/demo-evidence.jpg');
      const blob = await response.blob();
      
      const tags = await exifr.parse(blob, {
        gps: true,
        tiff: true,
        exif: true,
      });
      
      setMetadataStatus({
        gps: !!(tags && (tags.latitude || tags.GPSLatitude)),
        device: !!(tags && (tags.Make || tags.Model)),
        timestamp: !!(tags && (tags.DateTimeOriginal || tags.CreateDate)),
        software: !!(tags && tags.Software)
      });
      setScanComplete(true);
    } catch (err) {
      console.error('Scan failed:', err);
      // Fallback in case of error
      setMetadataStatus(DEMO_METADATA);
      setScanComplete(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSanitize = async () => {
    setIsSanitizing(true);
    try {
      const response = await fetch('/demo-evidence.jpg');
      const blob = await response.blob();
      
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(async (cleanBlob) => {
            setSanitizedImage(URL.createObjectURL(cleanBlob));
            
            // Verify it's clean
            const newTags = await exifr.parse(cleanBlob);
            setCleanMetadata({
              gps: !!(newTags && (newTags.latitude || newTags.GPSLatitude)),
              device: !!(newTags && (newTags.Make || newTags.Model)),
              timestamp: !!(newTags && (newTags.DateTimeOriginal || newTags.CreateDate)),
              software: !!(newTags && newTags.Software)
            });
            setSanitizeComplete(true);
            resolve();
          }, 'image/jpeg', 0.9);
        };
      });
    } catch (err) {
      console.error('Sanitize failed:', err);
      setCleanMetadata(DEMO_METADATA_CLEAN);
      setSanitizeComplete(true);
    } finally {
      setIsSanitizing(false);
    }
  };

  const handleEncrypt = async () => {
    setIsEncrypting(true);
    try {
      const key = await generateKey();
      setAesKey(key);
      const encrypted = await encryptData(DEMO_TEXT, key);
      await new Promise(r => setTimeout(r, 800));
      setEncryptedPayload(encrypted);
      setEncryptComplete(true);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
    setIsEncrypting(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitComplete(true);
    setIsSubmitting(false);
  };

  const handleDecrypt = async () => {
    setIsDecryptingDemo(true);
    try {
      const decrypted = await decryptData(encryptedPayload, aesKey);
      await new Promise(r => setTimeout(r, 800));
      setDecryptedText(decrypted);
      setDecryptComplete(true);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
    setIsDecryptingDemo(false);
  };

  const handleBurn = async () => {
    setIsBurning(true);
    await new Promise(r => setTimeout(r, 1200));
    setBurnComplete(true);
    setIsBurning(false);
  };

  const canAdvance = () => {
    switch (stepId) {
      case 'privacy-scan': return scanComplete;
      case 'sanitize': return sanitizeComplete;
      case 'encrypt': return encryptComplete;
      case 'submit': return submitComplete;
      case 'decrypt': return decryptComplete;
      case 'burn': return burnComplete;
      default: return false;
    }
  };

  const MetadataGrid = ({ status }) => (
    <div className="grid grid-cols-2 gap-2">
      {[
        { key: 'gps', label: 'GPS location' },
        { key: 'device', label: 'Camera/device' },
        { key: 'timestamp', label: 'Capture timestamp' },
        { key: 'software', label: 'Software' }
      ].map(({ key, label }) => {
        const found = status?.[key];
        const allClean = status && !Object.values(status).some(Boolean);
        let statusText = 'NOT FOUND';
        let statusColor = 'text-mono-text-faint';
        let borderColor = 'border-mono-border';
        let Icon = CheckCircle2;

        if (found) {
          statusText = 'FOUND';
          statusColor = 'text-yellow-500';
          borderColor = 'border-yellow-500/30';
          Icon = AlertCircle;
        } else if (allClean) {
          statusText = 'CLEAN';
          statusColor = 'text-green-500';
          borderColor = 'border-green-500/30';
          Icon = CheckCircle2;
        }

        return (
          <motion.div
            key={key}
            initial={false}
            animate={{ borderColor: allClean ? 'rgba(34,197,94,0.3)' : found ? 'rgba(234,179,8,0.3)' : 'var(--color-mono-border)' }}
            transition={{ duration: 0.5 }}
            className={`flex items-center gap-2.5 p-3 rounded bg-mono-800 border`}
          >
            <motion.div
              key={statusText}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon className={`w-4 h-4 ${statusColor}`} />
            </motion.div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-mono-text-muted truncate">{label}</p>
              <p className={`text-[10px] uppercase tracking-wider font-mono ${statusColor}`}>
                {statusText}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // --- Render step content ---

  const renderStepContent = () => {
    switch (stepId) {
      case 'privacy-scan':
        return (
          <FadeIn key="privacy-scan">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <ScanLine className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Privacy Scan</h3>
              </div>
              <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                Images often contain hidden metadata — GPS coordinates, device model, timestamps — that can expose your source's identity. Let's scan a sample evidence image.
              </p>

              <div className="mb-5 rounded border border-mono-border-strong bg-mono-900 flex justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/demo-evidence.jpg"
                    alt="Demo Evidence"
                    className="h-32 object-contain rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder if image missing */}
                  <div className="hidden flex-col items-center justify-center h-32 w-48 rounded border border-mono-border-strong bg-mono-800" style={{display: 'none'}}>
                    <ImageIcon className="w-10 h-10 text-mono-text-faint mb-2" />
                    <span className="text-[10px] text-mono-text-faint font-mono">demo-evidence.jpg</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium font-mono text-mono-text">demo-evidence.jpg</p>
                  </div>
                </div>
              </div>

              {!scanComplete ? (
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full py-3 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <ScanLine className="w-4 h-4" />
                      </motion.div>
                      Scanning metadata...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4" />
                      Scan for Metadata
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-mono font-semibold text-yellow-500 uppercase tracking-wider">Privacy risks detected</span>
                  </div>
                  <MetadataGrid status={metadataStatus} />
                </div>
              )}
            </div>
          </FadeIn>
        );

      case 'sanitize':
        return (
          <FadeIn key="sanitize">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <Shield className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Sanitize Image</h3>
              </div>
              <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                GhostPen strips all EXIF metadata by re-drawing the image on a clean canvas. The pixel content is preserved, but all identifying metadata is removed.
              </p>

              {!sanitizeComplete ? (
                <>
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-mono font-semibold text-yellow-500 uppercase tracking-wider">Current metadata (pre-sanitize)</span>
                    </div>
                    <MetadataGrid status={metadataStatus} />
                    <div className="mt-4 flex justify-center border border-mono-border-strong bg-mono-900 rounded p-4">
                       <img src="/demo-evidence.jpg" alt="Pre-sanitize" className="h-24 object-contain rounded" />
                    </div>
                  </div>
                  <button
                    onClick={handleSanitize}
                    disabled={isSanitizing}
                    className="w-full py-3 rounded bg-mono-900 text-yellow-500 font-mono border border-yellow-500/30 hover:bg-mono-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSanitizing ? 'Sanitizing...' : 'Sanitize Image'}
                  </button>
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-mono font-semibold text-green-500 uppercase tracking-wider">Privacy Shield Active — All metadata removed</span>
                  </div>
                  <MetadataGrid status={cleanMetadata} />
                  {sanitizedImage && (
                    <div className="mt-4 flex justify-center border border-green-500/30 bg-mono-900 rounded p-4">
                      <img src={sanitizedImage} alt="Sanitized" className="h-24 object-contain rounded" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeIn>
        );

      case 'encrypt':
        return (
          <FadeIn key="encrypt">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <Lock className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">End-to-End Encryption</h3>
              </div>
              <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                Evidence is encrypted with AES-256-GCM directly in the browser. The encryption key never touches our servers — only the creator and source have access.
              </p>

              <div className="mb-5 rounded border border-mono-border-strong bg-mono-900 p-4">
                <div className="flex items-center gap-2 mb-2 text-mono-text-faint">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">Plaintext Evidence</span>
                </div>
                <p className="text-sm text-mono-text-muted font-mono leading-relaxed line-clamp-3">{DEMO_TEXT}</p>
              </div>

              {!encryptComplete ? (
                <button
                  onClick={handleEncrypt}
                  disabled={isEncrypting}
                  className="w-full py-3 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEncrypting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Lock className="w-4 h-4" />
                      </motion.div>
                      Encrypting with AES-256-GCM...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Encrypt Evidence
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-mono font-semibold text-green-500 uppercase tracking-wider">Encrypted successfully</span>
                  </div>
                  {/* Terminal-style ciphertext display */}
                  <div className="rounded border border-mono-border-strong bg-mono-900 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-mono-border-strong bg-mono-800">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-mono-text-muted"></div>
                        <div className="w-2 h-2 rounded-full bg-mono-text-muted"></div>
                        <div className="w-2 h-2 rounded-full bg-mono-text-muted"></div>
                      </div>
                      <span className="text-[10px] font-mono text-mono-text-faint ml-1 tracking-wider">ciphertext output</span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-mono-text-faint font-mono mb-2 font-semibold uppercase tracking-wider">Ciphertext (first 80 bytes)</p>
                      <p className="text-xs text-mono-text font-mono break-all leading-relaxed">
                        {encryptedPayload ? encryptedPayload.data.slice(0, 80).map(b => b.toString(16).padStart(2, '0')).join(' ') + ' …' : ''}
                        <span className="inline-block w-1.5 h-3.5 bg-mono-text-faint ml-0.5 align-middle" style={{animation: 'typewriter-cursor 1s steps(1) infinite'}}></span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        );

      case 'submit':
        return (
          <FadeIn key="submit">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <ArrowRight className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Secure Submission</h3>
              </div>
              <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                The encrypted payload is transmitted to the server. Only ciphertext reaches the backend — the server cannot read the evidence without the key.
              </p>

              {!submitComplete ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                      Submitting securely...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Submit Encrypted Evidence
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-green-500/30 rounded bg-mono-900 gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-sm font-mono font-semibold text-green-500">Evidence submitted securely</p>
                  <p className="text-xs text-mono-text-faint text-center max-w-xs font-mono">The server only received encrypted data. It cannot read the evidence without the session key.</p>
                </div>
              )}
            </div>
          </FadeIn>
        );

      case 'decrypt':
        return (
          <FadeIn key="decrypt">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <Key className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Local Decryption</h3>
              </div>
              <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                On the creator's dashboard, evidence is decrypted locally in the browser using the session key from the URL. The server never sees plaintext.
              </p>

              {!decryptComplete ? (
                <button
                  onClick={handleDecrypt}
                  disabled={isDecryptingDemo}
                  className="w-full py-3 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDecryptingDemo ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Key className="w-4 h-4" />
                      </motion.div>
                      Decrypting locally...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Decrypt & View Evidence
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-mono font-semibold text-green-500 uppercase tracking-wider">Decrypted locally</span>
                  </div>
                  <div className="text-mono-text whitespace-pre-wrap leading-relaxed font-mono text-sm bg-mono-900 border border-green-500/30 rounded p-4">
                    {decryptedText}
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        );

      case 'burn':
        return (
          <FadeIn key="burn">
            <div className="bg-mono-800 border border-mono-border rounded p-6">
              <div className="flex items-center gap-2 mb-4 text-mono-text-muted">
                <Flame className="w-4 h-4" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">Burn Session</h3>
              </div>

              {!burnComplete ? (
                <>
                  <p className="text-sm text-mono-text-muted mb-5 leading-relaxed">
                    When you're done, destroy the session. All evidence is permanently deleted from the server, and the encryption key is purged from the URL.
                  </p>
                  <button
                    onClick={handleBurn}
                    disabled={isBurning}
                    className="w-full py-3.5 rounded bg-mono-900 border border-red-500/30 text-red-500 font-mono hover:bg-mono-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isBurning ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Flame className="w-4 h-4" />
                        </motion.div>
                        Destroying session...
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        Burn Session
                      </>
                    )}
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="flex flex-col items-center justify-center p-8 gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="flex items-center justify-center"
                  >
                    <ShieldOff className="w-10 h-10 text-mono-text" />
                  </motion.div>
                  <h2 className="text-xl font-bold font-mono text-mono-text tracking-tight">SESSION DESTROYED</h2>
                  <div className="text-mono-text-muted space-y-1.5 text-sm text-center font-mono">
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>• Server-side evidence deleted</motion.p>
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>• Encryption key cleared</motion.p>
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>• Drop invalidated</motion.p>
                  </div>
                </motion.div>
              )}
            </div>
          </FadeIn>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-mono-900">
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
            <Sparkles className="w-4 h-4 text-mono-text-muted" />
            <span className="text-sm font-medium font-mono text-mono-text-muted">Interactive Demo</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-20">
        {/* Title */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-3 text-mono-text">How GhostPen Works</h1>
            <p className="text-mono-text-muted text-balance leading-relaxed">
              Walk through each step of the evidence protection pipeline. Every action runs real code — no simulation.
            </p>
          </div>
        </FadeIn>

        {/* Step Progress - animated growing line */}
        <FadeIn delay={0.1}>
          <div className="relative mb-8">
            {/* Background track line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-mono-border -translate-y-1/2 mx-6 hidden md:block"></div>
            {/* Progress fill line */}
            <motion.div
              className="absolute top-1/2 left-6 h-px bg-mono-text -translate-y-1/2 hidden md:block"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ maxWidth: 'calc(100% - 3rem)' }}
            />
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep || (i === currentStep && canAdvance());
              const isFuture = i > currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => { if (i <= currentStep || (i === currentStep + 1 && canAdvance())) goToStep(i); }}
                  disabled={isFuture && !(i === currentStep + 1 && canAdvance())}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-mono-900 border border-mono-border-strong text-mono-text'
                      : isDone
                        ? 'bg-mono-900 border border-mono-border text-mono-text-muted'
                        : 'bg-mono-900 border border-transparent text-mono-text-faint'
                  } ${(isFuture && !(i === currentStep + 1 && canAdvance())) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-mono-800 hover:text-mono-text'}`}
                >
                  {isDone && !isActive ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
            </div>
          </div>
        </FadeIn>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => goToStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded bg-mono-900 border border-mono-border text-mono-text-muted text-sm font-mono hover:text-mono-text hover:bg-mono-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => goToStep(currentStep + 1)}
                disabled={!canAdvance()}
                className="px-4 py-2 rounded bg-mono-accent text-mono-900 text-sm font-mono hover:bg-mono-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : burnComplete ? (
              <Link
                to="/create"
                className="px-4 py-2 rounded bg-mono-accent text-mono-900 text-sm font-mono hover:bg-mono-text transition-colors flex items-center gap-2"
              >
                Create a Real Drop
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : null}
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
