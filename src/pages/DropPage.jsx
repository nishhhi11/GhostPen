import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  UploadCloud, 
  FileImage, 
  X, 
  Clock, 
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import exifr from 'exifr';
import { encryptData, importKeyFromBase64 } from '../lib/crypto';
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

export default function DropPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [isExpired, setIsExpired] = useState(false);
  const [dropData, setDropData] = useState(null);
  const [metadataStatus, setMetadataStatus] = useState(null);
  const [originalMetadataStatus, setOriginalMetadataStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSanitized, setIsSanitized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let intervalId;
    
    const fetchDrop = async () => {
      try {
        const response = await fetch(`/api/drops/${id}?token=${token}`);
        if (!response.ok) {
          setIsExpired(true);
          setTimeLeft('Expired');
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
      }
    };
    
    fetchDrop();
    return () => clearInterval(intervalId);
  }, [id]);

  // Analyze EXIF Metadata
  const analyzeMetadata = async (selectedFile, isOriginal = true) => {
    setIsScanning(true);
    setMetadataStatus(null);
    if (isOriginal) {
      setOriginalMetadataStatus(null);
      setIsSanitized(false);
    }
    
    try {
      const exif = await exifr.parse(selectedFile, {
        tiff: true,
        exif: true,
        gps: true,
        xmp: true
      });
      
      console.log('--- PARSED EXIF DATA ---', exif);
      
      const newStatus = {
        gps: !!(exif && (exif.latitude || exif.longitude)),
        device: !!(exif && (exif.Make || exif.Model)),
        timestamp: !!(exif && (exif.DateTimeOriginal || exif.CreateDate)),
        software: !!(exif && exif.Software)
      };
      
      setMetadataStatus(newStatus);
      if (isOriginal) setOriginalMetadataStatus(newStatus);
      
    } catch (err) {
      console.log('Error reading EXIF:', err);
      const emptyStatus = { gps: false, device: false, timestamp: false, software: false };
      setMetadataStatus(emptyStatus);
      if (isOriginal) setOriginalMetadataStatus(emptyStatus);
    } finally {
      setIsScanning(false);
    }
  };

  // Sanitize Image
  const sanitizeImage = () => {
    if (!file) return;
    setIsScanning(true);
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const sanitizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        
        setFile(sanitizedFile);
        setIsSanitized(true);
        analyzeMetadata(sanitizedFile, false);
        URL.revokeObjectURL(url);
      }, file.type, 1.0);
    };
    
    img.src = url;
  };

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return false;
    
    // Check type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Only JPG and PNG images are supported.');
      return false;
    }
    
    // Check size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        analyzeMetadata(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        analyzeMetadata(selectedFile);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setMetadataStatus(null);
    setOriginalMetadataStatus(null);
    setIsSanitized(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!text.trim() && !file) {
      setError('Please provide either text or an image.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let fileData = null;
      let fileName = null;
      let fileType = null;
      
      if (file) {
        // Convert file to Base64
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
        fileName = file.name;
        fileType = file.type;
      }
      
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const keyString = hashParams.get('key');
      if (!keyString) throw new Error("No session key found in URL.");
      const key = await importKeyFromBase64(keyString);
      
      let payloadText = text;
      if (text) {
        const encrypted = await encryptData(text, key);
        payloadText = JSON.stringify(encrypted);
      }
      
      let payloadFileData = fileData;
      if (fileData) {
        const encryptedFile = await encryptData(fileData, key);
        payloadFileData = JSON.stringify(encryptedFile);
      }
      
      const response = await fetch(`/api/drops/${id}/submit?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payloadText, fileData: payloadFileData, fileName, fileType })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit evidence');
      }
      
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-mono-900">
      {/* Grid Noise */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mono-text-muted" />
            <span className="text-sm font-medium font-mono text-mono-text-muted">GhostPen</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-mono-text-muted bg-mono-800 border border-mono-border px-4 py-1.5 rounded-full text-xs font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft === 'Expired' || timeLeft === 'Error' ? timeLeft : `Expires in ${timeLeft}`}</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-20">
        {isSubmitted ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <div className="flex items-center justify-center mb-8">
                <CheckCircle2 className="w-14 h-14 text-mono-text" />
              </div>
              <h1 className="text-3xl font-semibold mb-4 text-mono-text">Session Closed</h1>
              <p className="text-mono-text-muted text-balance max-w-md mx-auto">Evidence submitted successfully. The secure channel has been terminated.</p>
            </div>
          </FadeIn>
        ) : (
          <>
            <FadeIn>
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-semibold mb-4 text-mono-text tracking-tight">Submit Evidence</h1>
                <p className="text-mono-text-muted text-balance leading-relaxed text-sm max-w-lg mx-auto">
                  Your connection is secure. Everything submitted here is encrypted client-side before it ever reaches our servers.
                </p>
              </div>
            </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-8 bg-mono-800 border border-mono-border p-8 rounded">

          {/* Text Area */}
          <FadeIn delay={0.1}>
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium font-mono text-mono-text-muted">
                What happened?
              </label>
              <textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Provide context, descriptions, or raw information here..."
                className="w-full h-40 bg-mono-900 border border-mono-border-strong rounded p-4 text-mono-text placeholder-mono-text-faint focus:outline-none focus:border-mono-text transition-colors resize-none relative z-10"
              />
            </div>
          </FadeIn>

          {/* Image Upload */}
          <FadeIn delay={0.2}>
            <div className="space-y-2">
              <label className="block text-sm font-medium font-mono text-mono-text-muted">
                Supporting Image (Optional)
              </label>
              
              {!file ? (
                <div 
                  className={`w-full border border-dashed rounded p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 relative z-10 cursor-pointer ${
                    dragActive ? 'border-mono-text bg-mono-800' : 'border-mono-border-strong hover:border-mono-text bg-mono-900'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 text-mono-text-muted mb-3" />
                  <p className="text-sm text-mono-text font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs font-mono text-mono-text-faint">JPG, JPEG, PNG up to 10MB</p>
                </div>
              ) : (
                <div className="w-full border border-mono-border-strong rounded p-4 bg-mono-900 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded bg-mono-800 border border-mono-border flex items-center justify-center shrink-0">
                      <FileImage className="w-5 h-5 text-mono-text-muted" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-mono-text truncate">{file.name}</p>
                      <p className="text-xs font-mono text-mono-text-faint">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-2 rounded hover:bg-mono-800 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4 text-mono-text-muted hover:text-mono-text" />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Metadata Shield Card */}
          {file && (
            <FadeIn delay={0.25} className="relative z-10">
              <div className="w-full border border-mono-border-strong rounded bg-mono-900 overflow-hidden relative group">
                <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors duration-500 ${isSanitized ? 'bg-mono-800 border-green-500/30' : 'bg-mono-800 border-mono-border-strong'}`}>
                  <div className="flex items-center gap-2">
                    {isSanitized ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Shield className="w-4 h-4 text-mono-text-muted" />
                    )}
                    <span className={`text-sm font-medium font-mono ${isSanitized ? 'text-green-500' : 'text-mono-text'}`}>
                      {isSanitized ? 'Privacy Shield Active' : 'Privacy Scan'}
                    </span>
                  </div>
                  {!isSanitized && originalMetadataStatus && Object.values(originalMetadataStatus).some(Boolean) && (
                    <button
                      type="button"
                      onClick={sanitizeImage}
                      disabled={isScanning}
                      className="px-3 py-1.5 border border-yellow-500/30 text-yellow-500 text-xs font-mono rounded hover:bg-mono-800 transition-colors disabled:opacity-50"
                    >
                      {isScanning ? 'Sanitizing...' : 'Sanitize Image'}
                    </button>
                  )}
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'gps', label: 'GPS location' },
                      { key: 'device', label: 'Camera/device' },
                      { key: 'timestamp', label: 'Capture timestamp' },
                      { key: 'software', label: 'Software' }
                    ].map(({ key, label }) => {
                      const isFoundNow = metadataStatus?.[key];
                      const hasAnyMetadata = metadataStatus && Object.values(metadataStatus).some(Boolean);
                      
                      let statusText = 'NOT FOUND';
                      let statusColor = 'text-mono-text-faint';
                      let Icon = CheckCircle2;
                      
                      if (!metadataStatus) {
                        statusText = 'SCANNING...';
                        statusColor = 'text-mono-text-faint';
                        Icon = Clock;
                      } else if (isFoundNow) {
                        statusText = 'FOUND';
                        statusColor = 'text-yellow-500';
                        Icon = AlertCircle;
                      } else if (!hasAnyMetadata) {
                        statusText = 'CLEAN';
                        statusColor = 'text-green-500';
                        Icon = CheckCircle2;
                      }

                      return (
                        <div key={key} className="flex items-center gap-3 p-3 rounded bg-mono-800 border border-mono-border">
                          <Icon className={`w-4 h-4 ${statusColor}`} />
                          <div>
                            <p className="text-xs font-medium text-mono-text-muted">{label}</p>
                            <p className={`text-[10px] font-mono uppercase tracking-wider ${statusColor}`}>
                              {statusText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Error Message */}
          {error && (
            <FadeIn>
              <div className="p-4 rounded border border-red-500/30 bg-mono-900 flex items-start gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium font-mono">{error}</p>
              </div>
            </FadeIn>
          )}

          {/* Submit Action */}
          <FadeIn delay={0.3} className="pt-6 relative z-10">
            <div className="flex items-center gap-2 justify-center mb-5 text-[11px] font-medium font-mono uppercase tracking-widest text-mono-text-faint">
              <Lock className="w-3.5 h-3.5" />
              <span>End-to-End Encrypted</span>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-mono-accent text-mono-900 font-mono rounded hover:bg-mono-text transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting securely...' : 'Continue Securely'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </FadeIn>
        </form>
        </>
        )}
      </main>
    </div>
  );
}
