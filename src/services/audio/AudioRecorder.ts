import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export interface RecorderStatus {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  meteringLevel: number; // Normalized 0.0 to 1.0
  uri?: string | null;
}

export class AudioRecorder {
  private recorder: any = null;
  private statusCallback?: (status: RecorderStatus) => void;
  private durationInterval: any = null;
  private durationMs = 0;
  private currentUri: string | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      return granted;
    } catch (e) {
      console.warn('Audio permission request failed:', e);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const { granted } = await getRecordingPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  }

  async startRecording(onStatusUpdate?: (status: RecorderStatus) => void): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Microphone permission is required to record voice notes.');
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      this.statusCallback = onStatusUpdate;
      this.durationMs = 0;

      const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();
      recorder.record();
      this.recorder = recorder;

      if (this.durationInterval) clearInterval(this.durationInterval);
      this.durationInterval = setInterval(() => {
        if (!this.recorder || !this.recorder.isRecording) return;
        this.durationMs += 100;
        // Generate responsive metering pulse for UI waveform
        const wave = 0.3 + 0.5 * Math.sin(this.durationMs / 200) * Math.cos(this.durationMs / 350);
        const normLevel = Math.max(0.1, Math.min(1.0, Math.abs(wave)));

        this.statusCallback?.({
          isRecording: true,
          isPaused: false,
          durationMs: this.durationMs,
          meteringLevel: normLevel,
        });
      }, 100);

      return true;
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      throw new Error(err.message || 'Unable to start recording');
    }
  }

  async pause(): Promise<void> {
    if (!this.recorder) return;
    try {
      this.recorder.pause();
      this.statusCallback?.({
        isRecording: false,
        isPaused: true,
        durationMs: this.durationMs,
        meteringLevel: 0,
      });
    } catch (e) {
      console.warn('Pause error:', e);
    }
  }

  async resume(): Promise<void> {
    if (!this.recorder) return;
    try {
      this.recorder.record();
      this.statusCallback?.({
        isRecording: true,
        isPaused: false,
        durationMs: this.durationMs,
        meteringLevel: 0.5,
      });
    } catch (e) {
      console.warn('Resume error:', e);
    }
  }

  async stop(): Promise<string | null> {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (!this.recorder) return null;
    try {
      await this.recorder.stop();
      const uri = this.recorder.uri;
      this.currentUri = uri;
      this.recorder = null;
      return uri;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      this.recorder = null;
      return null;
    }
  }

  async cancel(): Promise<void> {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (!this.recorder) return;
    try {
      await this.recorder.stop();
      const uri = this.recorder.uri;
      this.recorder = null;
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {}
      }
    } catch (e) {
      console.warn('Cancel recording error:', e);
      this.recorder = null;
    }
  }
}

export const globalAudioRecorder = new AudioRecorder();
