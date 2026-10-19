import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import {
  ReachieMessage,
  ReachieTaskContext,
  ReachieActionExecution,
  ReachieAudioState,
} from '../types/reachie';
import { ReachieService } from '../services/reachieService';
import { reachieVoiceService } from '../services/reachieVoiceService';
import { CampaignRepository } from '../repositories/campaignRepository';
import { useTheme } from '../theme/ThemeContext';
import { ThemeId } from '../theme/themes';
import { DraftCampaign, Campaign } from '../types';

interface ReachieContextValue {
  isOpen: boolean;
  openReachie: (initialPrompt?: string) => void;
  closeReachie: () => void;
  isVoiceActive: boolean;
  startVoiceControl: () => Promise<void>;
  stopVoiceControl: () => void;
  messages: ReachieMessage[];
  sendMessage: (text: string) => Promise<void>;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  startVoiceInput: () => Promise<void>;
  stopVoiceInput: () => void;
  stopSpeaking: () => void;
  repeatLastResponse: () => void;
  clearChat: () => void;
  currentTaskContext: ReachieTaskContext;
  pendingAction: ReachieActionExecution | null;
  confirmAction: (actionId: string, confirmed: boolean) => Promise<void>;
  activeDraft: DraftCampaign | null;
  refreshDraft: () => Promise<void>;
  currentSpokenText: string;
  interimTranscript: string;
}

const ReachieContext = createContext<ReachieContextValue | undefined>(undefined);

const INITIAL_GREETING: ReachieMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content:
    "Hello! I'm Reachie, your AI voice assistant. Speak or type your request to create campaigns or navigate.",
  timestamp: new Date().toISOString(),
  suggestedActions: [
    { id: 'act_s1', label: 'Create a Campaign', query: 'Create a new campaign' },
    { id: 'act_s2', label: 'Explore Campaigns', query: 'Explore campaigns' },
    { id: 'act_s3', label: 'Check My Draft', query: 'What details are missing from my draft?' },
    { id: 'act_s4', label: 'Switch to Dark Chocolate', query: 'Switch theme to Dark Chocolate' },
  ],
};

