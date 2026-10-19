import { Category, DraftCampaign, Campaign } from './index';
import { ThemeId } from '../theme/themes';

export type ReachieRole = 'user' | 'assistant' | 'system';

export type ReachieAudioState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface ReachieActionSuggestion {
  id: string;
  label: string;
  query: string;
  icon?: string;
}

export type ReachieActionType =
  | 'navigate'
  | 'update_draft'
  | 'submit_campaign'
  | 'switch_theme'
  | 'show_draft_summary'
  | 'answer_question'
  | 'inspect_draft'
  | 'clear_draft';

export interface ReachieActionExecution {
  id: string;
  type: ReachieActionType;
  targetRoute?: string;
  step?: number;
  themeId?: ThemeId;
  fieldUpdates?: Partial<DraftCampaign>;
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmed?: boolean;
  executed?: boolean;
  resultMessage?: string;
}

export interface ReachieMessage {
  id: string;
  role: ReachieRole;
  content: string;
  timestamp: string;
  audioUrl?: string;
  suggestedActions?: ReachieActionSuggestion[];
  action?: ReachieActionExecution;
  draftPreview?: Partial<DraftCampaign>;
  submittedCampaign?: Campaign;
}

export type CampaignCreationStage =
  | 'idle'
  | 'asking_title'
  | 'asking_category'
  | 'asking_summary'
  | 'asking_story'
  | 'asking_cover'
  | 'asking_budget'
  | 'asking_audience'
  | 'reviewing'
  | 'asking_goal';

export interface ReachieTaskContext {
  currentRoute: string;
  activeDraft: DraftCampaign | null;
  pendingAction: ReachieActionExecution | null;
  campaignCreationStage: CampaignCreationStage;
  stagedCampaignData: Partial<DraftCampaign>;
  activeField?: string;
  lastQuestion?: string;
}

export interface ReachieOrchestrationResult {
  reply: string;
  action?: ReachieActionExecution;
  draftPreview?: Partial<DraftCampaign>;
  suggestedActions?: ReachieActionSuggestion[];
  nextStage?: ReachieTaskContext['campaignCreationStage'];
  stagedData?: Partial<DraftCampaign>;
  activeField?: string;
  lastQuestion?: string;
}
