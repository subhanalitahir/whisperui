"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DropZone } from '@/components/DropZone';
import { ProgressIndicator, ProcessingState } from '@/components/ProgressIndicator';
import { Download, FileText } from 'lucide-react';

export default function Dashboard() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [srtContent, setSrtContent] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setState('uploading');
    setFilename(file.name);
    setError('');
    setSrtContent('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create a simulated event source or just use fetch for simplicity.
      // Next.js API Routes don't natively stream progress easily without Server Sent Events,
      // but for this implementation we will just call the endpoint and fake the extracting/transcribing states
      // based on time, or we could handle it via Server Sent Events. 
      // For now, we'll do a simple fetch and fake the intermediate states visually, 
      // or rely on a more complex streaming API if needed. Let's do a simple fetch first.
      
      // Visual simulation of states for better UX while the request is pending
      const interval = setInterval(() => {
        setState((prev) => {
          if (prev === 'uploading') return 'extracting';
          if (prev === 'extracting') return 'transcribing';
          return prev;
        });
      }, 5000); // Shift state every 5 seconds for visual effect while waiting

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process video');
      }

      const data = await response.json();
      setSrtContent(data.srtContent);
      setState('done');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setState('error');
    }
  };

  const handleDownloadSrt = () => {
    if (!srtContent) return;
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.split('.')[0] || 'transcript'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <header className="mb-10 text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
              Transcribe Video Locally
            </h2>
            <p className="text-slate-400 text-lg">
              Drag and drop your video file below to run it through whisper.cpp.
            </p>
          </header>
          
          <DropZone 
            onFileSelect={handleFileSelect} 
            disabled={state !== 'idle' && state !== 'done' && state !== 'error'} 
          />
          
          <ProgressIndicator state={state} filename={filename} error={error} />

          {state === 'done' && srtContent && (
            <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-300">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Transcription Result</h3>
                </div>
                <button 
                  onClick={handleDownloadSrt}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download .srt
                </button>
              </div>
              <div className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto border border-white/5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {srtContent}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
