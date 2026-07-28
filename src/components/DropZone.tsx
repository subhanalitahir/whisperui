"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import gsap from 'gsap';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDragActive && iconRef.current) {
      gsap.to(iconRef.current, { y: -10, scale: 1.1, duration: 0.3, ease: 'power2.out' });
    } else if (iconRef.current) {
      gsap.to(iconRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [isDragActive]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Check if it's a video file
      if (droppedFile.type.startsWith('video/')) {
        onFileSelect(droppedFile);
      } else {
        alert('Please drop a valid video file.');
      }
    }
  };

  return (
    <div 
      ref={dropZoneRef}
      className={`glass-panel relative rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer overflow-hidden ${
        isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      style={{ minHeight: '320px' }}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="video/*" 
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <UploadCloud ref={iconRef} className="w-16 h-16 text-indigo-400 mb-6" />
      
      <h3 className="text-2xl font-bold mb-2">
        Drag & Drop Video Here
      </h3>
      <p className="text-slate-400 max-w-md">
        Supported formats: MP4, MKV, AVI, MOV. The file will be processed locally on your machine.
      </p>
      
      <div className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors">
        Browse Files
      </div>
    </div>
  );
}
