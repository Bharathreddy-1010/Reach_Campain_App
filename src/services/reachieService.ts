import {
  ReachieMessage,
  ReachieTaskContext,
  ReachieOrchestrationResult,
  ReachieActionExecution,
  CampaignCreationStage,
} from '../types/reachie';
import { CampaignRepository } from '../repositories/campaignRepository';
import { DraftCampaign, Category, CreationStep } from '../types';
import { CATEGORIES } from '../constants';
import { AIDraftingService } from './aiDraftingService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';
const GROQ_DEFAULT_API_KEY = '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';

export class ReachieService {
  /**
   * Check if external Groq AI key is configured
   */
  public static isGroqConfigured(): boolean {
    if (typeof process !== 'undefined' && process.env?.RUNNING_ACCEPTANCE_TESTS === 'true') {
      return false;
    }
    return Boolean(this.getGroqApiKey());
  }

  private static getGroqApiKey(): string {
    return (
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GROQ_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
      GROQ_DEFAULT_API_KEY
    );
  }

  /**
   * Main entry point to process a user message (spoken or typed)
   */
  public static async processUserMessage(
    userText: string,
    history: ReachieMessage[],
    context: ReachieTaskContext
  ): Promise<ReachieOrchestrationResult> {
    const cleanText = userText.trim();
    if (!cleanText) {
      return {
        reply: "I'm listening! You can ask me to navigate, start a campaign, or adjust your theme.",
      };
    }

    const lower = cleanText.toLowerCase();

    // 1. Resolve active stage from context OR dialogue history
    let activeStage = context.campaignCreationStage;
    if (this.isStartCampaignIntent(lower)) {
      activeStage = 'idle';
    } else if (!activeStage || activeStage === 'idle') {
      const lastAssistantMsg = [...(history || [])]
        .reverse()
        .find((m) => m.role === 'assistant')?.content?.toLowerCase() || '';

      if (
        lastAssistantMsg.includes('title of your campaign') ||
        lastAssistantMsg.includes("what's the title") ||
        lastAssistantMsg.includes('title or cause') ||
        lastAssistantMsg.includes('main title')
      ) {
        activeStage = 'asking_title';
      } else if (
        lastAssistantMsg.includes("what's the category") ||
        lastAssistantMsg.includes('which category fits') ||
        lastAssistantMsg.includes('valid category') ||
        lastAssistantMsg.includes('choose from: environment')
      ) {
        activeStage = 'asking_category';
      } else if (
        lastAssistantMsg.includes('short description') ||
        lastAssistantMsg.includes("what's a short description")
      ) {
        activeStage = 'asking_summary';
      } else if (
        lastAssistantMsg.includes('full campaign description') ||
        lastAssistantMsg.includes('full description')
      ) {
        activeStage = 'asking_story';
      } else if (
        lastAssistantMsg.includes('cover image') ||
        lastAssistantMsg.includes('recommended cover')
      ) {
        activeStage = 'asking_cover';
      } else if (
        lastAssistantMsg.includes('funding goal') ||
        lastAssistantMsg.includes("what's your funding goal")
      ) {
        activeStage = 'asking_budget';
      } else if (
        lastAssistantMsg.includes('target audience') ||
        lastAssistantMsg.includes('who is your target audience')
      ) {
        activeStage = 'asking_audience';
      } else if (
        lastAssistantMsg.includes('ready to submit') ||
        lastAssistantMsg.includes('submit for review')
      ) {
        activeStage = 'reviewing';
      }
    }

    const effectiveContext: ReachieTaskContext = {
      ...context,
      campaignCreationStage: activeStage && activeStage !== 'idle' ? activeStage : context.campaignCreationStage,
    };

    // 2. Call Groq AI LLM first if configured:
    // Leverages Groq qwen/qwen3.8-27b to understand intent, generate copy, extract clean fields, and execute actions
    if (this.isGroqConfigured()) {
      try {
        const groqResult = await this.callGroqAPI(cleanText, history, effectiveContext);
        if (groqResult) {
          return groqResult;
        }
      } catch (err) {
        console.warn('Groq orchestrator call failed, falling back to local controller:', err);
      }
    }

    // 3. Fallback: Local deterministic controller (for offline resilience and instant acceptance tests)
    if (
      (effectiveContext.campaignCreationStage && effectiveContext.campaignCreationStage !== 'idle') ||
      this.isStartCampaignIntent(lower)
    ) {
      return this.handleConversationalCampaignCreation(cleanText, effectiveContext);
    }

    // 4. Local orchestrator for other intents (theme, navigation, Q&A)
    return this.processLocally(cleanText, history, effectiveContext);
  }

