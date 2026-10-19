# Reach — Design System & Visual Specification

## Aesthetic Philosophy: Editorial Restraint & High Trust
Reach is designed for high-stakes public messages and community-funded civic/educational campaigns. It rejects flashy crypto or generic SaaS gradients in favor of an **editorial, authoritative, and clean visual presence** akin to Linear, Stripe Press, and Apple News.

## Color Palette Tokens
```typescript
export const Colors = {
  // Backgrounds
  background: '#FAF9F6', // Warm editorial parchment
  card: '#FFFFFF',
  cardSubtle: '#F4F3EE',
  surfaceHighlight: '#EDECE6',
  
  // Borders & Dividers
  border: '#E6E4DD',
  borderLight: '#F0EFEA',
  borderDark: '#D4D1C7',
  
  // Typography
  textPrimary: '#111215', // Near-black high contrast
  textSecondary: '#5A5D64',
  textMuted: '#8E919A',
  textInverse: '#FFFFFF',
  
  // Brand & Accent
  primary: '#1D3557', // Deep editorial Navy
  primaryLight: '#2A4A7B',
  primaryMuted: '#EBF1F9',
  accent: '#2563EB', // Electric blue touchpoint for CTAs
  
  // Status Colors
  success: '#15803D',
  successMuted: '#DCFCE7',
  warning: '#B45309',
  warningMuted: '#FEF3C7',
  danger: '#B91C1C',
  dangerMuted: '#FEE2E2',
  info: '#1D4ED8',
  infoMuted: '#DBEAFE',

  // Categories
  category: {
    Environment: { bg: '#E8F5E9', text: '#166534', border: '#BBF7D0' },
    Health: { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
    Science: { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
    Education: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    'Public Policy': { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
    'Economic Policy': { bg: '#CCFBF1', text: '#115E59', border: '#99F6E4' },
    Community: { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' },
    'Arts & Culture': { bg: '#FDF4FF', text: '#86198F', border: '#F5D0FE' },
    Business: { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' },
    Other: { bg: '#F4F4F5', text: '#52525B', border: '#E4E4E7' },
  }
};
```

## Typography System
- **Display Title:** 28px - 34px, SemiBold/Bold, letterSpacing -0.8px, line-height 38px
- **Screen Title:** 22px - 24px, Bold, letterSpacing -0.5px, line-height 30px
- **Section Heading:** 17px - 18px, SemiBold, letterSpacing -0.3px, line-height 24px
- **Body Large / Lead:** 16px, Regular/Medium, line-height 24px
- **Body Regular:** 14px, Regular, line-height 21px
- **Caption / Meta:** 12px, Medium, letterSpacing 0.2px, line-height 16px
- **Micro / Badge:** 11px, SemiBold, letterSpacing 0.4px, uppercase or capitalized

## Spacing Grid
Based on 4pt increments: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

## Component Standards
1. **Cards:** High scannability, subtle border (`1px solid #E6E4DD`), soft elevation (`elevation: 2` on Android, `shadowOpacity: 0.04` on iOS), radius `16px`.
2. **Buttons:**
   - Primary: Deep navy or accent blue fill, white bold text, radius `12px`, height `48px` or `52px`.
   - Secondary: `#FFFFFF` card background, 1px border, textPrimary.
   - Ghost: Transparent background, accent text.
3. **Form Inputs:** 48px height, 1px border `#D4D1C7` (focused `#1D3557`), clear error labels below inputs, character count indicator for title.
4. **Step Indicators:** Persistent, uncluttered 5-step numbered pill progress bar with active step highlight.
