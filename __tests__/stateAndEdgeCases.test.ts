import { AdMobManager } from '../src/services/ads/AdMobManager';
import { OfflineDemoSpeechProvider } from '../src/services/transcription/TranscriptionService';

describe('Application Edge Cases & Reliability', () => {
  describe('AdMob Frequency Capping & Pro Status', () => {
    beforeEach(() => {
      AdMobManager.setProStatus(false);
    });

    it('enforces frequency limit (at most 1 interstitial every 4 actions)', async () => {
      // 1st action
      const ad1 = await AdMobManager.recordCompletedWorkflow();
      expect(ad1).toBe(false);

      // 2nd action
      const ad2 = await AdMobManager.recordCompletedWorkflow();
      expect(ad2).toBe(false);

      // 3rd action
      const ad3 = await AdMobManager.recordCompletedWorkflow();
      expect(ad3).toBe(false);

      // 4th action reaches threshold
      const ad4 = await AdMobManager.recordCompletedWorkflow();
      expect(ad4).toBe(true);

      // Counter resets for 5th action
      const ad5 = await AdMobManager.recordCompletedWorkflow();
      expect(ad5).toBe(false);
    });

    it('never displays ads for Pro users', async () => {
      AdMobManager.setProStatus(true);
      expect(AdMobManager.isProUser()).toBe(true);

      for (let i = 0; i < 10; i++) {
        const ad = await AdMobManager.recordCompletedWorkflow();
        expect(ad).toBe(false);
      }
    });
  });

  describe('Offline Demo Speech Provider', () => {
    it('returns valid speech recognition results offline for English, Hindi, and Hinglish', async () => {
      const provider = new OfflineDemoSpeechProvider();
      expect(await provider.isAvailable()).toBe(true);

      const enResult = await provider.transcribe('test_uri', 'en');
      expect(enResult.transcript).toBeTruthy();
      expect(enResult.confidence).toBeGreaterThan(0.8);
      expect(enResult.provider).toContain('Offline');

      const hiResult = await provider.transcribe('test_uri', 'hi');
      expect(hiResult.transcript).toBeTruthy();
      expect(hiResult.language).toBe('hi');

      const hinglishResult = await provider.transcribe('test_uri', 'hinglish');
      expect(hinglishResult.transcript).toBeTruthy();
      expect(hinglishResult.language).toBe('hinglish');
    });
  });
});