export const ReachieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setThemeId, themeId } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<ReachieMessage[]>([INITIAL_GREETING]);
  const [audioState, setAudioState] = useState<ReachieAudioState>('idle');
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [activeDraft, setActiveDraft] = useState<DraftCampaign | null>(null);
  const [pendingAction, setPendingAction] = useState<ReachieActionExecution | null>(null);
  const [creationStage, setCreationStage] = useState<ReachieTaskContext['campaignCreationStage']>('idle');
  const [stagedData, setStagedData] = useState<Partial<DraftCampaign>>({});
  const [activeField, setActiveField] = useState<string | undefined>();
  const [lastQuestion, setLastQuestion] = useState<string | undefined>();

  // Synchronous refs to prevent any closure staleness or async state lags
  const creationStageRef = useRef<ReachieTaskContext['campaignCreationStage']>('idle');
  const stagedDataRef = useRef<Partial<DraftCampaign>>({});
  const activeFieldRef = useRef<string | undefined>();
  const lastQuestionRef = useRef<string | undefined>();
  const messagesRef = useRef<ReachieMessage[]>([INITIAL_GREETING]);
  const activeDraftRef = useRef<DraftCampaign | null>(null);
  const pendingActionRef = useRef<ReachieActionExecution | null>(null);
  const pathnameRef = useRef<string>(pathname);
  const sendMessageRef = useRef<(text: string) => Promise<void>>();

  useEffect(() => {
    activeDraftRef.current = activeDraft;
  }, [activeDraft]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Sync draft from repository
  const refreshDraft = useCallback(async () => {
    try {
      const d = await CampaignRepository.getDraft();
      setActiveDraft(d);
      activeDraftRef.current = d;
    } catch {}
  }, []);

  useEffect(() => {
    refreshDraft();
  }, [refreshDraft, pathname]);

  // Listen to voice service state, transcripts, and spoken text
  useEffect(() => {
    const unsubState = reachieVoiceService.onStateChange((state) => {
      setAudioState(state);
    });

    const unsubTranscript = reachieVoiceService.onTranscript((transcript, isFinal) => {
      setInterimTranscript(transcript);
      if (isFinal && transcript.trim()) {
        reachieVoiceService.stopListening();
        setInterimTranscript('');
        sendMessageRef.current?.(transcript.trim());
      }
    });

    const unsubSpoken = reachieVoiceService.onSpokenText((text, isSpeaking) => {
      setCurrentSpokenText(text);
    });

    return () => {
      unsubState();
      unsubTranscript();
      unsubSpoken();
    };
  }, []);

  const openReachie = useCallback(
    (initialPrompt?: string) => {
      setIsOpen(true);
      refreshDraft();
      if (initialPrompt && initialPrompt.trim()) {
        sendMessage(initialPrompt.trim());
      }
    },
    [refreshDraft]
  );

  const closeReachie = useCallback(() => {
    reachieVoiceService.stopListening();
    reachieVoiceService.stopSpeaking();
    setIsOpen(false);
  }, []);

  /**
   * Start AI Voice Control:
   * Comes out from the chat section, opens the animated wave at the top of the app,
   * announces "AI in control", and allows the user to continue the app flow seamlessly.
   */
  const startVoiceControl = useCallback(async () => {
    // 1. Close full chat section so user sees the app
    setIsOpen(false);
    // 2. Open top audio wave bar
    setIsVoiceActive(true);
    setInterimTranscript('');
    // 3. Start listening to voice input
    await reachieVoiceService.startListening();
  }, []);

  const stopVoiceControl = useCallback(() => {
    reachieVoiceService.stopListening(true, true);
    reachieVoiceService.stopSpeaking();
    setIsVoiceActive(false);
    setInterimTranscript('');
    setCurrentSpokenText('');
  }, []);

  const clearChat = useCallback(() => {
    reachieVoiceService.stopSpeaking();
    reachieVoiceService.stopListening(true, true);
    messagesRef.current = [INITIAL_GREETING];
    setMessages([INITIAL_GREETING]);
    creationStageRef.current = 'idle';
    setCreationStage('idle');
    stagedDataRef.current = {};
    setStagedData({});
    activeFieldRef.current = undefined;
    setActiveField(undefined);
    lastQuestionRef.current = undefined;
    setLastQuestion(undefined);
    pendingActionRef.current = null;
    setPendingAction(null);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    reachieVoiceService.setMuted(next);
  }, [isMuted]);

  // Voice input button triggers voice control mode with top wave
  const startVoiceInput = useCallback(async () => {
    await startVoiceControl();
  }, [startVoiceControl]);

  const stopVoiceInput = useCallback(() => {
    reachieVoiceService.stopListening(false, false);
  }, []);

  const stopSpeaking = useCallback(() => {
    reachieVoiceService.stopSpeaking();
  }, []);

  const repeatLastResponse = useCallback(() => {
    reachieVoiceService.repeatLastSpoken();
  }, []);

  // Action executor - navigates, updates draft, or switches theme immediately
  const executeAction = useCallback(
    async (action: ReachieActionExecution) => {
      // 1. Theme change
      if (action.type === 'switch_theme' && action.themeId) {
        await setThemeId(action.themeId);
      }

      // 2. Draft updates and step transitions
      const existing = (await CampaignRepository.getDraft()) || ({} as DraftCampaign);
      let updatedDraft: DraftCampaign = { ...existing };
      let changedDraft = false;

      if (action.fieldUpdates) {
        updatedDraft = { ...updatedDraft, ...action.fieldUpdates };
        changedDraft = true;
      }
      if (action.step) {
        updatedDraft.currentStep = action.step as any;
        changedDraft = true;
      }
      if (changedDraft) {
        await CampaignRepository.saveDraft(updatedDraft);
        await refreshDraft();
      }

      // 3. Navigation
      if (action.targetRoute) {
        router.push(action.targetRoute as any);
      }
    },
    [router, setThemeId, refreshDraft]
  );

  // Submission handler: Submits draft, clears draft, speaks confirmation, closes Reachie, and redirects to Creator Studio
  const handleCampaignSubmission = useCallback(
    async (draftOverride?: DraftCampaign) => {
      const repoDraft = await CampaignRepository.getDraft();
      const mergedDraft: DraftCampaign = {
        ...(repoDraft || {}),
        ...(stagedDataRef.current || {}),
        ...(draftOverride || {}),
        confirmedPolicies: true,
        hasImagePermission: true,
        creatorName:
          (draftOverride?.creatorName || repoDraft?.creatorName || stagedDataRef.current?.creatorName || '').trim() ||
          'The Community Project',
      } as DraftCampaign;

      if (!mergedDraft.title || !mergedDraft.title.trim()) {
        const errorMsg: ReachieMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "I couldn't find a title for your campaign draft. Please provide a title first.",
          timestamp: new Date().toISOString(),
        };
        const historyWithError = [...messagesRef.current, errorMsg];
        messagesRef.current = historyWithError;
        setMessages(historyWithError);
        reachieVoiceService.speak(errorMsg.content);
        return null;
      }

      try {
        const submitted = await CampaignRepository.submitCampaign(mergedDraft);
        await CampaignRepository.clearDraft();
        await refreshDraft();

        pendingActionRef.current = null;
        setPendingAction(null);
        creationStageRef.current = 'idle';
        setCreationStage('idle');
        stagedDataRef.current = {};
        setStagedData({});
        activeFieldRef.current = undefined;
        setActiveField(undefined);
        lastQuestionRef.current = undefined;
        setLastQuestion(undefined);

        const successMsg: ReachieMessage = {
          id: `asst_sub_ok_${Date.now()}`,
          role: 'assistant',
          content: `Campaign "${submitted.title}" submitted successfully for verification!`,
          timestamp: new Date().toISOString(),
          submittedCampaign: submitted,
        };
        const historyWithSuccess = [...messagesRef.current, successMsg];
        messagesRef.current = historyWithSuccess;
        setMessages(historyWithSuccess);

        // Speak natural voice confirmation
        reachieVoiceService.speak(
          `Campaign ${submitted.title} submitted successfully for review. Taking you to Creator Studio.`
        );

        // Close Reachie modal & stop voice assistant so Reachie leaves the screen
        setIsOpen(false);
        setIsVoiceActive(false);
        reachieVoiceService.stopListening(true, true);

        // Redirect directly to Creator Studio for campaign approval
        setTimeout(() => {
          router.replace('/creator');
        }, 350);

        return submitted;
      } catch (e: any) {
        console.error('Failed to submit campaign via Reachie:', e);
        const failMsg: ReachieMessage = {
          id: `asst_sub_fail_${Date.now()}`,
          role: 'assistant',
          content: `Failed to submit campaign: ${e?.message || 'Unknown error'}.`,
          timestamp: new Date().toISOString(),
        };
        const historyWithFail = [...messagesRef.current, failMsg];
        messagesRef.current = historyWithFail;
        setMessages(historyWithFail);
        reachieVoiceService.speak(`Failed to submit campaign: ${e?.message || 'Unknown error'}`);
        return null;
      }
    },
    [refreshDraft, router]
  );

  // Action confirmation
  const confirmAction = useCallback(
    async (actionId: string, confirmed: boolean) => {
      if (!pendingActionRef.current || pendingActionRef.current.id !== actionId) return;

      if (!confirmed) {
        pendingActionRef.current = null;
        setPendingAction(null);
        const cancelMsg: ReachieMessage = {
          id: `asst_cancel_${Date.now()}`,
          role: 'assistant',
          content: 'Submission cancelled. Your draft remains safely saved.',
          timestamp: new Date().toISOString(),
        };
        const historyWithCancel = [...messagesRef.current, cancelMsg];
        messagesRef.current = historyWithCancel;
        setMessages(historyWithCancel);
        reachieVoiceService.speak(cancelMsg.content);
        return;
      }

      // Consequential Action Confirmed
      if (pendingActionRef.current.type === 'submit_campaign') {
        await handleCampaignSubmission();
      }
    },
    [handleCampaignSubmission]
  );

  // Send message
  const sendMessage = useCallback(
    async (userText: string) => {
      const lowerText = userText.trim().toLowerCase();

      // Check if user is confirming or cancelling an active pending action
      if (pendingActionRef.current && pendingActionRef.current.type === 'submit_campaign') {
        const isAffirmative =
          lowerText.includes('yes') ||
          lowerText.includes('submit') ||
          lowerText.includes('confirm') ||
          lowerText.includes('proceed') ||
          lowerText.includes('sure') ||
          lowerText.includes('ok') ||
          lowerText.includes('go ahead') ||
          lowerText.includes('do it') ||
          lowerText.includes('publish');

        const isNegative =
          lowerText.includes('no') ||
          lowerText.includes('cancel') ||
          lowerText.includes('stop') ||
          lowerText.includes("don't") ||
          lowerText.includes('dont');

        if (isAffirmative) {
          const userMsg: ReachieMessage = {
            id: `usr_${Date.now()}`,
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString(),
          };
          messagesRef.current = [...messagesRef.current, userMsg];
          setMessages(messagesRef.current);
          await handleCampaignSubmission();
          return;
        } else if (isNegative) {
          const userMsg: ReachieMessage = {
            id: `usr_${Date.now()}`,
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString(),
          };
          messagesRef.current = [...messagesRef.current, userMsg];
          setMessages(messagesRef.current);
          await confirmAction(pendingActionRef.current.id, false);
          return;
        }
      }

      const userMsg: ReachieMessage = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString(),
      };

      const historyWithUser = [...messagesRef.current, userMsg];
      messagesRef.current = historyWithUser;
      setMessages(historyWithUser);
      setAudioState('processing');

      const currentContext: ReachieTaskContext = {
        currentRoute: pathnameRef.current,
        activeDraft: activeDraftRef.current,
        pendingAction: pendingActionRef.current,
        campaignCreationStage: creationStageRef.current,
        stagedCampaignData: stagedDataRef.current,
        activeField: activeFieldRef.current,
        lastQuestion: lastQuestionRef.current,
      };

      try {
        const result = await ReachieService.processUserMessage(userText, historyWithUser, currentContext);

        if (result.nextStage) {
          creationStageRef.current = result.nextStage;
          setCreationStage(result.nextStage);
        }
        if (result.stagedData) {
          stagedDataRef.current = result.stagedData;
          setStagedData(result.stagedData);
        }
        if (result.activeField !== undefined) {
          activeFieldRef.current = result.activeField;
          setActiveField(result.activeField);
        }
        if (result.lastQuestion !== undefined) {
          lastQuestionRef.current = result.lastQuestion;
          setLastQuestion(result.lastQuestion);
        }

        const assistantMsg: ReachieMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: new Date().toISOString(),
          suggestedActions: result.suggestedActions,
          action: result.action,
          draftPreview: result.draftPreview,
        };

        const historyWithAssistant = [...messagesRef.current, assistantMsg];
        messagesRef.current = historyWithAssistant;
        setMessages(historyWithAssistant);

        // Execute action if present
        if (result.action) {
          if (result.action.requiresConfirmation) {
            // Check if user has already given explicit verbal confirmation in their utterance or via voice assistant
            const isAffirmativeSubmission =
              result.action.type === 'submit_campaign' &&
              (isVoiceActive ||
                lowerText.includes('yes') ||
                lowerText.includes('submit') ||
                lowerText.includes('confirm') ||
                lowerText.includes('proceed') ||
                lowerText.includes('publish') ||
                lowerText.includes('sure') ||
                lowerText.includes('ok') ||
                lowerText.includes('go ahead') ||
                lowerText.includes('ready'));

            if (isAffirmativeSubmission) {
              await handleCampaignSubmission();
              return;
            }

            pendingActionRef.current = result.action;
            setPendingAction(result.action);
            // If action needs confirmation and wasn't explicitly affirmed, open modal so user can confirm
            setIsOpen(true);
            reachieVoiceService.speak(result.reply);
          } else {
            reachieVoiceService.speak(result.reply);
            await executeAction(result.action);
            await refreshDraft();
          }
        } else {
          // Speak reply in natural human voice if unmuted
          reachieVoiceService.speak(result.reply);
        }
      } catch (err: any) {
        console.error('Reachie message error:', err);
        const errorMsg: ReachieMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "I ran into a slight issue. Please try again or ask me something else!",
          timestamp: new Date().toISOString(),
        };
        const historyWithError = [...messagesRef.current, errorMsg];
        messagesRef.current = historyWithError;
        setMessages(historyWithError);
      }
    },
    [executeAction, refreshDraft, handleCampaignSubmission, confirmAction, isVoiceActive]
  );

  sendMessageRef.current = sendMessage;

  return (
    <ReachieContext.Provider
      value={{
        isOpen,
        openReachie,
        closeReachie,
        isVoiceActive,
        startVoiceControl,
        stopVoiceControl,
        messages,
        sendMessage,
        isListening: audioState === 'listening',
        isProcessing: audioState === 'processing',
        isSpeaking: audioState === 'speaking',
        isMuted,
        toggleMute,
        startVoiceInput,
        stopVoiceInput,
        stopSpeaking,
        repeatLastResponse,
        clearChat,
        currentTaskContext: {
          currentRoute: pathname,
          activeDraft,
          pendingAction,
          campaignCreationStage: creationStage,
          stagedCampaignData: stagedData,
        },
        pendingAction,
        confirmAction,
        activeDraft,
        refreshDraft,
        currentSpokenText,
        interimTranscript,
      }}
    >
      {children}
    </ReachieContext.Provider>
  );
};

export const useReachie = (): ReachieContextValue => {
  const context = useContext(ReachieContext);
  if (!context) {
    throw new Error('useReachie must be used within a ReachieProvider');
  }
  return context;
};
