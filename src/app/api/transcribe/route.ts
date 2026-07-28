import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const FFMPEG_PATH = `"C:\\Users\\M Anas\\Desktop\\Video Downloader\\whisper.cpp\\ffmpeg.exe"`;
const WHISPER_PATH = `"C:\\Users\\M Anas\\Desktop\\Video Downloader\\whisper.cpp\\build\\bin\\Release\\whisper-cli.exe"`;
const MODEL_PATH = `"C:\\Users\\M Anas\\Desktop\\Video Downloader\\whisper.cpp\\models\\ggml-base.en.bin"`;

// Increase body size limit for video uploads (Next.js config might be needed for very large files)
export const maxDuration = 300; // 5 minutes max duration for Vercel, though locally it doesn't matter much.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a temporary directory for processing
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'whisperui-'));
    
    // Original video path
    const videoExt = path.extname(file.name) || '.mp4';
    const videoPath = path.join(tempDir, `input${videoExt}`);
    
    // Extracted wav path
    const wavPath = path.join(tempDir, 'audio.wav');

    // Save the uploaded video
    await fs.writeFile(videoPath, buffer);

    console.log(`Saved video to ${videoPath}`);

    // Step 1: Extract Audio using FFmpeg
    // Command: ffmpeg -i input -ar 16000 -ac 1 -c:a pcm_s16le audio.wav
    const ffmpegCmd = `${FFMPEG_PATH} -y -i "${videoPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`;
    console.log(`Executing: ${ffmpegCmd}`);
    await execAsync(ffmpegCmd);

    // Step 2: Transcribe using Whisper CLI
    // Command: whisper-cli -m model -f audio.wav -osrt
    // Note: whisper-cli with -osrt creates a file with the same name as the input + .srt
    const whisperCmd = `${WHISPER_PATH} -m ${MODEL_PATH} -f "${wavPath}" -osrt`;
    console.log(`Executing: ${whisperCmd}`);
    await execAsync(whisperCmd);

    // The output file should be audio.wav.srt
    const srtPath = `${wavPath}.srt`;
    
    let srtContent = '';
    try {
      srtContent = await fs.readFile(srtPath, 'utf8');
    } catch (e) {
      console.error('Failed to read .srt file', e);
      throw new Error('Transcription failed to produce a valid .srt file');
    }

    // Step 3: Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`Cleaned up temporary directory: ${tempDir}`);
    } catch (cleanupErr) {
      console.error(`Failed to cleanup temp directory: ${tempDir}`, cleanupErr);
    }

    return NextResponse.json({ success: true, srtContent });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during transcription' },
      { status: 500 }
    );
  }
}
