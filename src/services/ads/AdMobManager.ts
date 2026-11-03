/**
 * Official Google AdMob Test Unit IDs
 * Android Banner: ca-app-pub-3940256099942544/6300978111
 * Android Interstitial: ca-app-pub-3940256099942544/1033173712
 */
export const ADMOB_TEST_CONFIG = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    bannerId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    bannerId: 'ca-app-pub-3940256099942544/2934735716',
    interstitialId: 'ca-app-pub-3940256099942544/4411468910',
  },
};

export class AdMobManager {
  private static actionCounter = 0;
  private static readonly FREQUENCY_LIMIT = 4; // Show at most 1 interstitial every 4 successful workflows
  private static isPro = false;

  static setProStatus(status: boolean) {
    this.isPro = status;
  }

  static isProUser(): boolean {
    return this.isPro;
  }

  /**
   * Called strictly after a meaningful, completed user workflow (e.g. creating note, completing a task batch).
   * NEVER called during recording, transcribing, editing, or viewing.
   */
  static async recordCompletedWorkflow(callbackOnDismiss?: () => void): Promise<boolean> {
    if (this.isPro) {
      callbackOnDismiss?.();
      return false;
    }

    this.actionCounter++;
    if (this.actionCounter >= this.FREQUENCY_LIMIT) {
      this.actionCounter = 0;
      // Show interstitial safely without crashing or hanging UI
      try {
        console.log('[AdMob] Interstitial trigger check passed. Frequency threshold reached.');
        // If react-native-google-mobile-ads native module is linked in standalone build, display here.
        // Falls through gracefully if not running in production native binary.
        callbackOnDismiss?.();
        return true;
      } catch (err) {
        console.warn('[AdMob] Failed to load interstitial:', err);
        callbackOnDismiss?.();
        return false;
      }
    }

    callbackOnDismiss?.();
    return false;
  }
}
