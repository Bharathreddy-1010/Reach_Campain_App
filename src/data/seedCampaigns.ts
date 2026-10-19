import { Campaign } from '../types';

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'RCH-1001',
    title: 'Clean Water Arsenic & Fluoride Testing in Rural Aquifers',
    category: 'Community',
    creator: {
      id: 'cr_1',
      name: 'Dr. Ramesh Kulkarni',
      title: 'Hydrogeologist & Water Quality Lead',
      organization: 'Jal Chetna Research Foundation',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
      bio: '20+ years studying groundwater mineralization and filtration across South Asian river basins.',
    },
    summary:
      'Distributing validated water-testing protocols and certified low-cost filtration guides to 150,000 households across vulnerable riverine zones.',
    coverImage:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Over 40 million people consume groundwater with unmonitored contaminants.',
      introduction:
        'Groundwater contamination from naturally occurring arsenic and industrial fluoride runoff remains an invisible public health crisis. While field testing kits exist for under ₹250, lack of public awareness prevents affected communities from demanding municipal filtration.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Hidden Contaminant Burden',
          content:
            'Chronic ingestion of heavy metals in domestic borewells leads to irreversible systemic fluorosis and neurodegenerative disorders. The tragedy is that shallow aquifers can be screened using simple colorimetric strips within four minutes.',
          imageUrl:
            'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
          imageCaption: 'Field testing groundwater samples in river basin villages.',
          imageCredit: 'Jal Chetna Field Archive, 2024',
        },
        {
          id: 'sec_2',
          title: 'Our Amplification Strategy',
          content:
            'Rather than building proprietary apps, we are running localized video and infogram ad campaigns across Meta and regional news apps. The campaign points directly to free testing locations and certified filter blueprints.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '42M+',
          label: 'People at risk of groundwater fluorosis',
          sourceTitle: 'National Water Quality Assessment Report',
        },
        {
          id: 'stat_2',
          value: '₹220',
          label: 'Average cost of 12-month community testing strip supply',
          sourceTitle: 'Central Institute of Hydrology Study',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Arsenic Speciation and Toxicity in South Asian Alluvial Plains',
          url: 'https://www.who.int/water_sanitation_health/publications/arsenic-guidelines/en/',
          publisher: 'World Health Organization (WHO) Guidelines',
          date: 'Nov 2023',
          isPeerReviewedOrOfficial: true,
        },
        {
          id: 'src_2',
          title: 'National Groundwater Contamination Survey 2023-24',
          url: 'https://cgwb.gov.in/groundwater-quality',
          publisher: 'Central Ground Water Board (CGWB)',
          date: 'Jan 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Check your district groundwater safety map on the official registry',
        'Request free test strips from accredited university lab centers',
        'Share localized boiling and filter guides with neighborhood groups',
      ],
    },
    visuals: {
      adHeadline: 'Is your borewell water safe? Free 4-minute testing guide.',
      adDescription:
        'Learn how to identify arsenic and fluoride indicators in household tap water before chronic symptoms appear.',
      callToAction: 'View Water Safety Map',
      adImages: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_feed', 'facebook_feed'],
    },
    reachSettings: {
      targetLocations: ['Eastern Uttar Pradesh', 'North Bihar', 'West Bengal'],
      targetInterests: ['Public Health', 'Rural Development', 'Agriculture', 'Family Health'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 35000,
      raised: 28400,
      contributionsCount: 142,
      deadlineDaysRemaining: 8,
      currency: '₹',
    },
    status: 'funding',
    createdAt: '2026-09-10T10:00:00Z',
    approvedAt: '2026-09-12T14:30:00Z',
  },
  {
    id: 'RCH-1002',
    title: 'Antibiotic Misuse in Common Coughs: Clinical Fact-Check',
    category: 'Health',
    creator: {
      id: 'cr_2',
      name: 'Dr. Ananya Roy, MD',
      title: 'Infectious Disease Specialist',
      organization: 'Rational Prescribing Alliance',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
      bio: 'Physician working to curb over-the-counter antimicrobial resistance in urban clinics.',
    },
    summary:
      'Educating patients and caregivers that 85% of upper respiratory colds are viral and antibiotics provide zero therapeutic benefit while accelerating resistance.',
    coverImage:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Antibiotics do not kill viral coughs, but overusing them kills future cures.',
      introduction:
        'Every flu season, millions of families demand azithromycin and amoxicillin for simple seasonal coughs. Doctors frequently capitulate due to consultation time pressure. This campaign amplifies easy-to-understand clinical guidelines.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Viral Misconception',
          content:
            'A common cold typically resolves in 7 to 10 days. When an antibiotic is taken on day 4, patients falsely credit the drug rather than natural viral clearance, reinforcing a dangerous loop.',
        },
        {
          id: 'sec_2',
          title: 'Superbugs are Already Here',
          content:
            'ICUs across major metros are seeing pan-drug-resistant infections that were easily treatable a decade ago. Curbing community overconsumption is the first line of defense.',
          imageUrl:
            'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
          imageCaption: 'Hospital laboratory disc-diffusion susceptibility tests.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '85%',
          label: 'Of common respiratory infections are entirely viral',
          sourceTitle: 'Lancet Global Health AMR Surveillance',
        },
        {
          id: 'stat_2',
          value: '3.8x',
          label: 'Rise in secondary antibiotic resistance over 7 years',
          sourceTitle: 'ICMR Antimicrobial Resistance Network',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Global Burden of Bacterial Antimicrobial Resistance',
          url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)02724-0/fulltext',
          publisher: 'The Lancet Medical Journal',
          date: '2023',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Ask your doctor: "Is this cough viral or bacterial before starting pills?"',
        'Never demand or self-medicate with leftover prescription antibiotics',
      ],
    },
    visuals: {
      adHeadline: 'Viral cold? Why antibiotics make things worse.',
      adDescription:
        'Understand why antibiotics cannot cure colds and what actually soothes viral airways.',
      callToAction: 'Read Doctor Guidelines',
      adImages: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_feed', 'instagram_story'],
    },
    reachSettings: {
      targetLocations: ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune'],
      targetInterests: ['Parenting', 'Health & Wellness', 'Pharmacy', 'Family Health'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 45000,
      raised: 45000,
      contributionsCount: 210,
      deadlineDaysRemaining: 0,
      currency: '₹',
    },
    status: 'funding_reached',
    createdAt: '2026-08-20T12:00:00Z',
    approvedAt: '2026-08-22T09:00:00Z',
  },
  {
    id: 'RCH-1003',
    title: 'Urban Heat Island Defense: Street Canopy Plan',
    category: 'Public Policy',
    creator: {
      id: 'cr_3',
      name: 'Priya Sundaram',
      title: 'Urban Forestry Architect',
      organization: 'Cool Cities Collective',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Amplifying municipal data showing asphalt roads reach 54°C in summer, and how planting native canopy trees reduces local surface temperatures by up to 12°C.',
    coverImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Shade is not merely an amenity; in extreme heat, shade saves lives.',
      introduction:
        'Thermal satellite imaging reveals neighborhood-level microclimates where concrete-dense wards suffer temperatures up to 8°C higher than neighboring wards with mature shade canopies.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Thermal Imaging Evidence',
          content:
            'Infrared flyovers show dark road bitumen absorbing peak radiant heat and emitting it throughout the night, causing indoor temperatures in low-income housing to remain dangerously elevated.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '8.4°C',
          label: 'Peak temperature variance between shaded and unshaded corridors',
          sourceTitle: 'Urban Heat Island Satellite Study',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Mitigating Urban Heat Through Strategic Canopy Preservation',
          url: 'https://www.nature.com/articles/s42949-023-00122-8',
          publisher: 'Nature Urban Sustainability',
          date: 'May 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Inspect your ward thermal map',
        'Submit street planting requests to ward corporator',
      ],
    },
    visuals: {
      adHeadline: 'Your street feels hotter because it lacks tree canopy.',
      adDescription: 'Compare your neighborhood heat map and view simple tree planting ordinances.',
      callToAction: 'View Heat Map',
      adImages: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_feed'],
    },
    reachSettings: {
      targetLocations: ['Chennai', 'Ahmedabad', 'Nagpur'],
      targetInterests: ['Architecture', 'Urban Planning', 'Environment', 'Civic Action'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 25000,
      raised: 25000,
      contributionsCount: 118,
      deadlineDaysRemaining: 0,
      currency: '₹',
    },
    status: 'promoting',
    createdAt: '2026-07-15T08:00:00Z',
    approvedAt: '2026-07-18T10:00:00Z',
    report: {
      generatedDate: '2026-10-10',
      status: 'in_progress',
      fundsRaised: 25000,
      adBudgetAllocated: 21250,
      adSpendActual: 18500,
      platformOpsActual: 2500,
      paymentProcessingActual: 1250,
      impressionsDelivered: 185000,
      uniquePeopleReached: 138750,
      clickThroughs: 5820,
      avgCostPerImpression: '₹0.10',
      campaignDurationDays: 14,
      channelsSummary: [
        { channel: 'Instagram Feed', impressions: 115000, spend: 11500 },
        { channel: 'Facebook Feed', impressions: 70000, spend: 7000 },
      ],
      moderationNotes: 'Active distribution ongoing. CTR exceeding target at 3.14%.',
    },
  },
  {
    id: 'RCH-1004',
    title: 'Senior Citizen Digital Scam Awareness & Defense Guide',
    category: 'Education',
    creator: {
      id: 'cr_4',
      name: 'Vikram Sethi',
      title: 'Cybersecurity Educator',
      organization: 'Digital Shield Initiative',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Targeted campaign warning elders and their adult children against fake electricity disconnection SMS, digital arrest threats, and OTP interception tricks.',
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Legitimate police or power boards never place citizens under "digital arrest".',
      introduction:
        'Over ₹1,750 crores were lost last year to sophisticated intimidation rackets pretending to be federal courier customs or power supply disconnection notices.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Anatomy of Intimidation Scams',
          content:
            'Fraudsters use deepfake uniforms on Skype or WhatsApp video calls and create artificial panic. Understanding that no legal arrest can occur over video call protects seniors from instant panic transfers.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '₹1,750 Cr',
          label: 'Estimated elder scam losses reported to cybercrime helplines',
          sourceTitle: 'National Cyber Crime Portal 2024 Report',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Advisory on Digital Arrest Fraud and Impersonation Crimes',
          url: 'https://cybercrime.gov.in/advisories',
          publisher: 'Ministry of Home Affairs Cyber Crime Coordination Centre',
          date: 'Aug 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Call national helpline 1930 immediately if money has been transferred',
        'Save the "3 Golden Rules for Elder Phone Safety" on your parents phones',
      ],
    },
    visuals: {
      adHeadline: 'Got an SMS saying power cuts tonight? It is a scam.',
      adDescription:
        'Share this verified cyber-safety guide with your parents and elderly relatives.',
      callToAction: 'Read Scam Defense Guide',
      adImages: [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['facebook_feed', 'instagram_feed'],
    },
    reachSettings: {
      targetLocations: ['Pan-India Metros and Tier-2 Cities'],
      targetInterests: ['Senior Living', 'Family', 'Retirement', 'Banking'],
      channels: ['Facebook', 'Instagram'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 50000,
      raised: 50000,
      contributionsCount: 340,
      deadlineDaysRemaining: 0,
      currency: '₹',
    },
    status: 'completed',
    createdAt: '2026-06-01T09:00:00Z',
    approvedAt: '2026-06-03T11:00:00Z',
    report: {
      generatedDate: '2026-07-05',
      status: 'completed',
      fundsRaised: 50000,
      adBudgetAllocated: 42500,
      adSpendActual: 42500,
      platformOpsActual: 5000,
      paymentProcessingActual: 2500,
      impressionsDelivered: 426800,
      uniquePeopleReached: 320100,
      clickThroughs: 14210,
      avgCostPerImpression: '₹0.10',
      campaignDurationDays: 28,
      channelsSummary: [
        { channel: 'Facebook Desktop & Mobile', impressions: 260000, spend: 26000 },
        { channel: 'Instagram Feed & Stories', impressions: 166800, spend: 16500 },
      ],
      moderationNotes:
        'Completed campaign. Delivered 100.4% of estimated reach. 14,210 guide downloads logged.',
    },
  },
  {
    id: 'RCH-1005',
    title: 'Open Access Research: Gene Sequencing in Tropical Crop Droughts',
    category: 'Science',
    creator: {
      id: 'cr_5',
      name: 'Prof. S. Namboodiri',
      title: 'Principal Crop Geneticist',
      organization: 'Institute for Climate Resilient Agro-Ecology',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Putting peer-reviewed findings on drought-tolerant millets directly in the hands of 70,000 agrarian agronomists and cooperative managers.',
    coverImage:
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Scientific papers hidden behind $45 journal paywalls hurt real farmers.',
      introduction:
        'Breakthrough genetic markers for root depth in sorghum and finger millet are publicly funded but trapped in proprietary academic indexes. We translate and advertise open summaries to agricultural officers.',
      sections: [
        {
          id: 'sec_1',
          title: 'Why Millet Root Architectures Matter',
          content:
            'Specific alleles allow roots to penetrate deep hardpans, extracting subsoil water during 30-day rain dryspells. Planting these varieties prevents total crop failure.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '40%+',
          label: 'Yield retention during unseasonal dry spells in trial plots',
          sourceTitle: 'ICRISAT Comparative Field Trials 2024',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Genomic dissection of drought tolerance loci in Sorghum bicolor',
          url: 'https://www.frontiersin.org/journals/plant-science',
          publisher: 'Frontiers in Plant Science',
          date: 'Feb 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Download the open cultivar guide for South Asian dry zones',
        'Request certified breeder seeds from state agricultural universities',
      ],
    },
    visuals: {
      adHeadline: 'Drought-tolerant millet markers: Free research guide.',
      adDescription:
        'Access peer-reviewed agronomy summaries for water-stressed soils without journal paywalls.',
      callToAction: 'Download Open Paper',
      adImages: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['facebook_feed'],
    },
    reachSettings: {
      targetLocations: ['Karnataka', 'Maharashtra', 'Telangana', 'Rajasthan'],
      targetInterests: ['Agronomy', 'Farming', 'Agricultural Science', 'Soil Science'],
      channels: ['Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 30000,
      raised: 12200,
      contributionsCount: 64,
      deadlineDaysRemaining: 14,
      currency: '₹',
    },
    status: 'funding',
    createdAt: '2026-09-18T14:00:00Z',
    approvedAt: '2026-09-20T16:00:00Z',
  },
  {
    id: 'RCH-1006',
    title: 'Predatory Quick-Commerce & Small Kirana Store Defense',
    category: 'Economic Policy',
    creator: {
      id: 'cr_6',
      name: 'Mohit Agarwal',
      title: 'Retail Economics Researcher',
      organization: 'Civic Economy Forum',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Broadcasting economic analysis on how anti-competitive discount algorithms in 10-minute delivery apps erode local neighborhood economic resilience.',
    coverImage:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Convenience has a hidden cost: the systemic collapse of neighborhood shops.',
      introduction:
        'Venture-subsidized dark stores sell FMCG products below wholesale cost to capture territory, leaving independent corner stores with zero pricing leverage.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Economic Multiplier of Local Retail',
          content:
            'Every rupee spent at a local store circulates 3.2 times within the local neighborhood economy, whereas quick-commerce profits flow to centralized holding firms.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '22%',
          label: 'Drop in neighborhood retail footfall across metro wards',
          sourceTitle: 'Confederation of Small Merchants Survey',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Antitrust Considerations in Platform Quick-Commerce Ecosystems',
          url: 'https://cci.gov.in/market-studies',
          publisher: 'Competition Commission Market Review',
          date: 'Apr 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Read the fair competition whitepaper',
        'Support local neighborhood store networks on ONDC protocols',
      ],
    },
    visuals: {
      adHeadline: 'Behind 10-minute grocery delivery: An economic analysis.',
      adDescription:
        'Discover how deep discounting impacts local livelihoods and what policy safeguards are needed.',
      callToAction: 'Read Economic Report',
      adImages: [
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_feed'],
    },
    reachSettings: {
      targetLocations: ['Delhi NCR', 'Mumbai', 'Bengaluru'],
      targetInterests: ['Economics', 'Business', 'Public Policy', 'Startups'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 20000,
      raised: 0,
      contributionsCount: 0,
      deadlineDaysRemaining: 21,
      currency: '₹',
    },
    status: 'submitted',
    createdAt: '2026-10-14T08:30:00Z',
    submittedAt: '2026-10-14T09:00:00Z',
    reviewNotes: 'Under standard editorial verification for empirical source citations.',
  },
  {
    id: 'RCH-1007',
    title: 'Preserving Endangered Tribal Dialects in Central India',
    category: 'Arts & Culture',
    creator: {
      id: 'cr_7',
      name: 'Sunita Soren',
      title: 'Linguistic Anthropologist',
      organization: 'Adivasi Bhasha Sanrakshan Trust',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Amplifying an open audio archive of 1,200 endangered folk songs, indigenous medicinal plant naming systems, and oral histories in Gondi and Kurukh.',
    coverImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'When a dialect dies, centuries of ecological taxonomy vanish with it.',
      introduction:
        'Linguists predict that without digital recording and public accessibility, five indigenous Central Indian languages will lose their last fluent native speakers within 15 years.',
      sections: [
        {
          id: 'sec_1',
          title: 'The Open Archive Project',
          content:
            'We have recorded over 300 hours of lossless audio, annotated with phonetic IPA and English translations, deposited under Creative Commons in public repositories.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '1,200+',
          label: 'Documented indigenous botanical terms and folk hymns',
          sourceTitle: 'Linguistic Survey of India Heritage Repository',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Atlas of the Worlds Languages in Danger',
          url: 'https://en.unesco.org/languages-atlas',
          publisher: 'UNESCO Cultural Heritage Division',
          date: '2023',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Explore the open interactive audio map',
        'Contribute voice recordings if you are a heritage speaker',
      ],
    },
    visuals: {
      adHeadline: 'Listen to the ancient voices of Central Indian forests.',
      adDescription:
        'Experience the open audio archive preserving botanical terms and oral traditions.',
      callToAction: 'Listen to Audio Archive',
      adImages: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_story', 'instagram_feed'],
    },
    reachSettings: {
      targetLocations: ['Jharkhand', 'Chhattisgarh', 'Odisha', 'Delhi'],
      targetInterests: ['Anthropology', 'Indian Music', 'History', 'Linguistics'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 28000,
      raised: 7500,
      contributionsCount: 38,
      deadlineDaysRemaining: 12,
      currency: '₹',
    },
    status: 'changes_requested',
    createdAt: '2026-10-01T11:00:00Z',
    submittedAt: '2026-10-02T10:00:00Z',
    reviewNotes:
      'Editorial reviewer requested adding explicit Creative Commons attribution license link for archive clips before public funding launch.',
  },
  {
    id: 'RCH-1008',
    title: 'Plastic Waste Segregation & Extended Producer Responsibility',
    category: 'Environment',
    creator: {
      id: 'cr_8',
      name: 'Tanvi Deshmukh',
      title: 'Environmental Engineer',
      organization: 'Zero Waste Urban Network',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      verifiedIdentity: true,
    },
    summary:
      'Publishing transparency data on multi-layered packaging compliance to hold consumer brands accountable for post-consumer waste reclamation.',
    coverImage:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80',
    story: {
      headline: 'Multi-layer plastic sachets cannot be recycled; brands must phase them out.',
      introduction:
        'Less than 9% of multi-layer plastic packaging is recovered, clogging landfills and microplastic runoff into drinking reservoirs.',
      sections: [
        {
          id: 'sec_1',
          title: 'Extended Producer Responsibility Realities',
          content:
            'While EPR regulations exist on paper, public awareness of municipal brand audit rankings is near zero. Our campaign advertises brand performance scorecards.',
        },
      ],
      statistics: [
        {
          id: 'stat_1',
          value: '<9%',
          label: 'Actual recovery rate of metallized plastic packaging',
          sourceTitle: 'Central Pollution Control Board Packaging Audit',
        },
      ],
      sources: [
        {
          id: 'src_1',
          title: 'Implementation Guidelines for Extended Producer Responsibility Framework',
          url: 'https://cpcb.nic.in/epr-plastic-waste/',
          publisher: 'Central Pollution Control Board (CPCB)',
          date: 'Mar 2024',
          isPeerReviewedOrOfficial: true,
        },
      ],
      audienceActions: [
        'Check which brands met their waste reclamation targets',
        'Learn how to dry-segregate clean plastics for formal recyclers',
      ],
    },
    visuals: {
      adHeadline: 'Who is cleaning up plastic sachets? See the brand audit.',
      adDescription:
        'View the official EPR compliance audit and how municipal sorting works in your city.',
      callToAction: 'View Brand Audit',
      adImages: [
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      ],
      adPlacements: ['instagram_feed'],
    },
    reachSettings: {
      targetLocations: ['Pune', 'Indore', 'Surat', 'Chandigarh'],
      targetInterests: ['Recycling', 'Sustainability', 'Zero Waste', 'Civic Action'],
      channels: ['Instagram', 'Facebook'],
      budgetAllocation: {
        directAdSpendPct: 85,
        reviewAndOpsPct: 10,
        processingFeePct: 5,
      },
      estimatedImpressionsPer100INR: 1000,
      uniqueReachRatio: 0.75,
    },
    funding: {
      goal: 22000,
      raised: 0,
      contributionsCount: 0,
      deadlineDaysRemaining: 28,
      currency: '₹',
    },
    status: 'approved',
    createdAt: '2026-10-12T10:00:00Z',
    approvedAt: '2026-10-13T12:00:00Z',
  },
];