  /**
   * Local Intent & Dialogue Orchestrator
   * Guaranteed short, human responses and immediate application actions
   */
  public static async processLocally(
    text: string,
    history: ReachieMessage[],
    context: ReachieTaskContext
  ): Promise<ReachieOrchestrationResult> {
    const lower = text.toLowerCase();

    // 1. Theme Switching Commands
    if (
      lower.includes('theme') ||
      lower.includes('chocolate') ||
      lower.includes('cocoa') ||
      lower.includes('clay') ||
      lower.includes('mocha') ||
      lower.includes('warm') ||
      lower.includes('velvet') ||
      lower.includes('violet') ||
      lower.includes('frosted') ||
      lower.includes('glass') ||
      lower.includes('editorial')
    ) {
      if (
        lower.includes('chocolate') ||
        lower.includes('cocoa') ||
        lower.includes('clay') ||
        lower.includes('warm') ||
        lower.includes('mocha') ||
        lower.includes('velvet') ||
        lower.includes('violet') ||
        lower.includes('second design') ||
        lower.includes('2nd design')
      ) {
        return {
          reply: 'Switched to Dark Chocolate.',
          action: {
            id: `act_${Date.now()}`,
            type: 'switch_theme',
            themeId: 'aurora',
            resultMessage: 'Theme changed to Dark Chocolate',
          },
        };
      }
      if (
        lower.includes('frosted') ||
        lower.includes('glass') ||
        lower.includes('third design') ||
        lower.includes('3rd design')
      ) {
        return {
          reply: 'Switched to Frosted Glass.',
          action: {
            id: `act_${Date.now()}`,
            type: 'switch_theme',
            themeId: 'glassmorphism',
            resultMessage: 'Theme changed to Frosted Glass',
          },
        };
      }
      if (
        lower.includes('editorial') ||
        lower.includes('classic') ||
        lower.includes('first design') ||
        lower.includes('1st design') ||
        lower.includes('default')
      ) {
        return {
          reply: 'Switched to Classic Editorial.',
          action: {
            id: `act_${Date.now()}`,
            type: 'switch_theme',
            themeId: 'editorial',
            resultMessage: 'Theme changed to Classic Editorial',
          },
        };
      }
    }

    // 2. Direct Navigation Commands
    if (
      lower.includes('go to') ||
      lower.includes('take me to') ||
      lower.includes('navigate to') ||
      lower.includes('open') ||
      lower.includes('show') ||
      lower.startsWith('goto ')
    ) {
      // Steps in Campaign Creator
      if (lower.includes('budget') || lower.includes('step 4') || lower.includes('reach step')) {
        return {
          reply: 'Navigating to Step 4: Budget and Reach.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 4,
            resultMessage: 'Navigated to Reach Step',
          },
        };
      }
      if (lower.includes('story') || lower.includes('step 2')) {
        return {
          reply: 'Navigating to Step 2: Story and Evidence.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 2,
            resultMessage: 'Navigated to Story Step',
          },
        };
      }
      if (lower.includes('visual') || lower.includes('ad view') || lower.includes('step 3')) {
        return {
          reply: 'Navigating to Step 3: Visuals and Creative.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 3,
            resultMessage: 'Navigated to Visuals Step',
          },
        };
      }
      if (lower.includes('submit step') || lower.includes('review step') || lower.includes('step 5')) {
        return {
          reply: 'Navigating to Step 5: Review and Submit.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 5,
            resultMessage: 'Navigated to Submit Step',
          },
        };
      }
      if (lower.includes('step 1') || lower.includes('basic')) {
        return {
          reply: 'Navigating to Step 1: Campaign Basics.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 1,
            resultMessage: 'Navigated to Basics Step',
          },
        };
      }

      // Screens
      if (lower.includes('profile') || lower.includes('my account')) {
        return {
          reply: 'Taking you to your Profile.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/profile',
            resultMessage: 'Navigated to Profile',
          },
        };
      }
      if (lower.includes('creator') || lower.includes('my campaigns') || lower.includes('dashboard')) {
        return {
          reply: 'Opening your Creator Dashboard.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/creator',
            resultMessage: 'Navigated to Creator Dashboard',
          },
        };
      }
      if (lower.includes('explore') || lower.includes('browse') || lower.includes('search campaigns')) {
        return {
          reply: 'Taking you to Explore.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/explore',
            resultMessage: 'Navigated to Explore',
          },
        };
      }
      if (lower.includes('activity') || lower.includes('notifications') || lower.includes('updates')) {
        return {
          reply: 'Opening your Activity feed.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/activity',
            resultMessage: 'Navigated to Activity',
          },
        };
      }
      if (lower.includes('create') || lower.includes('builder') || lower.includes('new campaign')) {
        return {
          reply: 'Opening the Campaign Creator.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/create',
            step: 1,
            resultMessage: 'Navigated to Create',
          },
        };
      }
      if (lower.includes('home') || lower.includes('feed')) {
        return {
          reply: 'Taking you to the Home feed.',
          action: {
            id: `act_${Date.now()}`,
            type: 'navigate',
            targetRoute: '/',
            resultMessage: 'Navigated to Home',
          },
        };
      }
    }

    // 3. Draft Field Revisions & Updates
    if (
      lower.startsWith('change ') ||
      lower.startsWith('update ') ||
      lower.startsWith('make ') ||
      lower.startsWith('set ') ||
      lower.includes('shorter') ||
      lower.includes('longer') ||
      lower.includes('more professional') ||
      lower.includes('increase budget') ||
      lower.includes('decrease budget')
    ) {
      const activeDraft = context.activeDraft || (await CampaignRepository.getDraft());
      const staged = { ...context.stagedCampaignData, ...(activeDraft || {}) };

      // Revision: Budget / Goal
      const budgetMatch = text.match(/(?:budget|goal|amount|to)\s*(?:of|is|to)?\s*(?:₹|inr|rs\.?)?\s*([\d,]+(?:\s*(?:k|thousand|lakh))?)/i);
      if (budgetMatch && (lower.includes('budget') || lower.includes('goal') || lower.includes('₹') || lower.includes('inr'))) {
        let valStr = budgetMatch[1].replace(/,/g, '').toLowerCase().trim();
        let numVal = parseInt(valStr, 10);
        if (valStr.includes('k')) numVal = parseInt(valStr, 10) * 1000;
        if (valStr.includes('lakh')) numVal = parseInt(valStr, 10) * 100000;

        if (!isNaN(numVal) && numVal > 0) {
          const updatedDraft: Partial<DraftCampaign> = {
            fundingGoal: numVal,
          };
          await this.persistDraftUpdates(updatedDraft);

          return {
            reply: `Goal updated to ₹${numVal.toLocaleString('en-IN')}.`,
            draftPreview: { ...staged, fundingGoal: numVal },
            action: {
              id: `act_${Date.now()}`,
              type: 'update_draft',
              fieldUpdates: updatedDraft,
              resultMessage: `Goal updated to ₹${numVal.toLocaleString('en-IN')}`,
            },
          };
        }
      }

      // Revision: Target Audience
      if (lower.includes('audience') || lower.includes('target')) {
        const audText = text.replace(/.*(?:audience|target)\s*(?:to|is)?\s*/i, '').trim();
        if (audText.length > 2) {
          const updatedDraft: Partial<DraftCampaign> = {
            intendedAudience: audText,
            targetAudienceDesc: audText,
          };
          await this.persistDraftUpdates(updatedDraft);

          return {
            reply: `Target audience updated to ${audText}.`,
            draftPreview: { ...staged, intendedAudience: audText },
            action: {
              id: `act_${Date.now()}`,
              type: 'update_draft',
              fieldUpdates: updatedDraft,
              resultMessage: `Audience updated to "${audText}"`,
            },
          };
        }
      }

      // Revision: Call to Action
      if (lower.includes('call to action') || lower.includes('cta') || lower.includes('button text')) {
        const ctaText = text.replace(/.*(?:call to action|cta|button)\s*(?:to|is)?\s*/i, '').replace(/["']/g, '').trim();
        if (ctaText.length > 1) {
          const updatedDraft: Partial<DraftCampaign> = {
            callToAction: ctaText,
          };
          await this.persistDraftUpdates(updatedDraft);

          return {
            reply: `Call to action set to "${ctaText}".`,
            draftPreview: { ...staged, callToAction: ctaText },
            action: {
              id: `act_${Date.now()}`,
              type: 'update_draft',
              fieldUpdates: updatedDraft,
              resultMessage: `Call to action set to "${ctaText}"`,
            },
          };
        }
      }

      // Revision: Headline / Title
      if (lower.includes('title') || lower.includes('headline') || lower.includes('name')) {
        const titleText = text.replace(/.*(?:title|headline|name)\s*(?:to|is)?\s*/i, '').replace(/["']/g, '').trim().slice(0, 60);
        if (titleText.length > 2) {
          const updatedDraft: Partial<DraftCampaign> = {
            title: titleText,
            headline: titleText,
            adHeadline: titleText,
          };
          await this.persistDraftUpdates(updatedDraft);

          return {
            reply: `Title updated to "${titleText}".`,
            draftPreview: { ...staged, title: titleText },
            action: {
              id: `act_${Date.now()}`,
              type: 'update_draft',
              fieldUpdates: updatedDraft,
              resultMessage: `Title updated to "${titleText}"`,
            },
          };
        }
      }

      // Revision: Summary / Description length or tone
      if (lower.includes('shorter') || lower.includes('brief') || lower.includes('concise')) {
        const currentSumm = staged.summary || staged.whatItIsAbout || 'Empowering communities through verified public message amplification.';
        const shorter = currentSumm.split('.')[0] + '.';
        const updatedDraft: Partial<DraftCampaign> = {
          summary: shorter,
          adDescription: shorter,
        };
        await this.persistDraftUpdates(updatedDraft);

        return {
          reply: 'Made your description shorter and punchier.',
          draftPreview: { ...staged, summary: shorter },
          action: {
            id: `act_${Date.now()}`,
            type: 'update_draft',
            fieldUpdates: updatedDraft,
            resultMessage: 'Description made concise',
          },
        };
      }

      if (lower.includes('professional') || lower.includes('formal tone')) {
        const currentSumm = staged.summary || staged.whatItIsAbout || 'Community public awareness campaign.';
        const professional = `A documented public-interest initiative broadcasting verified empirical findings: ${currentSumm}`;
        const updatedDraft: Partial<DraftCampaign> = {
          summary: professional.slice(0, 200),
          adDescription: professional.slice(0, 200),
        };
        await this.persistDraftUpdates(updatedDraft);

        return {
          reply: 'Elevated your description to a professional tone.',
          draftPreview: { ...staged, summary: professional.slice(0, 200) },
          action: {
            id: `act_${Date.now()}`,
            type: 'update_draft',
            fieldUpdates: updatedDraft,
            resultMessage: 'Applied professional tone',
          },
        };
      }
    }

    // 4. Consequential Action: Submit Campaign
    if (
      (lower.includes('submit') && (lower.includes('campaign') || lower.includes('review'))) ||
      lower.includes('you can submit') ||
      lower.includes('please submit') ||
      lower.includes('submit now') ||
      lower.includes('submit draft') ||
      lower.includes('publish') ||
      lower.includes('finalize') ||
      lower.startsWith('submit') ||
      lower.endsWith('submit') ||
      lower === 'submit'
    ) {
      const activeDraft = (await CampaignRepository.getDraft()) || (context.stagedCampaignData as DraftCampaign);

      if (!activeDraft || !activeDraft.title) {
        return {
          reply: "You don't have a draft ready yet. Say 'Create a campaign' to get started.",
          suggestedActions: [
            { id: 'act_create', label: 'Create Campaign', query: 'Create a new campaign' },
          ],
        };
      }

      return {
        reply: `Ready to submit "${activeDraft.title}" for editorial review. Please confirm below.`,
        action: {
          id: `submit_${Date.now()}`,
          type: 'submit_campaign',
          requiresConfirmation: true,
          confirmationTitle: 'Submit Campaign for Review',
          confirmationMessage: `Are you ready to submit "${activeDraft.title}" to editorial reviewers?`,
        },
      };
    }

    // 5. Campaign Creation Conversational Flow (Multi-Turn)
    if (
      context.campaignCreationStage !== 'idle' ||
      lower.includes('create a campaign') ||
      lower.includes('create campaign') ||
      lower.includes('new campaign') ||
      lower.includes('start a campaign') ||
      lower.includes('launch a campaign') ||
      lower.includes('make a campaign') ||
      lower.includes('build a campaign')
    ) {
      return this.handleConversationalCampaignCreation(text, context);
    }

    // 6. Inspecting Current Draft Status
    if (
      lower.includes('missing') ||
      lower.includes('draft status') ||
      lower.includes('check my draft') ||
      lower.includes('what details are missing') ||
      lower.includes('what is missing')
    ) {
      const draft = await CampaignRepository.getDraft();
      if (!draft || !draft.title) {
        return {
          reply: "You don't have an active draft right now. Say 'Create a new campaign' to start one.",
          suggestedActions: [
            { id: 'start_camp', label: 'Create Campaign', query: 'Create a new campaign' },
          ],
        };
      }

      const missing: string[] = [];
      if (!draft.title) missing.push('Title');
      if (!draft.summary) missing.push('Summary');
      if (!draft.whatItIsAbout || draft.whatItIsAbout.length < 30) missing.push('Story Background');
      if (!draft.fundingGoal || draft.fundingGoal < 1000) missing.push('Funding Goal');

      if (missing.length === 0) {
        return {
          reply: `Your draft "${draft.title}" has all core information filled and is ready for review.`,
          draftPreview: draft,
          suggestedActions: [
            { id: 'sub_now', label: 'Submit Campaign', query: 'Submit my campaign' },
            { id: 'go_step5', label: 'Review in Form', query: 'Take me to step 5' },
          ],
        };
      } else {
        return {
          reply: `Your draft is missing: ${missing.join(', ')}. Would you like me to fill them in?`,
          draftPreview: draft,
          suggestedActions: [
            { id: 'fix_form', label: 'Open Campaign Form', query: 'Open the campaign creation page' },
          ],
        };
      }
    }

    // 7. Q&A about Application Features & Data (Short & Human)
    // Q: Recent Campaigns / What campaigns are active?
    if (
      lower.includes('recent campaign') ||
      lower.includes('active campaign') ||
      lower.includes('show campaigns') ||
      lower.includes('what campaigns') ||
      lower.includes('browse campaigns')
    ) {
      const campaigns = await CampaignRepository.getAllCampaigns();
      const topCount = campaigns.length;
      return {
        reply: `There are ${topCount} verified public interest campaigns on Reach. Taking you to Explore.`,
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/explore',
          resultMessage: 'Navigated to Explore',
        },
      };
    }

    // Q: 85/10/5 Fund Breakdown
    if (
      lower.includes('85') ||
      lower.includes('allocation') ||
      lower.includes('fee') ||
      lower.includes('how are funds split') ||
      lower.includes('fund distribution') ||
      (lower.includes('fund') && (lower.includes('distribut') || lower.includes('split') || lower.includes('allocat') || lower.includes('breakdown') || lower.includes('use') || lower.includes('spent')))
    ) {
      return {
        reply: 'Reach operates on an 85/10/5 model: 85% goes to direct ad spend, 10% for editorial review and verification, and 5% covers payment gateway fees.',
        suggestedActions: [
          { id: 'how_calc', label: 'How is reach estimated?', query: 'How is reach calculated?' },
        ],
      };
    }

    // Q: Reach Calculation
    if (lower.includes('how is reach') || lower.includes('estimated reach') || lower.includes('impressions') || lower.includes('views')) {
      return {
        reply: 'Every ₹100 funds about 1,000 estimated views on social media, reaching roughly 750 unique individuals.',
        suggestedActions: [
          { id: 'ask_trust', label: 'What is Trust Score?', query: 'What is Trust Score?' },
        ],
      };
    }

    // Q: Trust Score
    if (lower.includes('trust score') || lower.includes('score') || lower.includes('review process')) {
      return {
        reply: 'The Trust Score is an editorial rating out of 10 checking evidence accuracy, creator identity, and ad compliance before publication.',
      };
    }

    // Q: How do I create a campaign?
    if (lower.includes('how do i create') || lower.includes('how to create') || lower.includes('how to start')) {
      return {
        reply: "Say 'Start a campaign' or tap the plus tab below, and I'll guide you through your goal, audience, and budget.",
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/create',
          step: 1,
          resultMessage: 'Navigated to Campaign Builder',
        },
      };
    }

    // Q: How do I donate / back a campaign?
    if (lower.includes('how do i donate') || lower.includes('how to donate') || lower.includes('how to back') || lower.includes('how do i back') || lower.includes('how to contribute')) {
      return {
        reply: 'Open any campaign on Explore and tap Back This Initiative to contribute with UPI or card.',
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/explore',
          resultMessage: 'Navigated to Explore',
        },
      };
    }

    // Q: What is Reach?
    if (lower.includes('what is reach') || lower.includes('about reach') || lower.includes('what does this app do')) {
      return {
        reply: 'Reach is a civic platform where communities pool funds to broadcast verified public interest messages on social media.',
      };
    }

    // Q: Greetings & General Help
    if (lower.includes('hello') || lower.includes('hi reachie') || lower.startsWith('hi') || lower.startsWith('hey')) {
      return {
        reply: "Hi! How can I help you today? You can ask me to navigate, start a campaign, or adjust your theme.",
        suggestedActions: [
          { id: 'q_create', label: 'Create a Campaign', query: 'Create a new campaign' },
          { id: 'q_explore', label: 'Explore Campaigns', query: 'Explore campaigns' },
          { id: 'q_theme', label: 'Dark Chocolate Theme', query: 'Switch theme to Dark Chocolate' },
        ],
      };
    }

    // Fallback: short, human, conversational
    return {
      reply: "I can help you create campaigns, navigate the app, update fields, or switch themes. What would you like to do?",
      suggestedActions: [
        { id: 'q_create', label: 'Create a Campaign', query: 'Create a new campaign' },
        { id: 'q_explore', label: 'Explore Campaigns', query: 'Explore campaigns' },
        { id: 'q_funds', label: '85/10/5 Split', query: 'How are funds distributed?' },
      ],
    };
  }

  /**
   * Helper: checks if user is asking to start campaign creation
   */
  public static isStartCampaignIntent(lower: string): boolean {
    const text = lower.toLowerCase().replace(/['’]/g, '').trim();
    return (
      text.includes('create a campaign') ||
      text.includes('create campaign') ||
      text.includes('lets create') ||
      text.includes('start a campaign') ||
      text.includes('start campaign') ||
      text.includes('launch a campaign') ||
      text.includes('make a campaign') ||
      text.includes('build a campaign') ||
      text.includes('new campaign') ||
      text.includes('create one') ||
      text.includes('help me create') ||
      text === 'create' ||
      text === 'start'
    );
  }

  /**
   * Extract conversational title values (e.g. "so the title is Education" -> "Education")
   */
  public static cleanExtractedTitle(raw: string): string {
    if (!raw) return '';
    let clean = raw.trim();

    // 1. Remove introductory conversational clauses with optional punctuation
    clean = clean.replace(
      /^(?:show|display|set|keep|make|write|enter|put)?\s*(?:can\s+you\s+|please\s+|could\s+you\s+|you\s+can\s+|i\s+say\s+|i\s+would\s+say\s+)?(?:so\s*[,:]?\s*)?(?:the\s+)?(?:campaign\s+)?(?:title|name|headline)(?:\s+(?:of|for)\s+(?:the|this|my)?\s*campaign)?\s*[,:]?\s*(?:is|should\s+be|would\s+be|to|as|:)?\s*[,:]?\s*/i,
      ''
    );
    clean = clean.replace(
      /^(?:show\s+|display\s+)?(?:so\s*[,:]?\s*)?(?:let's\s+)?(?:call\s+it|name\s+it|make\s+it|keep\s+it|set\s+it\s+as|keep\s+the\s+title\s+as|set\s+the\s+title\s+to|make\s+the\s+title)\s*[,:]?\s*/i,
      ''
    );
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:it's|it\s+is|its)\s+(?:called\s+)?/i, '');
    clean = clean.replace(
      /^(?:i\s+want\s+to\s+name\s+it|i\s+want\s+the\s+title\s+to\s+be|my\s+campaign\s+is(?:\s+called)?)\s*/i,
      ''
    );
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:the\s+)?(?:campaign\s+is\s+called|campaign\s+is)\s*/i, '');
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:of\s+(?:the|this|my)\s+campaign\s+(?:is\s+)?)/i, '');
    clean = clean.replace(/^(?:show|so)\s*[,:]?\s*/i, '');

    // 2. Strip quotes
    clean = clean.replace(/^["'`]+|["'`]+$/g, '').trim();

    // 3. Capitalize first letter
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    return clean.slice(0, 60);
  }

  /**
   * Intelligently generates a context-relevant 1-2 sentence short description
   * derived directly from the campaign's title and category.
   */
  public static generateContextualSummary(title: string, category?: string): string {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();

    // 1. Water / Sanitation / Aquifer / Rivers / Lakes / Drinking Water (Highest priority for water topics)
    if (
      t.includes('water') ||
      t.includes('river') ||
      t.includes('lake') ||
      t.includes('pond') ||
      t.includes('aquifer') ||
      t.includes('sanitat') ||
      t.includes('borewell') ||
      t.includes('fluoride') ||
      t.includes('drink') ||
      t.includes('clean water')
    ) {
      return 'Installing clean solar-powered water filtration units and regular safety testing to secure safe drinking water for every household.';
    }

    // 2. Green Environment / Trees / Forests / Heatwaves / Climate
    if (
      t.includes('tree') ||
      t.includes('forest') ||
      t.includes('canopy') ||
      t.includes('heat') ||
      t.includes('green') ||
      t.includes('plant') ||
      t.includes('climat') ||
      t.includes('solar') ||
      t.includes('pollution') ||
      t.includes('clean air')
    ) {
      return 'Planting native shade trees and expanding urban green canopies to mitigate summer heatwaves and purify air quality.';
    }

    // 3. Cyber Safety / Anti-Scam / Senior Protection / Digital Fraud
    if (
      t.includes('scam') ||
      t.includes('cyber') ||
      t.includes('fraud') ||
      t.includes('senior') ||
      t.includes('elder') ||
      t.includes('arrest') ||
      t.includes('phish') ||
      t.includes('safe')
    ) {
      return 'Educating seniors and families on how to detect and immediately halt cyber frauds, digital arrest scams, and phishing threats.';
    }

    // 4. Animal Welfare / Pets / Stray Dogs / Rescue
    if (
      t.includes('animal') ||
      t.includes('dog') ||
      t.includes('cat') ||
      t.includes('pet') ||
      t.includes('stray') ||
      t.includes('shelter') ||
      t.includes('rescue') ||
      t.includes('wildlife')
    ) {
      return 'Rescuing abandoned street animals, providing emergency veterinary care, and creating community feeding and foster networks.';
    }

    // 5. Local Retail / Small Business / Kirana / Fair Trade
    if (
      t.includes('retail') ||
      t.includes('kirana') ||
      t.includes('shop') ||
      t.includes('store') ||
      t.includes('market') ||
      t.includes('farmer') ||
      t.includes('trade')
    ) {
      return 'Advocating for fair market transparency and safeguarding neighborhood family-owned retail stores against predatory trade practices.';
    }

    // 6. Education / Schools / Students / Learning / Books / Digital Classrooms
    if (
      t.includes('educat') ||
      t.includes('school') ||
      t.includes('student') ||
      t.includes('learn') ||
      t.includes('teach') ||
      t.includes('literac') ||
      t.includes('class') ||
      t.includes('book') ||
      t.includes('librar')
    ) {
      return 'Equipping underprivileged rural schools with digital learning labs, e-libraries, and essential classroom tools.';
    }

    // 7. Health / Medical / Clinics / Hospitals / Mental Health (when not water)
    if (
      t.includes('health') ||
      t.includes('clinic') ||
      t.includes('medic') ||
      t.includes('hospit') ||
      t.includes('disease') ||
      t.includes('mental') ||
      t.includes('doctor')
    ) {
      return 'Expanding mobile primary health clinics and access to essential diagnostics and medicines in remote rural villages.';
    }

    // 8. Fallback to Category if title had generic words
    if (c === 'education') {
      return 'Equipping underprivileged rural schools with digital learning labs, e-libraries, and essential classroom tools.';
    }
    if (c === 'health') {
      return 'Expanding mobile primary health clinics and access to essential diagnostics and medicines in remote rural villages.';
    }
    if (c === 'environment') {
      return 'Mobilizing verified environmental protection, sustainable conservation, and community greening programs.';
    }
    if (c === 'community') {
      return `Empowering community awareness and grassroots collective action for ${title || 'this initiative'}.`;
    }
    if (c === 'public policy' || c === 'economic policy') {
      return `Broadcasting verified policy research, independent economic data, and civic awareness for ${title || 'this initiative'}.`;
    }
    if (c === 'arts & culture') {
      return 'Preserving indigenous artistic heritage, local cultural archives, and grassroots artisan livelihoods.';
    }
    if (c === 'science') {
      return 'Supporting open-access citizen science, scientific literacy, and community-driven empirical research.';
    }

    return `Empowering public awareness, transparent civic action, and direct grassroots impact for ${title || 'this initiative'}.`;
  }

  /**
   * Intelligently generates a context-relevant 2-3 sentence full campaign story
   * derived directly from the campaign's title and category.
   */
  public static generateContextualStory(title: string, category?: string): string {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();

    // 1. Water / Sanitation / Aquifer / Rivers / Lakes
    if (
      t.includes('water') ||
      t.includes('river') ||
      t.includes('lake') ||
      t.includes('pond') ||
      t.includes('aquifer') ||
      t.includes('sanitat') ||
      t.includes('borewell') ||
      t.includes('fluoride') ||
      t.includes('drink') ||
      t.includes('clean water')
    ) {
      return 'Unsafe drinking water and industrial runoff threaten the health of local families and vulnerable children across our district. Our campaign funds certified water testing kits, solar-powered filtration kiosks, and community maintenance teams. With verified water quality audits, we ensure transparent, lasting access to pure water.';
    }

    // 2. Green Environment / Trees / Forests / Heatwaves / Climate
    if (
      t.includes('tree') ||
      t.includes('forest') ||
      t.includes('canopy') ||
      t.includes('heat') ||
      t.includes('green') ||
      t.includes('plant') ||
      t.includes('climat') ||
      t.includes('solar') ||
      t.includes('pollution') ||
      t.includes('clean air')
    ) {
      return 'Rapid urban expansion and loss of greenery have caused local summer temperatures to surge to dangerous extremes, trapping heat in asphalt and concrete. We are planting drought-resilient native trees and setting up drip-irrigation networks managed by community volunteers. This initiative creates natural cooling corridors and restores neighborhood biodiversity.';
    }

    // 3. Cyber Safety / Anti-Scam / Senior Protection / Digital Fraud
    if (
      t.includes('scam') ||
      t.includes('cyber') ||
      t.includes('fraud') ||
      t.includes('senior') ||
      t.includes('elder') ||
      t.includes('arrest') ||
      t.includes('phish') ||
      t.includes('safe')
    ) {
      return 'Cybercriminals increasingly target elderly citizens through sophisticated intimidation tactics, fake utility disconnections, and impersonation fraud. Our campaign distributes vernacular physical fraud-prevention handbooks and conducts hands-on workshops in residential colonies. We empower families with verified defense steps and 24/7 incident helpline access.';
    }

    // 4. Animal Welfare / Pets / Stray Dogs / Rescue
    if (
      t.includes('animal') ||
      t.includes('dog') ||
      t.includes('cat') ||
      t.includes('pet') ||
      t.includes('stray') ||
      t.includes('shelter') ||
      t.includes('rescue') ||
      t.includes('wildlife')
    ) {
      return 'Injured and stray animals often suffer without basic medical attention, food, or shelter in bustling urban areas. We are setting up emergency treatment facilities, mobile sterilization units, and a dedicated network of community caretakers. Our goal is a compassionate, vaccinated, and well-cared-for animal population in every neighborhood.';
    }

    // 5. Local Retail / Small Business / Kirana / Fair Trade
    if (
      t.includes('retail') ||
      t.includes('kirana') ||
      t.includes('shop') ||
      t.includes('store') ||
      t.includes('market') ||
      t.includes('farmer') ||
      t.includes('trade')
    ) {
      return 'Neighborhood family-owned businesses are facing unprecedented pressure from monopolistic delivery algorithms and below-cost price dumping. This initiative provides local shopkeepers with shared digital storefronts, supply chain bargaining power, and legal advocacy. We protect community livelihood and maintain vibrant local commerce.';
    }

    // 6. Education / Schools / Students / Learning / Books
    if (
      t.includes('educat') ||
      t.includes('school') ||
      t.includes('student') ||
      t.includes('learn') ||
      t.includes('teach') ||
      t.includes('literac') ||
      t.includes('class') ||
      t.includes('book') ||
      t.includes('librar')
    ) {
      return 'Over 60% of rural schools lack reliable digital infrastructure and modern science resources. This campaign directly funds solar-powered computer stations, interactive educational software, and teacher training to ensure equal learning opportunities for every student.';
    }

    // 7. Health / Medical / Clinics / Hospitals / Mental Health (when not water)
    if (
      t.includes('health') ||
      t.includes('clinic') ||
      t.includes('medic') ||
      t.includes('hospit') ||
      t.includes('disease') ||
      t.includes('mental') ||
      t.includes('doctor')
    ) {
      return 'Rural primary care centers frequently face acute shortages of diagnostic equipment and life-saving medicines. This initiative deploys fully-equipped mobile healthcare vans and trained paramedics to bring regular checkups and emergency care directly to underserved villages.';
    }

    // 8. Fallback to Category
    if (c === 'education') {
      return 'Over 60% of rural schools lack reliable digital infrastructure and modern science resources. This campaign directly funds solar-powered computer stations, interactive educational software, and teacher training to ensure equal learning opportunities for every student.';
    }
    if (c === 'health') {
      return 'Rural primary care centers frequently face acute shortages of diagnostic equipment and life-saving medicines. This initiative deploys fully-equipped mobile healthcare vans and trained paramedics to bring regular checkups and emergency care directly to underserved villages.';
    }
    if (c === 'environment') {
      return 'Vulnerable ecosystems face rapid degradation from pollution and unsustainable resource exploitation. This initiative unites local volunteers, scientific monitors, and community leaders to restore natural habitats with transparent monitoring.';
    }
    if (c === 'community') {
      return `Local neighborhoods thrive when residents unite to address urgent civic challenges with transparent community oversight. This campaign organizes on-the-ground volunteer networks, essential resources, and verified milestone reporting for ${title || 'this initiative'}.`;
    }
    if (c === 'public policy' || c === 'economic policy') {
      return `Citizens often lack transparent access to independent data on critical policy and economic decisions affecting their livelihoods. Our campaign publishes peer-reviewed research, public fact sheets, and grassroots forums to drive accountable governance.`;
    }

    return `Across communities, verified documentation and organized citizen action remain essential to drive meaningful change. This campaign funds targeted digital distribution of peer-reviewed evidence and alerts to support ${title || 'this initiative'}.`;
  }

  /**
   * Extract conversational short descriptions
   */
  public static cleanExtractedSummary(raw: string): string {
    if (!raw) return '';
    let clean = raw.trim();

    clean = clean.replace(
      /^(?:show|display|set|keep|make|write|enter|put|fill)?\s*(?:can\s+you\s+|please\s+|could\s+you\s+|you\s+can\s+|i\s+say\s+|i\s+would\s+say\s+)?(?:so\s*[,:]?\s*)?(?:the\s+)?(?:short\s+)?(?:description|summary)(?:\s+(?:of|for)\s+(?:the|this|my)?\s*campaign)?\s*[,:]?\s*(?:is|should\s+be|would\s+be|to|as|:)?\s*[,:]?\s*/i,
      ''
    );
    clean = clean.replace(
      /^(?:fill|keep|make|write|set)?\s*(?:as\s+)?according\s+to\s+(?:the\s+)?(?:title|name|topic|cause|category|education|health|environment)?\s*/i,
      ''
    );
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:of\s+(?:the|this|my)\s+campaign\s+(?:is\s+)?)/i, '');
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:it's\s+about|it\s+is\s+about|about)\s+/i, '');
    clean = clean.replace(/^(?:show|so)\s*[,:]?\s*/i, '');
    clean = clean.replace(/^["'`]+|["'`]+$/g, '').trim();

    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean.slice(0, 150);
  }

  /**
   * Extract conversational full stories
   */
  public static cleanExtractedStory(raw: string): string {
    if (!raw) return '';
    let clean = raw.trim();

    clean = clean.replace(
      /^(?:show|display|set|keep|make|write|enter|put|fill)?\s*(?:can\s+you\s+|please\s+|could\s+you\s+|you\s+can\s+|i\s+say\s+|i\s+would\s+say\s+)?(?:so\s*[,:]?\s*)?(?:the\s+)?(?:full\s+)?(?:campaign\s+)?(?:description|story|details?)(?:\s+(?:of|for)\s+(?:the|this|my)?\s*campaign)?\s*[,:]?\s*(?:is|should\s+be|would\s+be|to|as|:)?\s*[,:]?\s*/i,
      ''
    );
    clean = clean.replace(
      /^(?:fill|keep|make|write|set)?\s*(?:as\s+)?according\s+to\s+(?:the\s+)?(?:title|name|topic|cause|category|description|summary|education|health|environment)?\s*/i,
      ''
    );
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:of\s+(?:the|this|my)\s+campaign\s+(?:is\s+)?)/i, '');
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:it's\s+about|it\s+is\s+about|about)\s+/i, '');
    clean = clean.replace(/^(?:show|so)\s*[,:]?\s*/i, '');
    clean = clean.replace(/^["'`]+|["'`]+$/g, '').trim();

    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }

  /**
   * Extract conversational target audience descriptions
   */
  public static cleanExtractedAudience(raw: string): string {
    if (!raw) return '';
    let clean = raw.trim();

    clean = clean.replace(
      /^(?:can\s+you\s+|please\s+|could\s+you\s+|you\s+can\s+|i\s+say\s+|i\s+would\s+say\s+)?(?:so\s*[,:]?\s*)?(?:the\s+)?(?:target\s+)?(?:audience|users|backers|people|group)\s*[,:]?\s*(?:is|are|should\s+be|would\s+be|to|as|:)?\s*[,:]?\s*/i,
      ''
    );
    clean = clean.replace(/^(?:so\s*[,:]?\s*)?(?:it's\s+for|it\s+is\s+for|for)\s+/i, '');
    clean = clean.replace(/^so\s*[,:]?\s*/i, '');
    clean = clean.replace(/^["'`]+|["'`]+$/g, '').trim();

    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }

  /**
   * Parse numerical budget amounts from voice/text (e.g. "50k", "50 thousand", "1 lakh", "₹25,000")
   */
  public static parseBudgetNumber(raw: string): number {
    if (!raw) return 25000;
    const lower = raw.toLowerCase().trim();

    // Check for "lakh" e.g. "1 lakh", "2.5 lakh"
    const lakhMatch = lower.match(/([\d.]+)\s*lakh/);
    if (lakhMatch) {
      const n = parseFloat(lakhMatch[1]);
      if (!isNaN(n) && n > 0) return Math.round(n * 100000);
    }

    // Check for "k" or "thousand" e.g. "50k", "50 thousand", "20k"
    const kMatch = lower.match(/([\d.]+)\s*(?:k|thousand)/);
    if (kMatch) {
      const n = parseFloat(kMatch[1]);
      if (!isNaN(n) && n > 0) return Math.round(n * 1000);
    }

    // Numbers with commas or currency symbols e.g. "50,000", "50000", "₹30,000"
    const numMatch = lower.match(/[\d,]+/);
    if (numMatch) {
      const cleanNum = parseInt(numMatch[0].replace(/,/g, ''), 10);
      if (!isNaN(cleanNum) && cleanNum > 0) return cleanNum;
    }

    return 25000;
  }

  /**
   * Helper: checks if user is asking AI to pick, generate, or keep something
   * Robust against variations & speech typos like "keep whaterve you need", "you choose", "up to you"
   */
  public static isAutoFillOrKeep(lower: string): boolean {
    const text = lower.trim();

    // Direct single words / affirmative responses
    if (
      text === 'keep' ||
      text === 'fill' ||
      text === 'yes' ||
      text === 'ok' ||
      text === 'okay' ||
      text === 'sure' ||
      text === 'fine' ||
      text === 'default' ||
      text === 'recommended' ||
      text === 'recommend' ||
      text === 'continue' ||
      text === 'next' ||
      text === 'proceed' ||
      text === 'skip' ||
      text === 'auto' ||
      text === 'autofill'
    ) {
      return true;
    }

    // Match variations of "whatever" including common speech/typing typos (whaterve, whatevr, what ever, watever)
    const hasWhatever = /whate?r?ve?r?|what\s+ever/i.test(text);

    // Phrases with "keep": e.g. "keep whatever you need", "keep whaterve you need", "keep what you need", "keep recommended", "keep default", "keep that"
    if (text.startsWith('keep') || text.includes('keep')) {
      if (
        hasWhatever ||
        text.includes('need') ||
        text.includes('want') ||
        text.includes('like') ||
        text.includes('think') ||
        text.includes('recommend') ||
        text.includes('suggest') ||
        text.includes('default') ||
        text.includes('anything') ||
        text.includes('something') ||
        text.includes('best') ||
        text.includes('good') ||
        text === 'keep it' ||
        text === 'keep that' ||
        text === 'keep this'
      ) {
        return true;
      }
    }

    // Phrases with "whatever / whaterve / anything / what you": e.g. "whatever you need", "whaterve you need", "whatever you think is best"
    if (hasWhatever || text.includes('anything') || text.includes('what you')) {
      if (
        text.includes('need') ||
        text.includes('want') ||
        text.includes('like') ||
        text.includes('think') ||
        text.includes('choose') ||
        text.includes('decide') ||
        text.includes('best') ||
        text.includes('fine') ||
        text.includes('good') ||
        text.includes('works') ||
        text.includes('fit') ||
        text.includes('suggest')
      ) {
        return true;
      }
    }

    // Delegation to AI phrases: "you decide", "you choose", "you pick", "up to you", "write for me", "generate for me", "fill details"
    if (
      text.includes('you decide') ||
      text.includes('you choose') ||
      text.includes('you pick') ||
      text.includes('you suggest') ||
      text.includes('you recommend') ||
      text.includes('you fill') ||
      text.includes('you write') ||
      text.includes('you think') ||
      text.includes('you like') ||
      text.includes('you want') ||
      text.includes('up to you') ||
      text.includes('your choice') ||
      text.includes('write for me') ||
      text.includes('write it for me') ||
      text.includes('generate for me') ||
      text.includes('fill for me') ||
      text.includes('fill it for me') ||
      text.includes('fill details') ||
      text.includes('fill description') ||
      text.includes('fill something') ||
      text.includes('fill anything') ||
      text.includes('fill what') ||
      text.includes('auto fill') ||
      text.includes('autofill') ||
      text.includes('suggest something') ||
      text.includes('as you like') ||
      text.includes('as you want') ||
      text.includes('as you need') ||
      text.includes('as you think') ||
      text.includes('as needed') ||
      text.includes('as appropriate') ||
      text.includes('according to') ||
      text.includes('based on') ||
      text.includes('as per') ||
      text.includes('keep something')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Match category string against allowed application categories
   */
  public static matchCategory(raw: string): Category | null {
    if (!raw) return null;
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9 &]/g, '');
    for (const cat of CATEGORIES) {
      if (cat.toLowerCase() === clean) return cat;
    }
    // Partial and synonym matches
    if (clean.includes('educat') || clean.includes('school') || clean.includes('student') || clean.includes('learn') || clean.includes('teach')) return 'Education';
    if (clean.includes('health') || clean.includes('medic') || clean.includes('hospital') || clean.includes('mental') || clean.includes('disease')) return 'Health';
    if (clean.includes('environ') || clean.includes('climat') || clean.includes('green') || clean.includes('nature') || clean.includes('water') || clean.includes('solar') || clean.includes('clean energy') || clean.includes('tree') || clean.includes('forest')) return 'Environment';
    if (clean.includes('communit') || clean.includes('civic') || clean.includes('local') || clean.includes('neighb') || clean.includes('animal') || clean.includes('dog') || clean.includes('pet') || clean.includes('shelter')) return 'Community';
    if (clean.includes('science') || clean.includes('tech') || clean.includes('research') || clean.includes('physics') || clean.includes('bio')) return 'Science';
    if (clean.includes('art') || clean.includes('cultur') || clean.includes('music') || clean.includes('theatre') || clean.includes('film')) return 'Arts & Culture';
    if (clean.includes('public policy') || clean.includes('policy') || clean.includes('law') || clean.includes('govern') || clean.includes('civics')) return 'Public Policy';
    if (clean.includes('economic') || clean.includes('finance') || clean.includes('economy') || clean.includes('tax')) return 'Economic Policy';
    if (clean.includes('business') || clean.includes('commerce') || clean.includes('startup') || clean.includes('industry')) return 'Business';
    if (clean.includes('other')) return 'Other';
    return null;
  }

  /**
   * Get the standard question for a campaign creation stage
   */
  public static getQuestionForStage(stage?: CampaignCreationStage): string {
    switch (stage) {
      case 'asking_title':
      case 'asking_goal':
        return "What's the title of your campaign?";
      case 'asking_category':
        return "What's the category?";
      case 'asking_summary':
        return "What's a short description of your campaign?";
      case 'asking_story':
        return "Got it. What's the full campaign description?";
      case 'asking_cover':
        return "Would you like to keep the recommended cover image or choose another one?";
      case 'asking_budget':
        return "What's your funding goal?";
      case 'asking_audience':
        return "Who is your target audience for this campaign?";
      case 'reviewing':
        return "Are you ready to submit for review?";
      default:
        return "What's the title of your campaign?";
    }
  }

  /**
   * Get recommended cover image preset based on category
   */
  private static getRecommendedCoverImage(category?: Category): string {
    switch (category) {
      case 'Education':
      case 'Science':
        return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80';
      case 'Environment':
        return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80';
      case 'Community':
      default:
        return 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=1000&auto=format&fit=crop&q=80';
    }
  }

  /**
   * Conversational Campaign Creation State Machine
   * Step-by-step progressive builder: Step 1 (Basics) -> Step 2 (Story) -> Step 3 (Visuals) -> Step 4 (Budget & Reach) -> Step 5 (Submit)
   * Deterministic controller adhering to the actual application form structure and validation rules
   */
  public static async handleConversationalCampaignCreation(
    text: string,
    context: ReachieTaskContext
  ): Promise<ReachieOrchestrationResult> {
    const stage = context.campaignCreationStage || 'idle';
    const lower = text.toLowerCase().trim();
    const activeDraft = context.activeDraft || (await CampaignRepository.getDraft());
    const staged: Partial<DraftCampaign> = {
      ...(activeDraft || {}),
      ...context.stagedCampaignData,
    };

    // -------------------------------------------------------------
    // 1. Initial Trigger: Start Campaign Creation
    // -------------------------------------------------------------
    if (stage === 'idle' || this.isStartCampaignIntent(lower)) {
      const reply = "What's the title of your campaign?";
      const nextStage: CampaignCreationStage = 'asking_title';
      const initialStaged: DraftCampaign = {
        currentStep: 1,
        lastSavedAt: new Date().toISOString(),
        title: '',
        category: 'Community',
        creatorName: 'Campaign Creator',
        creatorOrg: 'Public Interest Network',
        summary: '',
        coverImage: this.getRecommendedCoverImage('Community'),
        whatItIsAbout: '',
        intendedAudience: '',
        whyItMatters: '',
        initialEvidence: '',
        headline: '',
        introduction: '',
        sections: [],
        statistics: [],
        sources: [],
        audienceActions: [],
        adHeadline: '',
        adDescription: '',
        callToAction: 'Learn More',
        adImages: [],
        adPlacements: ['instagram_feed', 'facebook_feed'],
        targetLocations: ['Pan-India'],
        targetInterests: ['Civic Action', 'Community'],
        channels: ['Instagram', 'Facebook'],
        durationDays: 21,
        fundingGoal: 25000,
        confirmedPolicies: false,
      };
      await CampaignRepository.saveDraft(initialStaged);

      return {
        reply,
        nextStage,
        activeField: 'title',
        lastQuestion: reply,
        stagedData: initialStaged,
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/create',
          step: 1,
          fieldUpdates: initialStaged,
          resultMessage: 'Started campaign creation at Step 1: Basics',
        },
      };
    }

    // -------------------------------------------------------------
    // 2. Universal Handlers: Queries, Corrections, Adjustments
    // -------------------------------------------------------------

    // A. Recall Answered Value: "What was the title I gave?" / "What is the category?"
    if (
      lower.includes('what was the title') ||
      lower.includes('what is the title') ||
      lower.includes('what title did i give') ||
      lower.includes('title i gave') ||
      lower === 'what was the title'
    ) {
      const titleVal = staged.title || activeDraft?.title;
      return {
        reply: titleVal ? `${titleVal}.` : "You haven't entered a title yet.",
        nextStage: stage,
        activeField: context.activeField,
        lastQuestion: context.lastQuestion || this.getQuestionForStage(stage),
        stagedData: staged,
      };
    }

    if (
      lower.includes('what was the category') ||
      lower.includes('what is the category') ||
      lower.includes('category i gave')
    ) {
      const catVal = staged.category || activeDraft?.category;
      return {
        reply: catVal ? `${catVal}.` : "You haven't selected a category yet.",
        nextStage: stage,
        activeField: context.activeField,
        lastQuestion: context.lastQuestion || this.getQuestionForStage(stage),
        stagedData: staged,
      };
    }

    // B. Progress Inspection: "What have I filled so far?"
    if (
      lower.includes('what have i filled') ||
      lower.includes('what is filled') ||
      lower.includes('what details') ||
      lower.includes('show what i filled') ||
      lower.includes('draft progress')
    ) {
      const filledParts: string[] = [];
      if (staged.title) filledParts.push(`Title: "${staged.title}"`);
      if (staged.category) filledParts.push(`Category: ${staged.category}`);
      if (staged.summary) filledParts.push(`Summary: "${staged.summary}"`);
      if (staged.whatItIsAbout) filledParts.push('Story Description');
      if (staged.coverImage) filledParts.push('Cover Image');
      if (staged.fundingGoal) filledParts.push(`Goal: ₹${staged.fundingGoal.toLocaleString('en-IN')}`);
      if (staged.intendedAudience) filledParts.push(`Audience: "${staged.intendedAudience}"`);

      const summaryText =
        filledParts.length > 0
          ? `So far you've filled: ${filledParts.join(', ')}.`
          : "You haven't filled in any fields yet.";
      const nextQ = this.getQuestionForStage(stage);

      return {
        reply: `${summaryText} ${nextQ}`,
        nextStage: stage,
        activeField: context.activeField,
        lastQuestion: nextQ,
        stagedData: staged,
      };
    }

    // C. Field Explanation: "What does category mean?"
    if (
      lower.includes('what does category mean') ||
      lower.includes('what is category') ||
      lower.includes('explain category')
    ) {
      return {
        reply: "It classifies your campaign by its main topic. Which category fits your campaign?",
        nextStage: 'asking_category',
        activeField: 'category',
        lastQuestion: "Which category fits your campaign?",
        stagedData: staged,
      };
    }

    if (
      lower.includes('what does title mean') ||
      lower.includes('what is title')
    ) {
      return {
        reply: "Your title is the main headline people see (up to 60 characters). What's the title of your campaign?",
        nextStage: 'asking_title',
        activeField: 'title',
        lastQuestion: "What's the title of your campaign?",
        stagedData: staged,
      };
    }

    // D. Title Correction: "Change the title to Future Learning"
    const titleChangeMatch = text.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:title|name)\s+(?:to|is)\s+(.+)/i);
    if (titleChangeMatch) {
      const newTitle = titleChangeMatch[1].replace(/["']/g, '').trim().slice(0, 60);
      staged.title = newTitle;
      staged.headline = newTitle;
      staged.adHeadline = newTitle;
      await this.persistDraftUpdates({ title: newTitle, headline: newTitle, adHeadline: newTitle });

      const nextStage = stage === 'asking_title' ? 'asking_category' : stage;
      const pendingQ = this.getQuestionForStage(nextStage);

      return {
        reply: `Title updated to ${newTitle}. ${pendingQ}`,
        nextStage,
        activeField: nextStage,
        lastQuestion: pendingQ,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          fieldUpdates: { title: newTitle, headline: newTitle, adHeadline: newTitle },
          resultMessage: `Title updated to "${newTitle}"`,
        },
      };
    }

    // E. Category Correction: "Change category to Health" / "Let's change the category"
    const categoryChangeMatch = text.match(/(?:change|update|set)\s+(?:the\s+)?category\s*(?:to\s+)?(.+)?/i);
    if (categoryChangeMatch && !lower.includes('what does category mean')) {
      const targetCatStr = categoryChangeMatch[1]?.trim();
      if (targetCatStr && targetCatStr.length > 2) {
        const matched = this.matchCategory(targetCatStr);
        if (matched) {
          staged.category = matched;
          await this.persistDraftUpdates({ category: matched });
          const nextStage = stage === 'asking_category' ? 'asking_summary' : stage;
          const pendingQ = this.getQuestionForStage(nextStage);

          return {
            reply: `Category updated to ${matched}. ${pendingQ}`,
            nextStage,
            activeField: nextStage,
            lastQuestion: pendingQ,
            stagedData: staged,
            action: {
              id: `act_${Date.now()}`,
              type: 'update_draft',
              fieldUpdates: { category: matched },
              resultMessage: `Category updated to "${matched}"`,
            },
          };
        }
      }
      return {
        reply: "What's the category?",
        nextStage: 'asking_category',
        activeField: 'category',
        lastQuestion: "What's the category?",
        stagedData: staged,
      };
    }

    // F. Tone / Length Adjustments: "Make the description shorter"
    if (lower.includes('shorter') || lower.includes('brief') || lower.includes('concise')) {
      const cur = staged.summary || staged.whatItIsAbout || 'Civic message amplification.';
      const shorter = cur.split('.')[0] + '.';
      staged.summary = shorter;
      staged.adDescription = shorter;
      await this.persistDraftUpdates({ summary: shorter, adDescription: shorter });
      const pendingQ = this.getQuestionForStage(stage);

      return {
        reply: `Made your description shorter. ${pendingQ}`,
        nextStage: stage,
        activeField: context.activeField,
        lastQuestion: pendingQ,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          fieldUpdates: { summary: shorter, adDescription: shorter },
          resultMessage: 'Description made shorter',
        },
      };
    }

    // G. Navigation Inside Workflow: "Go back to the previous field"
    if (
      lower.includes('previous field') ||
      lower.includes('previous step') ||
      lower.includes('go back') ||
      lower === 'back'
    ) {
      let prevStage: CampaignCreationStage = 'asking_title';
      let prevStep: CreationStep = 1;

      if (stage === 'asking_category') {
        prevStage = 'asking_title';
        prevStep = 1;
      } else if (stage === 'asking_summary') {
        prevStage = 'asking_category';
        prevStep = 1;
      } else if (stage === 'asking_story') {
        prevStage = 'asking_summary';
        prevStep = 2;
      } else if (stage === 'asking_cover') {
        prevStage = 'asking_story';
        prevStep = 2;
      } else if (stage === 'asking_budget') {
        prevStage = 'asking_cover';
        prevStep = 3;
      } else if (stage === 'asking_audience') {
        prevStage = 'asking_budget';
        prevStep = 4;
      } else if (stage === 'reviewing') {
        prevStage = 'asking_audience';
        prevStep = 4;
      }

      const q = this.getQuestionForStage(prevStage);
      return {
        reply: `Going back. ${q}`,
        nextStage: prevStage,
        activeField: prevStage,
        lastQuestion: q,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/create',
          step: prevStep,
          fieldUpdates: { currentStep: prevStep },
          resultMessage: `Returned to ${prevStage}`,
        },
      };
    }

    // H. Repeat Question
    if (
      lower.includes('repeat the question') ||
      lower.includes('repeat question') ||
      lower.includes('what was the question') ||
      lower === 'repeat'
    ) {
      const q = context.lastQuestion || this.getQuestionForStage(stage);
      return {
        reply: q,
        nextStage: stage,
        activeField: context.activeField,
        lastQuestion: q,
        stagedData: staged,
      };
    }

    // I. Continue / Resume
    if (
      lower.includes('continue where we stopped') ||
      lower.includes('continue where we left off') ||
      lower.includes('resume')
    ) {
      let resumeStage: CampaignCreationStage = 'asking_title';
      let resumeStep: CreationStep = 1;
      if (!staged.title) {
        resumeStage = 'asking_title';
        resumeStep = 1;
      } else if (!staged.category) {
        resumeStage = 'asking_category';
        resumeStep = 1;
      } else if (!staged.summary) {
        resumeStage = 'asking_summary';
        resumeStep = 2;
      } else if (!staged.whatItIsAbout) {
        resumeStage = 'asking_story';
        resumeStep = 2;
      } else if (!staged.coverImage) {
        resumeStage = 'asking_cover';
        resumeStep = 3;
      } else if (!staged.fundingGoal) {
        resumeStage = 'asking_budget';
        resumeStep = 4;
      } else if (!staged.intendedAudience) {
        resumeStage = 'asking_audience';
        resumeStep = 4;
      } else {
        resumeStage = 'reviewing';
        resumeStep = 5;
      }

      const q = this.getQuestionForStage(resumeStage);
      return {
        reply: `Resuming your campaign draft. ${q}`,
        nextStage: resumeStage,
        activeField: resumeStage,
        lastQuestion: q,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'navigate',
          targetRoute: '/create',
          step: resumeStep,
          fieldUpdates: { currentStep: resumeStep },
          resultMessage: `Resumed draft at ${resumeStage}`,
        },
      };
    }

    // -------------------------------------------------------------
    // 3. Stage-Specific Answers and Progression
    // -------------------------------------------------------------

    // STAGE 1a: asking_title (or legacy asking_goal)
    if (stage === 'asking_title' || stage === 'asking_goal') {
      const isAuto = this.isAutoFillOrKeep(lower);
      const cleanTitle = this.cleanExtractedTitle(text);
      let title = '';

      if (isAuto || this.isAutoFillOrKeep(cleanTitle)) {
        title = staged.category === 'Education'
          ? 'Digital Learning Labs for Rural Schools'
          : staged.category === 'Health'
          ? 'Affordable Primary Care for Rural Families'
          : staged.category === 'Environment'
          ? 'Clean Drinking Water for Rural Communities'
          : 'Clean Drinking Water for Rural Schools';
      } else {
        title = cleanTitle || 'Community Public Health Initiative';
      }

      staged.title = title;
      staged.headline = title;
      staged.adHeadline = title;
      await this.persistDraftUpdates({ title, headline: title, adHeadline: title });

      const nextQuestion = "What's the category?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_category',
        activeField: 'category',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 1,
          fieldUpdates: { title, headline: title, adHeadline: title },
          resultMessage: `Title set to "${title}"`,
        },
      };
    }

    // STAGE 1b: asking_category
    if (stage === 'asking_category') {
      const isAuto = this.isAutoFillOrKeep(lower);
      let matchedCategory: Category | null = null;

      if (isAuto) {
        matchedCategory = this.matchCategory(staged.title || '') || 'Community';
      } else {
        matchedCategory = this.matchCategory(text);
      }

      if (!matchedCategory) {
        return {
          reply:
            "I need a valid category. Please choose from: Environment, Health, Science, Education, Community, Public Policy, Arts & Culture, Business, or Other.",
          nextStage: 'asking_category',
          activeField: 'category',
          lastQuestion: "What's the category?",
          stagedData: staged,
        };
      }

      staged.category = matchedCategory;
      await this.persistDraftUpdates({ category: matchedCategory, currentStep: 2 });

      // Basics complete -> Transition naturally to Story
      const nextQuestion =
        "Great, the basics are complete. Let's work on the story. What's a short description of your campaign?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_summary',
        activeField: 'summary',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 2,
          fieldUpdates: { category: matchedCategory, currentStep: 2 },
          resultMessage: `Category set to "${matchedCategory}", moved to Step 2: Story`,
        },
      };
    }

    // STAGE 2a: asking_summary (Short description <= 150 chars)
    if (stage === 'asking_summary') {
      const isAuto =
        this.isAutoFillOrKeep(lower) ||
        lower.includes('according to') ||
        (lower.includes('title') && lower.includes('fill'));
      const cleanSummary = this.cleanExtractedSummary(text);
      let summary = '';

      if (
        isAuto ||
        this.isAutoFillOrKeep(cleanSummary) ||
        cleanSummary.toLowerCase() === 'education' ||
        cleanSummary.toLowerCase() === 'health' ||
        cleanSummary.toLowerCase() === 'environment' ||
        cleanSummary.length < 5
      ) {
        summary = this.generateContextualSummary(staged.title || '', staged.category);
      } else {
        summary = cleanSummary || this.generateContextualSummary(staged.title || '', staged.category);
      }

      staged.summary = summary;
      staged.adDescription = summary;
      await this.persistDraftUpdates({ summary, adDescription: summary });

      const nextQuestion = "Got it. What's the full campaign description?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_story',
        activeField: 'whatItIsAbout',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 2,
          fieldUpdates: { summary, adDescription: summary },
          resultMessage: 'Short description saved',
        },
      };
    }

    // STAGE 2b: asking_story (Full campaign description)
    if (stage === 'asking_story') {
      const isAuto =
        this.isAutoFillOrKeep(lower) ||
        lower.includes('according to') ||
        (lower.includes('title') && lower.includes('fill'));
      const cleanStory = this.cleanExtractedStory(text);
      let story = '';

      if (isAuto || this.isAutoFillOrKeep(cleanStory) || cleanStory.length < 15) {
        story = this.generateContextualStory(staged.title || '', staged.category);
      } else {
        story = cleanStory || this.generateContextualStory(staged.title || '', staged.category);
      }

      staged.whatItIsAbout = story;
      staged.introduction = story;
      staged.sections = [{ id: 'sec_1', title: 'Campaign Story', content: story }];
      await this.persistDraftUpdates({
        whatItIsAbout: story,
        introduction: story,
        sections: staged.sections,
        currentStep: 3,
      });

      // Story complete -> Transition to Visuals
      const nextQuestion =
        "Great, story complete. Moving to Step 3: Visuals. Would you like to keep the recommended cover image or choose another one?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_cover',
        activeField: 'coverImage',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 3,
          fieldUpdates: {
            whatItIsAbout: story,
            introduction: story,
            sections: staged.sections,
            currentStep: 3,
          },
          resultMessage: 'Story complete, moved to Step 3: Visuals',
        },
      };
    }

    // STAGE 3: asking_cover (Cover Image)
    if (stage === 'asking_cover') {
      const coverUrl = text.startsWith('http')
        ? text.trim()
        : this.getRecommendedCoverImage(staged.category);

      staged.coverImage = coverUrl;
      await this.persistDraftUpdates({ coverImage: coverUrl, currentStep: 4 });

      // Visuals complete -> Transition to Budget & Reach
      const nextQuestion = "Cover image set. We're now on Step 4: Budget and Reach. What's your funding goal?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_budget',
        activeField: 'fundingGoal',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 4,
          fieldUpdates: { coverImage: coverUrl, currentStep: 4 },
          resultMessage: 'Cover image set, moved to Step 4: Reach & Budget',
        },
      };
    }

    // STAGE 4a: asking_budget (Funding Goal)
    if (stage === 'asking_budget') {
      const isAuto = this.isAutoFillOrKeep(lower);
      let goal = 25000;

      if (!isAuto) {
        const parsed = this.parseBudgetNumber(text);
        if (parsed >= 100) goal = parsed;
      }

      if (goal < 100) {
        return {
          reply: "The minimum funding goal is $100 (₹100). Please enter an amount of 100 or more.",
          nextStage: 'asking_budget',
          activeField: 'fundingGoal',
          lastQuestion: "What's your funding goal?",
          stagedData: staged,
        };
      }

      staged.fundingGoal = goal;
      await this.persistDraftUpdates({ fundingGoal: goal });

      const nextQuestion = "Who is your target audience for this campaign?";
      return {
        reply: nextQuestion,
        nextStage: 'asking_audience',
        activeField: 'intendedAudience',
        lastQuestion: nextQuestion,
        stagedData: staged,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 4,
          fieldUpdates: { fundingGoal: goal },
          resultMessage: `Funding goal set to ₹${goal.toLocaleString('en-IN')}`,
        },
      };
    }

    // STAGE 4b: asking_audience (Target Audience) -> Assemble Final Draft & Advance to Step 5
    if (stage === 'asking_audience') {
      const isAuto = this.isAutoFillOrKeep(lower);
      const cleanAud = this.cleanExtractedAudience(text);
      let audience = '';

      if (isAuto || this.isAutoFillOrKeep(cleanAud)) {
        if (staged.category === 'Education' || staged.title?.toLowerCase().includes('educat')) {
          audience = 'Parents, educators, students, and rural education advocates';
        } else if (staged.category === 'Health' || staged.title?.toLowerCase().includes('health')) {
          audience = 'Rural families, community health workers, and pediatric care specialists';
        } else if (staged.category === 'Environment' || staged.title?.toLowerCase().includes('water')) {
          audience = 'Local residents, clean energy advocates, and village panchayats';
        } else {
          audience = 'Local residents, families, and community supporters';
        }
      } else {
        audience = cleanAud || 'Local residents, families, and community supporters';
      }

      staged.intendedAudience = audience;
      staged.targetAudienceDesc = audience;

      const finalDraft: DraftCampaign = {
        currentStep: 5,
        lastSavedAt: new Date().toISOString(),
        title: (staged.title || 'Community Initiative').slice(0, 60),
        category: staged.category || 'Community',
        creatorName: staged.creatorName || 'Campaign Creator',
        creatorOrg: 'Public Interest Network',
        summary: staged.summary || `Public awareness for ${(staged.title || 'this initiative')}.`,
        coverImage: staged.coverImage || this.getRecommendedCoverImage(staged.category),
        whatItIsAbout: staged.whatItIsAbout || staged.summary || 'Verified community awareness campaign.',
        intendedAudience: audience,
        targetAudienceDesc: audience,
        whyItMatters: staged.whyItMatters || 'Essential for community awareness and civic transparency.',
        initialEvidence: staged.initialEvidence || 'Verified community documentation 2026',
        headline: (staged.title || 'Community Initiative').slice(0, 60),
        introduction: staged.summary || 'A public interest initiative.',
        sections:
          staged.sections && staged.sections.length > 0
            ? staged.sections
            : [
                {
                  id: 'sec_1',
                  title: 'Campaign Story',
                  content: staged.whatItIsAbout || 'Verified campaign details.',
                },
              ],
        statistics: [
          {
            id: 'stat_1',
            value: 'Verified',
            label: 'Primary Civic Source',
            sourceTitle: 'Community Registry',
          },
        ],
        sources: [
          {
            id: 'src_1',
            title: 'Verified Public Record',
            url: 'https://reach.civic/evidence',
            publisher: 'Public Registry',
            date: '2026',
            isPeerReviewedOrOfficial: true,
          },
        ],
        audienceActions: ['Read Evidence', 'Share Community Alert', 'Back Campaign'],
        adHeadline: (staged.title || 'Community Initiative').slice(0, 60),
        adDescription: staged.summary ? staged.summary.slice(0, 150) : 'Verified community amplification.',
        callToAction: staged.callToAction || 'Learn More',
        adImages: [staged.coverImage || this.getRecommendedCoverImage(staged.category)],
        adPlacements: ['instagram_feed', 'facebook_feed'],
        targetLocations: ['Pan-India'],
        targetInterests: ['Civic Action', 'Community', staged.category || 'Community'],
        channels: ['Instagram', 'Facebook'],
        durationDays: staged.durationDays || 21,
        fundingGoal: staged.fundingGoal || 25000,
        confirmedPolicies: true,
      };

      await CampaignRepository.saveDraft(finalDraft);

      const reply = `All details are complete! We're on Step 5: Review and Submit. Title: "${finalDraft.title}", Category: ${finalDraft.category}, Goal: ₹${finalDraft.fundingGoal.toLocaleString('en-IN')}. Are you ready to submit for review?`;

      return {
        reply,
        draftPreview: finalDraft,
        nextStage: 'reviewing',
        activeField: 'reviewing',
        lastQuestion: 'Are you ready to submit for review?',
        stagedData: finalDraft,
        action: {
          id: `act_${Date.now()}`,
          type: 'update_draft',
          targetRoute: '/create',
          step: 5,
          fieldUpdates: { ...finalDraft, currentStep: 5 },
          resultMessage: 'Campaign draft complete, moved to Step 5: Review and Submit',
        },
      };
    }

    // STAGE 5: reviewing
    if (stage === 'reviewing') {
      if (
        lower.includes('submit') ||
        lower.includes('yes') ||
        lower.includes('confirm') ||
        lower.includes('publish') ||
        lower.includes('ready')
      ) {
        return {
          reply: `Ready to submit "${staged.title || activeDraft?.title || 'your campaign'}" for editorial review. Please confirm below.`,
          action: {
            id: `submit_${Date.now()}`,
            type: 'submit_campaign',
            requiresConfirmation: true,
            confirmationTitle: 'Submit Campaign for Review',
            confirmationMessage: `Are you ready to submit "${staged.title || activeDraft?.title || 'your campaign'}" to editorial reviewers?`,
          },
          nextStage: 'reviewing',
          stagedData: staged,
        };
      }

      return {
        reply: `Draft "${staged.title || activeDraft?.title}" is ready. You can say submit, or make changes to title, category, budget, or description.`,
        nextStage: 'reviewing',
        stagedData: staged,
      };
    }

    return {
      reply: "I'm here to help with your campaign. What would you like to update?",
      nextStage: stage,
      stagedData: staged,
    };
  }

  private static async persistDraftUpdates(updates: Partial<DraftCampaign>): Promise<void> {
    const existing = (await CampaignRepository.getDraft()) || ({} as DraftCampaign);
    const merged = { ...existing, ...updates, lastSavedAt: new Date().toISOString() };
    await CampaignRepository.saveDraft(merged);
  }

  /**
   * Execute Groq API LLM Call if configured with structured actions and short human answers
   */
  private static async callGroqAPI(
    userText: string,
    history: ReachieMessage[],
    context: ReachieTaskContext
  ): Promise<ReachieOrchestrationResult | null> {
    const apiKey = this.getGroqApiKey();
    if (!apiKey) return null;

    const activeDraft = context.activeDraft || (await CampaignRepository.getDraft()) || ({} as DraftCampaign);
    const staged: Partial<DraftCampaign> = {
      ...(activeDraft || {}),
      ...(context.stagedCampaignData || {}),
    };
    const currentStep = staged.currentStep || 1;
    const currentStage = context.campaignCreationStage || 'idle';
    const titleVal = staged.title || '';
    const categoryVal = staged.category || '';

    const systemPrompt = `You are Reachie, an intelligent, warm, concise, and proactive AI voice & chat assistant for Reach (a civic amplification mobile app).

CRITICAL CONVERSATIONAL RULES:
1. ALWAYS KEEP RESPONSES VERY SHORT (1-2 sentences maximum, under 25 words). Speak naturally like a real human assistant, not a robot or encyclopedia.
2. NEVER blindly echo user conversational filler into fields! INTELLIGENTLY DECIDE AND EXTRACT THE ACTUAL VALUE:
   - If user says "So the title of the campaign is education", "the title of the campaign is education", "show the title is education", or "call it education" -> clean title is "Education". Remove all conversational filler like "of the campaign is", "so the title of the campaign is", etc.
   - If user says "So the category of the campaign is education", "the category is education", or "education" -> category is "Education".
   - If user says "Fill according to the title", "according to the title", "fill something you like", "keep whatever you need", or asks you to decide/generate summary ->
     * YOU MUST GENERATE a compelling 1-2 sentence short description specifically tailored to the campaign title ("${titleVal || 'the campaign'}") and category ("${categoryVal || 'general'}").
     * CRITICAL: ALWAYS MATCH THE TITLE'S TOPIC! If the title is about water (e.g. "Clean Waters, Healthy Future"), generate a summary about water filtration, clean drinking water, and testing. If about healthcare/clinics, generate about health. If about trees/environment, generate about urban canopy/trees. NEVER output an education summary if the title is about water or another topic!
   - If user asks for story or says "Fill according to the title" / "keep according to title" / asks you to decide -> GENERATE a complete, powerful 2-3 sentence story explaining the challenge, the initiative, and the community impact 100% SPECIFIC TO title ("${titleVal || 'the campaign'}") and category ("${categoryVal || 'general'}").
   - If user provides funding goal -> parse numbers (e.g. "50k" -> 50000, "twenty five thousand" -> 25000).
   - If user asks for audience -> suggest/save realistic target audience (e.g. "Educators, parents, and community supporters across India").
   - You MUST decide the clean, professional value for each field without conversational baggage or user framing phrases.
3. 5-STEP CAMPAIGN WORKFLOW EXACT PROMPTS & REPLIES:
   - When user starts campaign ("create a campaign", "start campaign"):
     reply: "What's the title of your campaign?", nextStage: "asking_title", targetRoute: "/create", step: 1
   - When user provides title:
     reply: "Got it! What's the category?", nextStage: "asking_category", step: 1, fieldUpdates: { "title": "[clean title]" }
   - When user provides category (Environment, Health, Science, Education, Community, Public Policy, Arts & Culture, Business, Other):
     reply: "Great, the basics are complete. Let's work on the story. What's a short description of your campaign?", nextStage: "asking_summary", step: 2, fieldUpdates: { "category": "[Category]" }
   - When user provides summary:
     reply: "Got it. What's the full campaign description?", nextStage: "asking_story", step: 2, fieldUpdates: { "summary": "[clean or generated summary]" }
   - When user provides full description / story:
     reply: "Great, story complete. Moving to Step 3: Visuals. Would you like to keep the recommended cover image or choose another one?", nextStage: "asking_cover", step: 3, fieldUpdates: { "whatItIsAbout": "[story text]" }
   - When user confirms cover ("keep recommended", "yes", "choose"):
     reply: "Cover image set. We're now on Step 4: Budget and Reach. What's your funding goal?", nextStage: "asking_budget", step: 4, fieldUpdates: { "coverImage": "[preset url or keep]" }
   - When user provides funding goal:
     reply: "Who is your target audience for this campaign?", nextStage: "asking_audience", step: 4, fieldUpdates: { "fundingGoal": [number] }
   - When user provides audience:
     reply: "All details are complete! We're on Step 5: Review and Submit. Title: \\"{title}\\", Category: {category}, Goal: ₹{fundingGoal}. Are you ready to submit for review?", nextStage: "reviewing", step: 5, fieldUpdates: { "intendedAudience": "[audience]" }
   - When user confirms submission ("submit", "yes", "confirm") in review stage:
     action type "submit_campaign" with requiresConfirmation: true.
4. Navigation:
   - "/explore", "/create", "/profile", "/creator", "/activity"
5. Theme switching:
   - "editorial" (Classic Editorial), "aurora" (Dark Chocolate), "glassmorphism" (Frosted Glass)
6. Reach platform knowledge:
   - 85/10/5 budget model: 85% Meta ad spend, 10% editorial review, 5% payment processing fees.
   - Every ₹100 reaches about 1,000 estimated views.
   - Trust Score is out of 10 checking evidence, creator identity, and ad compliance.

CURRENT APP CONTEXT:
- Route: "${context.currentRoute}"
- Stage: "${currentStage}"
- Active Step: ${currentStep}
- ACTIVE CAMPAIGN TITLE: "${titleVal || '(not set yet)'}"
- ACTIVE CAMPAIGN CATEGORY: "${categoryVal || '(not set yet)'}"
- ACTIVE CAMPAIGN SUMMARY: "${staged.summary || '(not set yet)'}"
- Active Draft: ${JSON.stringify({
    title: staged.title || '',
    category: staged.category || '',
    summary: staged.summary || '',
    fundingGoal: staged.fundingGoal || 25000,
    intendedAudience: staged.intendedAudience || '',
  })}

OUTPUT FORMAT (ONLY return a single valid JSON object):
{
  "reply": "Exact short human response matching step instructions",
  "nextStage": "asking_title" | "asking_category" | "asking_summary" | "asking_story" | "asking_cover" | "asking_budget" | "asking_audience" | "reviewing",
  "activeField": "title" | "category" | "summary" | "whatItIsAbout" | "coverImage" | "fundingGoal" | "intendedAudience" | "reviewing",
  "action": {
    "type": "update_draft" | "navigate" | "switch_theme" | "submit_campaign" | "none",
    "targetRoute": "/create" | "/explore" | "/profile" | "/creator" | "/activity",
    "step": 1 | 2 | 3 | 4 | 5,
    "themeId": "editorial" | "aurora" | "glassmorphism",
    "requiresConfirmation": boolean,
    "fieldUpdates": { ... }
  }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userText },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('Groq API response not OK:', response.status);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    if (!rawContent) return null;

    try {
      const parsed = JSON.parse(rawContent);
      const reply = parsed.reply || '';
      const nextStage = parsed.nextStage;
      const activeField = parsed.activeField;

      let action: ReachieActionExecution | undefined = undefined;
      const fieldUpdates = parsed.action?.fieldUpdates || {};

      if (parsed.action && parsed.action.type && parsed.action.type !== 'none') {
        let route = parsed.action.targetRoute;
        if (route) {
          if (route.startsWith('/explore')) route = '/explore';
          else if (route.startsWith('/creator')) route = '/creator';
          else if (route.startsWith('/create')) route = '/create';
          else if (route.startsWith('/profile')) route = '/profile';
          else if (route.startsWith('/activity')) route = '/activity';
        }

        action = {
          id: `act_${Date.now()}`,
          type: parsed.action.type,
          targetRoute: route,
          step: parsed.action.step,
          themeId: parsed.action.themeId,
          fieldUpdates: Object.keys(fieldUpdates).length > 0 ? fieldUpdates : undefined,
          requiresConfirmation:
            parsed.action.type === 'submit_campaign' ||
            (Boolean(parsed.action.requiresConfirmation) && parsed.action.type === 'delete_campaign'),
          resultMessage: reply,
        };
      }

      // Persist any draft updates directly into the repository so form fields update immediately!
      let updatedDraft: DraftCampaign = { ...staged } as DraftCampaign;
      if (Object.keys(fieldUpdates).length > 0 || action?.step) {
        if (fieldUpdates.title) {
          fieldUpdates.title = this.cleanExtractedTitle(fieldUpdates.title);
          if (!fieldUpdates.headline) {
            fieldUpdates.headline = fieldUpdates.title;
          }
          if (!fieldUpdates.adHeadline) {
            fieldUpdates.adHeadline = fieldUpdates.title;
          }
        }
        if (fieldUpdates.summary) {
          fieldUpdates.summary = this.cleanExtractedSummary(fieldUpdates.summary);
          if (!fieldUpdates.adDescription) {
            fieldUpdates.adDescription = fieldUpdates.summary;
          }
        }
        if (fieldUpdates.category) {
          const matched = this.matchCategory(fieldUpdates.category);
          if (matched) {
            fieldUpdates.category = matched;
          }
        }
        if (fieldUpdates.category && !fieldUpdates.coverImage && !staged.coverImage) {
          fieldUpdates.coverImage = this.getRecommendedCoverImage(fieldUpdates.category);
        }
        updatedDraft = {
          ...staged,
          ...fieldUpdates,
          currentStep: action?.step || staged.currentStep || 1,
          lastSavedAt: new Date().toISOString(),
        } as DraftCampaign;

        await CampaignRepository.saveDraft(updatedDraft);
      }

      return {
        reply: reply || "I've updated your campaign draft.",
        nextStage,
        activeField: activeField || nextStage,
        lastQuestion: reply,
        stagedData: updatedDraft,
        action,
        draftPreview: action?.step === 5 ? updatedDraft : undefined,
      };
    } catch {
      return {
        reply: rawContent.slice(0, 150),
      };
    }
  }
}
