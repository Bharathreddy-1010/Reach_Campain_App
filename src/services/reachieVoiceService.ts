import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { ReachieAudioState } from '../types/reachie';

type StateChangeListener = (state: ReachieAudioState) => void;
type TranscriptListener = (transcript: string, isFinal: boolean) => void;
type ErrorListener = (error: string) => void;
type SpokenTextListener = (text: string, isSpeaking: boolean) => void;

class ReachieVoiceService {
  private currentState: ReachieAudioState = 'idle';
  private stateListeners: Set<StateChangeListener> = new Set();
  private transcriptListeners: Set<TranscriptListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  private spokenTextListeners: Set<SpokenTextListener> = new Set();

  // Web Speech Recognition
  private recognitionInstance: any = null;
  private currentUtterance: any = null;
  private naturalVoice: any = null;

  // Mobile Native Recording (expo-av)
  private nativeRecording: Audio.Recording | null = null;
  private isNativeRecording: boolean = false;
  private silenceTimer: any = null;
  private hasUserSpokenAudio: boolean = false;

  private lastSpokenText: string = '';
  private currentSpokenText: string = '';
  private isMuted: boolean = false;
  private isListeningActive: boolean = false;
  private isContinuousMode: boolean = false;
  private restartTimeout: any = null;

  constructor() {
    this.initRecognition();
    this.loadVoices();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * Load and prioritize warm, natural, human voices (Samantha, Google US English, Ava, Daniel) on web
   */
  public loadVoices(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const bestVoice =
        voices.find(
          (v: any) =>
            (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Premium')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find(
          (v: any) =>
            (v.name.includes('Google') ||
              v.name === 'Samantha' ||
              v.name === 'Karen' ||
              v.name === 'Ava' ||
              v.name === 'Daniel' ||
              v.name === 'Serena') &&
            v.lang.startsWith('en')
        ) ||
        voices.find(
          (v: any) =>
            v.lang === 'en-US' &&
            !v.name.includes('Fred') &&
            !v.name.includes('Albert') &&
            !v.name.includes('Zarvox')
        ) ||
        voices.find((v: any) => v.lang.startsWith('en')) ||
        voices[0];

      this.naturalVoice = bestVoice;
    }
  }

  private initRecognition() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (this.recognitionInstance) {
            try {
              this.recognitionInstance.onstart = null;
              this.recognitionInstance.onresult = null;
              this.recognitionInstance.onerror = null;
              this.recognitionInstance.onend = null;
              this.recognitionInstance.abort();
            } catch {}
          }

          this.recognitionInstance = new SpeechRecognition();
          this.recognitionInstance.continuous = false;
          this.recognitionInstance.interimResults = true;
          this.recognitionInstance.lang = 'en-US';

          this.recognitionInstance.onstart = () => {
            this.isListeningActive = true;
            this.setState('listening');
          };

          this.recognitionInstance.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript;
              } else {
                interimTranscript += res[0].transcript;
              }
            }

            const current = finalTranscript || interimTranscript;
            const isFinal = Boolean(finalTranscript);

            this.transcriptListeners.forEach((listener) => listener(current, isFinal));

            if (isFinal) {
              this.isListeningActive = false;
              this.setState('processing');
            }
          };

          this.recognitionInstance.onerror = (event: any) => {
            this.isListeningActive = false;

            if (event.error === 'no-speech') {
              if (this.isContinuousMode && this.currentState !== 'speaking' && this.currentState !== 'processing') {
                this.scheduleRestart(300);
                return;
              }
            }

            if (this.currentState === 'listening') {
              this.setState('idle');
            }

            if (this.isContinuousMode && event.error !== 'not-allowed' && this.currentState !== 'speaking') {
              this.scheduleRestart(500);
              return;
            }

            if (event.error !== 'no-speech' && event.error !== 'aborted') {
              this.errorListeners.forEach((listener) =>
                listener(`Speech error: ${event.error || 'Failed to capture voice'}`)
              );
            }
          };

          this.recognitionInstance.onend = () => {
            this.isListeningActive = false;
            if (this.isContinuousMode && this.currentState !== 'speaking' && this.currentState !== 'processing') {
              this.scheduleRestart(300);
            } else if (this.currentState === 'listening') {
              this.setState('idle');
            }
          };
        } catch (e) {
          console.warn('Could not initialize Web SpeechRecognition:', e);
        }
      }
    }
  }

  private scheduleRestart(delayMs: number = 300) {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this.isContinuousMode && this.currentState !== 'speaking' && this.currentState !== 'processing') {
        this.startListening();
      }
    }, delayMs);
  }

  public isSpeechRecognitionSupported(): boolean {
    if (Platform.OS !== 'web') {
      return true; // Supported via native expo-av microphone recording + Groq Whisper
    }
    if (typeof window !== 'undefined') {
      return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return false;
  }

  public isSpeechSynthesisSupported(): boolean {
    if (Platform.OS !== 'web') {
      return true; // Supported via native expo-speech
    }
    if (typeof window !== 'undefined') {
      return 'speechSynthesis' in window;
    }
    return false;
  }

  public getState(): ReachieAudioState {
    return this.currentState;
  }

  public getCurrentSpokenText(): string {
    return this.currentSpokenText;
  }

  public setContinuousMode(enabled: boolean): void {
    this.isContinuousMode = enabled;
    if (!enabled && this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
  }

  public getIsContinuousMode(): boolean {
    return this.isContinuousMode;
  }

  private setState(state: ReachieAudioState) {
    this.currentState = state;
    this.stateListeners.forEach((listener) => listener(state));
  }

  public onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onTranscript(listener: TranscriptListener): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public onSpokenText(listener: SpokenTextListener): () => void {
    this.spokenTextListeners.add(listener);
    return () => this.spokenTextListeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Start listening for voice commands.
   * On Web with SpeechRecognition: uses native browser SpeechRecognition.
   * On Mobile / Native: uses expo-av Audio.Recording and streams to Groq Whisper for 99%+ accuracy!
   */
  public async startListening(): Promise<boolean> {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.isContinuousMode = true;

    // 1. Web SpeechRecognition branch
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hasWebSpeech = Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      if (hasWebSpeech) {
        try {
          this.initRecognition();
          if (this.recognitionInstance) {
            this.isListeningActive = true;
            this.recognitionInstance.start();
            this.setState('listening');
            return true;
          }
        } catch (err: any) {
          if (err.name === 'InvalidStateError') {
            this.isListeningActive = true;
            this.setState('listening');
            return true;
          }
          console.warn('Web SpeechRecognition start error:', err);
        }
      }
    }

    // 2. Mobile Native Audio Recording (expo-av) + Groq Whisper
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        this.errorListeners.forEach((listener) =>
          listener('Microphone permission required for voice control')
        );
        this.setState('idle');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      if (this.nativeRecording) {
        try {
          await this.nativeRecording.stopAndUnloadAsync();
        } catch {}
        this.nativeRecording = null;
      }

      const recording = new Audio.Recording();
      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          metering: true,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          metering: true,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      this.hasUserSpokenAudio = false;

      // Listen for voice levels and detect pause/silence automatically
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const metering = status.metering ?? -160;

        // If audio level exceeds background threshold, user is speaking
        if (metering > -38) {
          this.hasUserSpokenAudio = true;
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else if (this.hasUserSpokenAudio) {
          // User spoke and then paused for 1.8 seconds -> finish and transcribe!
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              if (this.isListeningActive && this.isNativeRecording) {
                this.stopListeningAndTranscribe(false);
              }
            }, 1800);
          }
        }

        // Safety timeout: auto-stop after 15 seconds
        if (status.durationMillis > 15000 && this.isListeningActive && this.isNativeRecording) {
          this.stopListeningAndTranscribe(false);
        }
      });

      await recording.startAsync();
      this.nativeRecording = recording;
      this.isNativeRecording = true;
      this.isListeningActive = true;
      this.setState('listening');
      return true;
    } catch (e: any) {
      console.warn('Could not start mobile audio recording:', e);
      this.isNativeRecording = false;
      this.isListeningActive = false;
      this.setState('idle');
      return false;
    }
  }

  /**
   * Stop listening.
   * If mobile native recording is active, finishes recording and transcribes with Whisper.
   */
  public stopListening(forceStopContinuous: boolean = false, discardAudio: boolean = false): void {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);

    if (forceStopContinuous) {
      this.isContinuousMode = false;
      if (this.restartTimeout) clearTimeout(this.restartTimeout);
    }

    // 1. Mobile Native Recording
    if (this.isNativeRecording && this.nativeRecording) {
      if (discardAudio) {
        try {
          this.nativeRecording.stopAndUnloadAsync();
        } catch {}
        this.nativeRecording = null;
        this.isNativeRecording = false;
        this.isListeningActive = false;
        if (this.currentState === 'listening') {
          this.setState('idle');
        }
      } else {
        this.stopListeningAndTranscribe(forceStopContinuous);
      }
      return;
    }

    // 2. Web SpeechRecognition
    if (this.recognitionInstance && this.isListeningActive) {
      try {
        this.recognitionInstance.stop();
      } catch {}
    }
    this.isListeningActive = false;
    if (this.currentState === 'listening') {
      this.setState('idle');
    }
  }

  /**
   * Complete native audio recording and transcribe via Groq Whisper API
   */
  public async stopListeningAndTranscribe(forceStopContinuous: boolean = false): Promise<void> {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (forceStopContinuous) {
      this.isContinuousMode = false;
      if (this.restartTimeout) clearTimeout(this.restartTimeout);
    }

    if (!this.nativeRecording || !this.isListeningActive) {
      this.isListeningActive = false;
      return;
    }

    const recording = this.nativeRecording;
    this.nativeRecording = null;
    this.isListeningActive = false;
    this.isNativeRecording = false;
    this.setState('processing');

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        this.setState('idle');
        return;
      }

      this.transcriptListeners.forEach((listener) => listener('Transcribing voice...', false));

      const transcript = await this.transcribeAudioWithGroqWhisper(uri);

      if (transcript && transcript.trim()) {
        this.transcriptListeners.forEach((listener) => listener(transcript.trim(), true));
      } else {
        this.setState('idle');
        if (this.isContinuousMode && this.currentState !== 'speaking') {
          this.scheduleRestart(400);
        }
      }
    } catch (err: any) {
      console.warn('Native recording transcription error:', err);
      this.setState('idle');
      if (this.isContinuousMode && this.currentState !== 'speaking') {
        this.scheduleRestart(500);
      }
    }
  }

  /**
   * Transcribe recorded audio with Groq Whisper API (whisper-large-v3-turbo)
   */
  private async transcribeAudioWithGroqWhisper(audioUri: string): Promise<string> {
    const apiKey =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GROQ_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
      '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';

    if (!apiKey) {
      console.warn('No Groq API key available for Whisper transcription');
      return '';
    }

    try {
      const formData = new FormData();
      if (Platform.OS !== 'web') {
        formData.append('file', {
          uri: audioUri,
          name: 'recording.m4a',
          type: 'audio/m4a',
        } as any);
      } else {
        const resp = await fetch(audioUri);
        const blob = await resp.blob();
        formData.append('file', blob, 'recording.m4a');
      }
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('Groq Whisper API response error:', res.status, errText);
        return '';
      }

      const data = await res.json();
      return (data.text || '').trim();
    } catch (err: any) {
      console.warn('Groq Whisper request error:', err);
      return '';
    }
  }

  /**
   * Speak response with a warm, natural human cadence.
   * On mobile / native: uses expo-speech.
   * On web: uses Web SpeechSynthesis with natural voices.
   */
  public speak(text: string): void {
    this.lastSpokenText = text;

    // 1. Sanitize text for natural voice pronunciation
    let clean = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/^[•\-\*]\s+/gm, '')
      .replace(/[•\-\*]/g, ' ')
      .replace(/₹\s*([\d,]+)/g, '$1 rupees')
      .replace(/₹/g, 'rupees ')
      .replace(
        /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Keep spoken utterance to 1-2 punchy sentences so it feels human, not robotic
    const sentences = clean.split(/(?<=[.!?])\s+/);
    if (sentences.length > 2) {
      clean = sentences.slice(0, 2).join(' ');
    }

    this.currentSpokenText = clean;
    this.spokenTextListeners.forEach((l) => l(clean, true));

    // If muted, show subtitle for 1.8s then resume listening in continuous mode
    if (this.isMuted) {
      setTimeout(() => {
        this.spokenTextListeners.forEach((l) => l('', false));
        if (this.isContinuousMode) {
          this.scheduleRestart(300);
        }
      }, 1800);
      return;
    }

    // 3. Mobile / Native Speech Synthesis via expo-speech
    if (Platform.OS !== 'web') {
      try {
        Speech.stop();
        this.setState('speaking');

        Speech.speak(clean, {
          language: 'en-US',
          pitch: 1.0,
          rate: 1.0,
          onStart: () => {
            this.setState('speaking');
            this.spokenTextListeners.forEach((l) => l(clean, true));
          },
          onDone: () => {
            this.setState('idle');
            this.spokenTextListeners.forEach((l) => l('', false));
            if (this.isContinuousMode) {
              this.scheduleRestart(350);
            }
          },
          onError: (e) => {
            console.warn('Speech error:', e);
            this.setState('idle');
            this.spokenTextListeners.forEach((l) => l('', false));
            if (this.isContinuousMode) {
              this.scheduleRestart(350);
            }
          },
        });
        return;
      } catch (err) {
        console.warn('Speech.speak failed on mobile:', err);
        this.setState('idle');
        this.spokenTextListeners.forEach((l) => l('', false));
        return;
      }
    }

    // 4. Web SpeechSynthesis
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        if (!this.naturalVoice) {
          this.loadVoices();
        }

        const utterance = new SpeechSynthesisUtterance(clean);
        if (this.naturalVoice) {
          utterance.voice = this.naturalVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.02;
        utterance.lang = 'en-US';

        (window as any).__reachieActiveUtterance = utterance;

        let finished = false;
        let watchdog: any = null;

        const finishSpeaking = () => {
          if (finished) return;
          finished = true;
          if (watchdog) clearTimeout(watchdog);
          this.setState('idle');
          this.currentUtterance = null;
          (window as any).__reachieActiveUtterance = null;
          this.spokenTextListeners.forEach((l) => l('', false));

          if (this.isContinuousMode) {
            this.scheduleRestart(350);
          }
        };

        utterance.onstart = () => {
          this.setState('speaking');
          this.spokenTextListeners.forEach((l) => l(clean, true));
        };

        utterance.onend = () => {
          finishSpeaking();
        };

        utterance.onerror = () => {
          finishSpeaking();
        };

        const approxMs = Math.max(2200, clean.split(' ').length * 450 + 1200);
        watchdog = setTimeout(() => {
          if (!finished && this.currentState === 'speaking') {
            finishSpeaking();
          }
        }, approxMs);

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
        this.setState('idle');
        this.spokenTextListeners.forEach((l) => l('', false));

        if (this.isContinuousMode) {
          this.scheduleRestart(350);
        }
      }
    } else {
      setTimeout(() => {
        this.spokenTextListeners.forEach((l) => l('', false));
        if (this.isContinuousMode) {
          this.scheduleRestart(300);
        }
      }, 1800);
    }
  }

  public stopSpeaking(): void {
    if (Platform.OS !== 'web') {
      try {
        Speech.stop();
      } catch {}
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.currentSpokenText = '';
    this.spokenTextListeners.forEach((l) => l('', false));
    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

  public repeatLastSpoken(): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const reachieVoiceService = new ReachieVoiceService();
