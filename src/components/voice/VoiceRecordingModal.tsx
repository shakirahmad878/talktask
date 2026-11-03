import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  X,
  Check,
  AlertTriangle,
  Calendar,
  Clock,
  ListTodo,
  FileText,
  Bell,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { useRecordingStore } from '../../store/useRecordingStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ExtractionType, LanguageCode } from '../../types';

interface VoiceRecordingModalProps {
  isDark?: boolean;
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({ isDark = false }) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const {
    isModalVisible,
    status,
    durationMs,
    meteringLevel,
    transcript,
    extractedEntity,
    errorMessage,
    selectedLanguage,
    isSaving,
    closeModal,
    setLanguage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndProcess,
    cancelRecording,
    updateTranscript,
    updateExtractedEntity,
    confirmAndSave,
  } = useRecordingStore();

  const [editableTranscript, setEditableTranscript] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(10)).current;
  const waveAnim2 = useRef(new Animated.Value(20)).current;
  const waveAnim3 = useRef(new Animated.Value(15)).current;

  // Sync transcript to local editable state when review begins
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Pulse animation while recording
  useEffect(() => {
    if (status === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      // Dynamic wave bar height animations based on metering level
      Animated.spring(waveAnim1, {
        toValue: 10 + meteringLevel * 40,
        useNativeDriver: false,
      }).start();
      Animated.spring(waveAnim2, {
        toValue: 15 + meteringLevel * 60,
        useNativeDriver: false,
      }).start();
      Animated.spring(waveAnim3, {
        toValue: 12 + meteringLevel * 50,
        useNativeDriver: false,
      }).start();

      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, meteringLevel]);

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
  };

  const handleTranscriptBlur = () => {
    if (editableTranscript !== transcript) {
      updateTranscript(editableTranscript);
    }
  };

  const handleSave = async () => {
    try {
      await confirmAndSave();
    } catch (e) {
      console.warn('Save failed:', e);
    }
  };

  const entityTypeIcons: Record<ExtractionType, React.ReactNode> = {
    task: <Check size={18} color={theme.primary} />,
    reminder: <Bell size={18} color={theme.warning} />,
    checklist: <ListTodo size={18} color={theme.accent} />,
    note: <FileText size={18} color={theme.secondary} />,
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={20} color={theme.primary} />
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>TalkTask Voice</Text>
            </View>
            <TouchableOpacity
              onPress={closeModal}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
              accessible
              accessibilityLabel="Close voice modal"
            >
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Language Selector Pills */}
          <View style={styles.langSelector}>
            {(['en', 'hi', 'hinglish'] as LanguageCode[]).map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  disabled={status === 'recording' || status === 'transcribing'}
                  onPress={() => handleLanguageChange(lang)}
                  style={[
                    styles.langPill,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSubtle,
                      borderColor: isSelected ? theme.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      { color: isSelected ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'Hinglish'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* IDLE / READY STATE */}
            {status === 'idle' && (
              <View style={styles.centerContainer}>
                <Text style={[styles.promptText, { color: theme.textSecondary }]}>
                  Tap the microphone and speak naturally. We'll organise it into tasks, notes, or reminders.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={startRecording}
                  style={[styles.bigMicBtn, { backgroundColor: theme.primary }]}
                  accessible
                  accessibilityLabel="Start recording"
                >
                  <Mic size={44} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.statusSubtitle, { color: theme.textTertiary }]}>
                  Ready to record
                </Text>
              </View>
            )}

            {/* RECORDING / PAUSED STATE */}
            {(status === 'recording' || status === 'paused') && (
              <View style={styles.centerContainer}>
                {/* Visualizer wave bars */}
                <View style={styles.waveBarContainer}>
                  <Animated.View
                    style={[styles.waveBar, { height: waveAnim1, backgroundColor: theme.primary }]}
                  />
                  <Animated.View
                    style={[styles.waveBar, { height: waveAnim2, backgroundColor: theme.accent }]}
                  />
                  <Animated.View
                    style={[styles.waveBar, { height: waveAnim3, backgroundColor: theme.secondary }]}
                  />
                </View>

                {/* Animated Pulsing Mic */}
                <Animated.View
                  style={[
                    styles.bigMicPulse,
                    {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor: status === 'paused' ? theme.warningLight : theme.dangerLight,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bigMicBtn,
                      { backgroundColor: status === 'paused' ? theme.warning : theme.danger },
                    ]}
                  >
                    <Mic size={44} color="#FFF" />
                  </View>
                </Animated.View>

                {/* Duration */}
                <Text style={[styles.durationText, { color: theme.textPrimary }]}>
                  {formatDuration(durationMs)}
                </Text>

                <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
                  {status === 'recording' ? 'Listening...' : 'Paused'}
                </Text>

                {/* Controls: Pause/Resume, Stop & Process, Cancel */}
                <View style={styles.recordingControls}>
                  <TouchableOpacity
                    onPress={cancelRecording}
                    style={[styles.controlBtn, { backgroundColor: theme.surfaceSubtle }]}
                    accessible
                    accessibilityLabel="Cancel recording"
                  >
                    <X size={22} color={theme.danger} />
                    <Text style={[styles.controlBtnText, { color: theme.danger }]}>Cancel</Text>
                  </TouchableOpacity>

                  {status === 'recording' ? (
                    <TouchableOpacity
                      onPress={pauseRecording}
                      style={[styles.controlBtn, { backgroundColor: theme.surfaceSubtle }]}
                      accessible
                      accessibilityLabel="Pause recording"
                    >
                      <Pause size={22} color={theme.textPrimary} />
                      <Text style={[styles.controlBtnText, { color: theme.textPrimary }]}>Pause</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={resumeRecording}
                      style={[styles.controlBtn, { backgroundColor: theme.surfaceSubtle }]}
                      accessible
                      accessibilityLabel="Resume recording"
                    >
                      <Play size={22} color={theme.primary} />
                      <Text style={[styles.controlBtnText, { color: theme.primary }]}>Resume</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={stopAndProcess}
                    style={[styles.controlBtn, styles.stopBtn, { backgroundColor: theme.primary }]}
                    accessible
                    accessibilityLabel="Done and process"
                  >
                    <Check size={22} color="#FFF" />
                    <Text style={[styles.controlBtnText, { color: '#FFF' }]}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* TRANSCRIBING STATE */}
            {status === 'transcribing' && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.transcribingTitle, { color: theme.textPrimary }]}>
                  Transcribing & Organising...
                </Text>
                <Text style={[styles.transcribingSubtitle, { color: theme.textSecondary }]}>
                  Extracting dates, tasks, and action items
                </Text>
              </View>
            )}

            {/* REVIEW & CONFIRMATION STATE */}
            {status === 'review' && extractedEntity && (
              <View style={styles.reviewContainer}>
                {/* Ambiguity Alert if detected */}
                {extractedEntity.isAmbiguous && (
                  <View style={[styles.alertBanner, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
                    <AlertTriangle size={20} color={theme.warning} />
                    <View style={styles.alertContent}>
                      <Text style={[styles.alertTitle, { color: theme.warning }]}>Confirmation Needed</Text>
                      <Text style={[styles.alertBody, { color: theme.textSecondary }]}>
                        {extractedEntity.ambiguityReason || 'Please verify the extracted date and details.'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Editable Transcript */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>SPEECH TRANSCRIPT</Text>
                  <Text style={[styles.sectionHint, { color: theme.textTertiary }]}>Tap to edit</Text>
                </View>

                <TextInput
                  value={editableTranscript}
                  onChangeText={setEditableTranscript}
                  onBlur={handleTranscriptBlur}
                  multiline
                  style={[
                    styles.transcriptInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      color: theme.textPrimary,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                  placeholder="Transcript will appear here..."
                  placeholderTextColor={theme.textTertiary}
                />

                {/* Extracted Entity Preview Card */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>EXTRACTED ACTION</Text>
                </View>

                <View style={[styles.entityCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.cardBorder }]}>
                  {/* Entity Type Selector */}
                  <View style={styles.typeSelectorRow}>
                    {(['task', 'reminder', 'checklist', 'note'] as ExtractionType[]).map((t) => {
                      const isActive = extractedEntity.type === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => updateExtractedEntity({ type: t })}
                          style={[
                            styles.typePill,
                            {
                              backgroundColor: isActive ? theme.primary : theme.surface,
                              borderColor: isActive ? theme.primary : theme.surfaceBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typePillText,
                              { color: isActive ? '#FFF' : theme.textSecondary },
                            ]}
                          >
                            {t.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Title & Description */}
                  <Text style={[styles.entityTitle, { color: theme.textPrimary }]}>
                    {extractedEntity.title}
                  </Text>

                  {/* Date & Time if scheduled */}
                  {extractedEntity.dueAt && (
                    <View style={styles.metaRow}>
                      <Calendar size={16} color={theme.primary} />
                      <Text style={[styles.metaText, { color: theme.primary }]}>
                        {new Date(extractedEntity.dueAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(extractedEntity.dueAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}

                  {/* Checklist Items if applicable */}
                  {extractedEntity.type === 'checklist' &&
                    extractedEntity.checklistItems &&
                    extractedEntity.checklistItems.length > 0 && (
                      <View style={styles.checklistPreview}>
                        {extractedEntity.checklistItems.map((item, idx) => (
                          <View key={idx} style={styles.checklistItemRow}>
                            <View style={[styles.miniCheckCircle, { borderColor: theme.accent }]} />
                            <Text style={[styles.checklistItemText, { color: theme.textPrimary }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.reviewActions}>
                  <Button
                    title="Re-record"
                    variant="outline"
                    onPress={startRecording}
                    icon={<RefreshCw size={18} color={theme.textPrimary} />}
                    isDark={isDark}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Confirm & Save"
                    variant="primary"
                    loading={isSaving}
                    onPress={handleSave}
                    icon={<Check size={18} color="#FFF" />}
                    isDark={isDark}
                    style={{ flex: 1.4 }}
                  />
                </View>
              </View>
            )}

            {/* ERROR STATE */}
            {status === 'error' && (
              <View style={styles.centerContainer}>
                <MicOff size={48} color={theme.danger} />
                <Text style={[styles.errorTitle, { color: theme.danger }]}>Recording Failed</Text>
                <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
                  {errorMessage || 'An error occurred during audio recording.'}
                </Text>
                <Button
                  title="Try Again"
                  variant="primary"
                  onPress={startRecording}
                  style={{ marginTop: Spacing.lg }}
                  isDark={isDark}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    minHeight: 440,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  langPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  langPillText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  promptText: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  bigMicPulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  bigMicBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  waveBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
    marginBottom: Spacing.md,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  durationText: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  recordingControls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
  },
  stopBtn: {
    paddingHorizontal: Spacing.xl,
  },
  controlBtnText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
  },
  transcribingTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  transcribingSubtitle: {
    fontSize: Typography.sizes.bodySm,
  },
  reviewContainer: {
    paddingTop: Spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  alertBody: {
    fontSize: Typography.sizes.caption,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: Typography.sizes.caption,
  },
  transcriptInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.body,
    lineHeight: 22,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: Spacing.base,
  },
  entityCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typePill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  entityTitle: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
  },
  checklistPreview: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  miniCheckCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  checklistItemText: {
    fontSize: Typography.sizes.bodySm,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  errorMessage: {
    fontSize: Typography.sizes.bodySm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
