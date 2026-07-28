"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Loader2, CheckCircle2, FileVideo, Mic, FileText } from 'lucide-react';

export type ProcessingState = 'idle' | 'uploading' | 'extracting' | 'transcribing' | 'done' | 'error';

interface ProgressIndicatorProps {
  state: ProcessingState;
  filename?: string;
  error?: string;
}

export function ProgressIndicator({ state, filename, error }: ProgressIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const steps = [
    { id: 'uploading', label: 'Uploading', icon: FileVideo },
    { id: 'extracting', label: 'Extracting Audio', icon: Mic },
    { id: 'transcribing', label: 'Transcribing', icon: FileText },
    { id: 'done', label: 'Complete', icon: CheckCircle2 },
  ];

  // Map state to progress percentage
  const getProgress = () => {
    switch(state) {
      case 'idle': return 0;
      case 'uploading': return 25;
      case 'extracting': return 50;
      case 'transcribing': return 85;
      case 'done': return 100;
      case 'error': return 100;
      default: return 0;
    }
  };

  useEffect(() => {
    if (state !== 'idle' && containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [state === 'idle']);

  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, { 
        width: `${getProgress()}%`, 
        duration: 1.5, 
        ease: 'power2.out',
        backgroundColor: state === 'error' ? '#ef4444' : '#6366f1' // red for error, indigo for normal
      });
    }
  }, [state]);

  if (state === 'idle') return null;

  return (
    <div ref={containerRef} className="w-full glass-panel rounded-2xl p-6 mt-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-slate-200">
          {state === 'error' ? 'Processing Failed' : `Processing: ${filename || 'video file'}`}
        </h4>
        {state !== 'done' && state !== 'error' && (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        )}
      </div>

      {error ? (
        <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          {error}
        </div>
      ) : (
        <div className="flex justify-between mb-6 relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -z-10 -translate-y-1/2"></div>
          
          {steps.map((step, index) => {
            const stepIndex = steps.findIndex(s => s.id === state);
            const isCompleted = stepIndex > index || state === 'done';
            const isActive = step.id === state;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0f172a] px-2 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isCompleted ? 'bg-indigo-500 text-white' : 
                  isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 
                  'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          ref={progressBarRef}
          className="h-full bg-indigo-500 rounded-full relative"
          style={{ width: '0%' }}
        >
          {state !== 'error' && state !== 'done' && (
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}
