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
      
      const response = await fetch(`/api/drops/${id}/submit?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileData, fileName, fileType })
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/40">GhostPen</span>
        </div>
        
        <div className="flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft === 'Expired' || timeLeft === 'Error' ? timeLeft : `Expires in ${timeLeft}`}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-20">
        {isSubmitted ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <div className="w-16 h-16 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold mb-3 text-white">Evidence submitted successfully. You can safely close this session.</h1>
            </div>
          </FadeIn>
        ) : (
          <>
            <FadeIn>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-3 text-white">Submit Evidence</h1>
                <p className="text-white/50 text-balance leading-relaxed">
                  Your connection is secure. Everything submitted here is securely encoded before it ever reaches our servers.
                </p>
              </div>
            </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text Area */}
          <FadeIn delay={0.1}>
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-white/70">
                What happened?
              </label>
              <textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Provide context, descriptions, or raw information here..."
                className="w-full h-40 bg-graphite-800 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all resize-none shadow-inner"
              />
            </div>
          </FadeIn>

          {/* Image Upload */}
          <FadeIn delay={0.2}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Supporting Image (Optional)
              </label>
              
              {!file ? (
                <div 
                  className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                    dragActive ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
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
                  <UploadCloud className="w-8 h-8 text-white/30 mb-3" />
                  <p className="text-sm text-white/80 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-white/40">JPG, JPEG, PNG up to 10MB</p>
                </div>
              ) : (
                <div className="w-full border border-white/10 rounded-xl p-4 bg-graphite-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                      <FileImage className="w-5 h-5 text-white/70" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
                      <p className="text-xs text-white/40">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4 text-white/50 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Metadata Shield Card */}
          {file && (originalMetadataStatus || metadataStatus) && (
            <FadeIn delay={0.25}>
              <div className="w-full border border-white/10 rounded-xl bg-graphite-800 overflow-hidden">
                <div className={`px-4 py-3 border-b flex items-center justify-between ${isSanitized ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-2">
                    {isSanitized ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-white/70" />
                    )}
                    <span className={`text-sm font-medium ${isSanitized ? 'text-green-400' : 'text-white/90'}`}>
                      {isSanitized ? 'Privacy Shield Active' : 'Privacy Scan'}
                    </span>
                  </div>
                  {!isSanitized && originalMetadataStatus && Object.values(originalMetadataStatus).some(Boolean) && (
                    <button
                      type="button"
                      onClick={sanitizeImage}
                      disabled={isScanning}
                      className="px-3 py-1.5 bg-yellow-400 text-yellow-950 text-xs font-semibold rounded hover:bg-yellow-300 transition-colors disabled:opacity-50"
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
                      let statusColor = 'text-white/40';
                      let Icon = CheckCircle2;
                      
                      if (isFoundNow) {
                        statusText = 'FOUND';
                        statusColor = 'text-yellow-400';
                        Icon = AlertCircle;
                      } else if (!hasAnyMetadata) {
                        statusText = 'CLEAN';
                        statusColor = 'text-green-400';
                        Icon = CheckCircle2;
                      }

                      return (
                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                          <Icon className={`w-4 h-4 ${statusColor}`} />
                          <div>
                            <p className="text-xs font-medium text-white/80">{label}</p>
                            <p className={`text-[10px] uppercase tracking-wider font-semibold ${statusColor}`}>
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
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </FadeIn>
          )}

          {/* Submit Action */}
          <FadeIn delay={0.3} className="pt-4">
            <div className="flex items-center gap-2 justify-center mb-4 text-xs text-white/40">
              <Lock className="w-3.5 h-3.5" />
              <span>Everything is securely encoded before leaving this device.</span>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-white text-graphite-900 font-semibold hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
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
