import { APP_CONFIG } from '../constants';

export interface ReachMetrics {
  impressions: number;
  uniquePeople: number;
  directAdSpend: number;
  platformFee: number;
  processingFee: number;
}

export const ReachCalculator = {
  calculate(
    amount: number,
    reachRatePer100 = APP_CONFIG.defaultReachRatePer100INR,
    uniqueRatio = APP_CONFIG.uniqueReachRatio
  ): ReachMetrics {
    const validAmount = Math.max(0, isNaN(amount) ? 0 : amount);
    const impressions = Math.floor((validAmount / 100) * reachRatePer100);
    const uniquePeople = Math.floor(impressions * uniqueRatio);

    const directAdSpend = Math.round(
      (validAmount * APP_CONFIG.budgetBreakdown.directAdSpendPct) / 100
    );
    const platformFee = Math.round(
      (validAmount * APP_CONFIG.budgetBreakdown.platformOpsPct) / 100
    );
    const processingFee = Math.max(
      0,
      validAmount - directAdSpend - platformFee
    );

    return {
      impressions,
      uniquePeople,
      directAdSpend,
      platformFee,
      processingFee,
    };
  },

  formatCurrency(amount: number): string {
    return `${APP_CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`;
  },

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return num.toLocaleString('en-IN');
  },
};
