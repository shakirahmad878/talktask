import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface RecorderStatus {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  meteringLevel: number; // Normalized 0.0 to 1.0
  uri?: string | null;
}

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private statusCallback?: (status: RecorderStatus) => void;
  private durationInterval: any = null;
  private durationMs = 0;
  private currentUri: string | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('Audio permission request failed:', e);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === 'granted';
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.statusCallback = onStatusUpdate;
      this.durationMs = 0;

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.canRecord) return;

        // Metering in dB is usually -160 to 0
        let normLevel = 0.5;
        if (typeof status.metering === 'number') {
          normLevel = Math.max(0, Math.min(1, (status.metering + 60) / 60));
        }

        this.statusCallback?.({
          isRecording: status.isRecording,
          isPaused: false,
          durationMs: status.durationMillis,
          meteringLevel: normLevel,
        });
      });

      await recording.startAsync();
      this.recording = recording;
      return true;
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      throw new Error(err.message || 'Unable to start recording');
    }
  }

  async pause(): Promise<void> {
    if (!this.recording) return;
    try {
      await this.recording.pauseAsync();
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
    if (!this.recording) return;
    try {
      await this.recording.startAsync();
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
    if (!this.recording) return null;
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.currentUri = uri;
      this.recording = null;
      return uri;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      this.recording = null;
      return null;
    }
  }

  async cancel(): Promise<void> {
    if (!this.recording) return;
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      // Delete temporary audio file
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {}
      }
    } catch (e) {
      console.warn('Cancel recording error:', e);
      this.recording = null;
    }
  }
}

export const globalAudioRecorder = new AudioRecorder();
