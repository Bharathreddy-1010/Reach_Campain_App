import { Category } from '../types';

export interface AISuggestionResult {
  title: string;
  category: Category;
  creatorName?: string;
  summary: string;
  whatItIsAbout: string;
  intendedAudience: string;
  whyItMatters: string;
  initialEvidence: string;
  adHeadline: string;
  adDescription: string;
  callToAction: string;
  coverImage?: string;
  fundingGoal?: number;
}

export const SAMPLE_VOICE_PROMPTS = [
  {
    label: 'Clean Drinking Water',
    transcript:
      'We want to raise awareness about high fluoride and arsenic in shallow borewells across our river district, providing families with simple test strip guides.',
  },
  {
    label: 'Elder Digital Safety',
    transcript:
      'Our campaign educates senior citizens on how to spot digital arrest threats and fake electricity bill disconnection messages.',
  },
  {
    label: 'Urban Tree Canopy',
    transcript:
      'Satellite heat maps show asphalt roads reach 52 degrees in summer. We want to campaign for planting broad native shade trees.',
  },
  {
    label: 'Local Retail Defense',
    transcript:
      'Highlighting how predatory below-cost discounting in ten-minute grocery apps threatens the survival of neighborhood family-owned kirana stores.',
  },
];

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

export const AIDraftingService = {
  isLiveServiceAvailable(): boolean {
    return false; // Truthful demo disclosure: live third-party speech/LLM APIs are not hardcoded
  },

  getServiceLabel(): string {
    return 'Editorial Assistant (Simulated Demo)';
  },

  async draftFromVoiceTranscript(transcript: string): Promise<AISuggestionResult> {
    // Simulated natural language parsing of user voice transcript
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lower = transcript.toLowerCase();
    let category: Category = 'Community';
    let title = 'Community Awareness & Public Action Initiative';
    let summary = transcript.slice(0, 140);
    let adHeadline = 'Learn the facts that impact your neighborhood.';
    let callToAction = 'Read Verified Guide';

    if (lower.includes('water') || lower.includes('aquifer') || lower.includes('fluoride')) {
      category = 'Community';
      title = 'Testing Drinking Water in Vulnerable Aquifers';
      summary =
        'Providing verified home-testing guides and low-cost filtration options to households relying on unmonitored borewells.';
      adHeadline = 'Is your tap water safe? Free testing guide.';
      callToAction = 'View Safety Guide';
    } else if (lower.includes('scam') || lower.includes('senior') || lower.includes('elder') || lower.includes('cyber')) {
      category = 'Education';
      title = 'Senior Citizen Cyber-Safety & Anti-Scam Guide';
      summary =
        'Educating families and seniors on how to immediately identify fake digital arrest calls and panic SMS scams.';
      adHeadline = 'Protect your parents from phone scams.';
      callToAction = 'Read Scam Defense';
    } else if (lower.includes('heat') || lower.includes('tree') || lower.includes('canopy') || lower.includes('green')) {
      category = 'Public Policy';
      title = 'Cooler Streets: Urban Tree Canopy Defense';
      summary =
        'Showing how neighborhood shade trees reduce local asphalt temperatures by up to 10°C during summer heatwaves.';
      adHeadline = 'Why our streets are burning: Heat map analysis.';
      callToAction = 'Inspect Heat Map';
    } else if (lower.includes('store') || lower.includes('shop') || lower.includes('retail') || lower.includes('kirana')) {
      category = 'Economic Policy';
      title = 'Protecting Neighborhood Retail & Fair Trade';
      summary =
        'Broadcasting economic analysis on how predatory delivery algorithms erode neighborhood market diversity.';
      adHeadline = 'The hidden cost of 10-minute grocery delivery.';
      callToAction = 'Read Market Report';
    }

    return {
      title: title.slice(0, 60),
      category,
      summary,
      whatItIsAbout: transcript,
      intendedAudience: 'Affected regional residents, families, and civic coordinators',
      whyItMatters:
        'Immediate awareness directly empowers community members with actionable, verified preventive steps.',
      initialEvidence:
        'Official government advisories and open empirical datasets corroborate these findings.',
      adHeadline: adHeadline.slice(0, 60),
      adDescription: summary,
      callToAction,
    };
  },

  async suggestCreativeCopy(topic: string, category: Category): Promise<Partial<AISuggestionResult>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      title: `${topic.slice(0, 50)} Fact-Check`.slice(0, 60),
      adHeadline: `What you need to know about ${topic.slice(0, 30)}`.slice(0, 60),
      callToAction: 'Read Research Report',
    };
  },

  async generateCampaignFromPrompt(
    prompt: string,
    generateCoverImage: boolean = false
  ): Promise<AISuggestionResult> {
    const apiKey =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GROQ_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
      '';

    // 1. Live generation via Groq API
    if (apiKey && prompt.trim()) {
      try {
        const systemPrompt = `You are Reach AI, an expert campaign drafting assistant for a community message amplification platform.
Based on the user's campaign description, create a complete, factual, and inspiring campaign draft.
Respond ONLY with a strict JSON object with these EXACT keys:
- "title": string (3 to 50 characters, inspiring and clean)
- "category": string (must be exactly one of: "Environment", "Health", "Science", "Education", "Public Policy", "Economic Policy", "Community", "Arts & Culture", "Business", "Other")
- "creatorName": string (e.g. "Community Project", "Education Alliance")
- "summary": string (20 to 140 characters, concise and punchy)
- "whatItIsAbout": string (40 to 300 characters, full explanation of the cause)
- "intendedAudience": string (target audience)
- "whyItMatters": string (importance to community and backers)
- "initialEvidence": string (credible citations, empirical facts, or documented reports)
- "adHeadline": string (punchy ad title, max 50 characters)
- "adDescription": string (ad copy, max 120 characters)
- "callToAction": string (e.g. "Learn More", "Read Verified Guide", "Support Education")
- "fundingGoal": number (between 10000 and 50000, default 25000)`;

        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt.trim() },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 650,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const validCategories: Category[] = [
              'Environment',
              'Health',
              'Science',
              'Education',
              'Public Policy',
              'Economic Policy',
              'Community',
              'Arts & Culture',
              'Business',
              'Other',
            ];
            let category: Category = 'Community';
            if (validCategories.includes(parsed.category)) {
              category = parsed.category;
            } else if (parsed.category === 'Clean Water' || parsed.category === 'Climate') {
              category = 'Environment';
            } else if (parsed.category === 'Public Health') {
              category = 'Health';
            } else if (parsed.category === 'Civic Action') {
              category = 'Community';
            } else if (parsed.category === 'Consumer Safety' || parsed.category === 'Open Knowledge') {
              category = 'Public Policy';
            }

            let chosenCover: string | undefined = undefined;
            const fullText = (prompt + ' ' + (parsed.title || '') + ' ' + category).toLowerCase();
            if (
              fullText.includes('school') ||
              fullText.includes('educat') ||
              fullText.includes('child') ||
              fullText.includes('book') ||
              fullText.includes('student') ||
              fullText.includes('learn')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('water') ||
              fullText.includes('river') ||
              fullText.includes('aquifer') ||
              fullText.includes('fluoride') ||
              fullText.includes('arsenic')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('pet') ||
              fullText.includes('dog') ||
              fullText.includes('cat') ||
              fullText.includes('animal') ||
              fullText.includes('shelter')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('tree') ||
              fullText.includes('forest') ||
              fullText.includes('green') ||
              fullText.includes('climate') ||
              fullText.includes('heat')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('solar') ||
              fullText.includes('energy') ||
              fullText.includes('microgrid')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('health') ||
              fullText.includes('medicine') ||
              fullText.includes('doctor') ||
              fullText.includes('science')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80';
            } else if (
              fullText.includes('store') ||
              fullText.includes('shop') ||
              fullText.includes('retail') ||
              fullText.includes('kirana')
            ) {
              chosenCover =
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80';
            } else {
              chosenCover =
                'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80';
            }

            return {
              title: (parsed.title || 'Community Campaign').slice(0, 50),
              category,
              creatorName: parsed.creatorName || 'The Community Project',
              summary: (parsed.summary || prompt).slice(0, 140),
              whatItIsAbout: parsed.whatItIsAbout || prompt,
              intendedAudience: parsed.intendedAudience || 'Community members and supporters',
              whyItMatters:
                parsed.whyItMatters || 'Raises essential public awareness with verified facts.',
              initialEvidence:
                parsed.initialEvidence || 'Empirical local reporting and verified public records.',
              adHeadline: (parsed.adHeadline || parsed.title || 'Support this cause').slice(0, 50),
              adDescription: (parsed.adDescription || parsed.summary || prompt).slice(0, 120),
              callToAction: parsed.callToAction || 'Learn More',
              coverImage: chosenCover,
              fundingGoal: typeof parsed.fundingGoal === 'number' ? parsed.fundingGoal : 25000,
            };
          }
        }
      } catch (err) {
        console.warn('Groq live generation fallback triggered:', err);
      }
    }

    // 2. Offline / deterministic fallback
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = prompt.toLowerCase();
    let category: Category = 'Community';
    let title = 'Community Awareness & Public Action Initiative';
    let creatorName = 'The Community Action Collective';
    let summary = prompt.slice(0, 140);
    let adHeadline = 'Learn the facts that impact your community.';
    let callToAction = 'Learn More & Support';
    let coverImage: string =
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80';

    if (
      lower.includes('pet') ||
      lower.includes('dog') ||
      lower.includes('cat') ||
      lower.includes('animal') ||
      lower.includes('shelter')
    ) {
      category = 'Community';
      title = 'Help save pets from being put down';
      creatorName = 'The I Love Pets community';
      summary =
        'Providing urgent visibility, community foster networks, and sponsorship to save adoptable shelter animals.';
      adHeadline = 'Help save pets from being put down.';
      callToAction = 'Adopt or Foster Today';
      coverImage =
        'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80';
    } else if (
      lower.includes('water') ||
      lower.includes('aquifer') ||
      lower.includes('fluoride') ||
      lower.includes('arsenic')
    ) {
      category = 'Community';
      title = 'Testing Drinking Water in Vulnerable Aquifers';
      creatorName = 'Clean Water Alliance';
      summary =
        'Providing verified home-testing guides and low-cost filtration options to households relying on unmonitored borewells.';
      adHeadline = 'Is your tap water safe? Free testing guide.';
      callToAction = 'View Safety Guide';
      coverImage =
        'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1000&auto=format&fit=crop&q=80';
    } else if (
      lower.includes('scam') ||
      lower.includes('senior') ||
      lower.includes('elder') ||
      lower.includes('cyber') ||
      lower.includes('fraud')
    ) {
      category = 'Education';
      title = 'Senior Citizen Cyber-Safety & Anti-Scam Guide';
      creatorName = 'Digital Elder Defense Network';
      summary =
        'Educating families and seniors on how to immediately identify fake digital arrest calls and panic SMS scams.';
      adHeadline = 'Protect your parents from phone scams.';
      callToAction = 'Read Scam Defense';
      coverImage =
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80';
    } else if (
      lower.includes('heat') ||
      lower.includes('tree') ||
      lower.includes('canopy') ||
      lower.includes('green') ||
      lower.includes('climate')
    ) {
      category = 'Environment';
      title = 'Cooler Streets: Urban Tree Canopy Defense';
      creatorName = 'Green Neighborhood Initiative';
      summary =
        'Showing how neighborhood shade trees reduce local asphalt temperatures by up to 10°C during summer heatwaves.';
      adHeadline = 'Why our streets are burning: Heat map analysis.';
      callToAction = 'Inspect Heat Map';
      coverImage =
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80';
    } else if (
      lower.includes('health') ||
      lower.includes('antibiotic') ||
      lower.includes('medicine') ||
      lower.includes('hospital') ||
      lower.includes('doctor')
    ) {
      category = 'Health';
      title = 'Preventing Overuse of Critical Antibiotics';
      creatorName = 'Public Health Watch';
      summary =
        'Public advisory campaign to educate patients on preventing antimicrobial resistance in outpatient prescriptions.';
      adHeadline = 'Stop antibiotic misuse before it spreads.';
      callToAction = 'Read Public Alert';
      coverImage =
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80';
    } else if (
      lower.includes('store') ||
      lower.includes('shop') ||
      lower.includes('retail') ||
      lower.includes('kirana') ||
      lower.includes('business')
    ) {
      category = 'Economic Policy';
      title = 'Protecting Neighborhood Retail & Fair Trade';
      creatorName = 'Fair Retail Alliance';
      summary =
        'Broadcasting economic analysis on how predatory delivery algorithms erode neighborhood market diversity.';
      adHeadline = 'The hidden cost of 10-minute grocery delivery.';
      callToAction = 'Read Market Report';
      coverImage =
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80';
    } else {
      const cleaned = prompt.trim().replace(/[.\n].*$/, '');
      if (cleaned.length > 5 && cleaned.length <= 60) {
        title = cleaned;
      } else if (cleaned.length > 60) {
        title = cleaned.slice(0, 57) + '...';
      }
    }

    return {
      title: title.slice(0, 60),
      category,
      creatorName,
      summary,
      whatItIsAbout: prompt,
      intendedAudience: 'Affected regional communities, supporters, and advocates',
      whyItMatters:
        'Targeted digital distribution delivers critical facts directly to those who can make a real difference.',
      initialEvidence:
        'Documented community findings, peer testimonials, and public interest research.',
      adHeadline: adHeadline.slice(0, 60),
      adDescription: summary,
      callToAction,
      coverImage,
      fundingGoal: 25000,
    };
  },
};
