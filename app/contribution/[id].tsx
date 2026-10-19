import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  Shield,
  Share2,
} from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { AppHeader } from '../../src/components/common/AppHeader';
import { Button } from '../../src/components/common/Button';
import { Banner } from '../../src/components/common/Banner';
import { ReachMeter } from '../../src/components/common/ReachMeter';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { Campaign, ContributionRecord, PaymentMethod } from '../../src/types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { PRESET_AMOUNTS, APP_CONFIG } from '../../src/constants';
import { ReachCalculator } from '../../src/services/reachCalculator';

type FlowStage = 'amount' | 'review' | 'checkout' | 'confirmation' | 'failure';

export default function ContributionScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stage, setStage] = useState<FlowStage>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customInput, setCustomInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ContributionRecord | null>(null);

  useEffect(() => {
    if (id) {
      CampaignRepository.getCampaignById(id).then((c) => setCampaign(c));
    }
  }, [id]);

  const activeAmount = customInput ? parseInt(customInput, 10) || 0 : selectedAmount;

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomInput('');
  };

  const handleCustomChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomInput(cleaned);
  };

  const metrics = ReachCalculator.calculate(
    activeAmount,
    campaign?.reachSettings.estimatedImpressionsPer100INR,
    campaign?.reachSettings.uniqueReachRatio
  );

  const totalToPay = activeAmount + metrics.platformFee + metrics.processingFee;

  // Process Simulated Payment
  const executeSimulatedPayment = async (status: 'success' | 'failed' | 'cancelled') => {
    if (!campaign) return;
    setIsProcessing(true);

    try {
      // Simulate gateway latency
      await new Promise((resolve) => setTimeout(resolve, 900));

      const res = await CampaignRepository.contribute(
        campaign.id,
        activeAmount,
        paymentMethod,
        status
      );

      setLastReceipt(res.record);
      if (res.campaign) {
        setCampaign(res.campaign);
      }

      if (status === 'success') {
        setStage('confirmation');
      } else {
        setStage('failure');
      }
    } catch (e: any) {
      Alert.alert('Payment Error', e?.message || 'Could not process demonstration transaction.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!lastReceipt) return;
    try {
      await Share.share({
        title: 'Reach Amplification Receipt',
        message: `I just amplified "${lastReceipt.campaignTitle}" on Reach with an estimated ~${ReachCalculator.formatNumber(lastReceipt.estimatedImpressions)} message impressions! Receipt: ${lastReceipt.receiptNumber}`,
      });
    } catch {
      // dismissed
    }
  };

  if (!campaign) {
    return (
      <ScreenWrapper scrollable={false}>
        <AppHeader showBack={true} />
        <View style={styles.centerBox}>
          <Text style={styles.notFound}>Loading campaign details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={true}>
      <AppHeader
        showBack={true}
        title={
          stage === 'confirmation'
            ? 'Contribution Confirmed'
            : stage === 'failure'
            ? 'Payment Status'
            : 'Back This Campaign'
        }
        onBack={() => {
          if (stage === 'review') setStage('amount');
          else if (stage === 'checkout') setStage('review');
          else router.back();
        }}
      />

      <View style={styles.container}>
        {/* Campaign Mini Header */}
        <View style={[styles.campaignHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.campaignCategory, { color: colors.accent }]}>{campaign.category}</Text>
          <Text style={[styles.campaignTitle, { color: colors.textPrimary }]}>{campaign.title}</Text>
          <Text style={[styles.campaignCreator, { color: colors.textSecondary }]}>By {campaign.creator.name}</Text>
        </View>

        {/* STAGE 1 & 2: CHOOSE AMOUNT */}
        {stage === 'amount' && (
          <View>
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Select Contribution Amount</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Funds are allocated strictly toward advertising distribution and verified media placements.
              </Text>

              {/* Preset Buttons */}
              <View style={styles.presetsGrid}>
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = activeAmount === amt && !customInput;
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => handleSelectPreset(amt)}
                      style={[
                        styles.presetBtn,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isSelected && [styles.presetBtnActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: colors.textPrimary },
                          isSelected && [styles.presetTextActive, { color: colors.textInverse }],
                        ]}
                      >
                        {APP_CONFIG.currencySymbol}{amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Amount Input */}
              <View style={[styles.customInputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.textMuted }]}>{APP_CONFIG.currencySymbol}</Text>
                <TextInput
                  style={[styles.customInput, { color: colors.textPrimary }]}
                  placeholder="Enter custom amount..."
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={customInput}
                  onChangeText={handleCustomChange}
                />
              </View>
              {activeAmount < 50 && (
                <Text style={styles.minWarn}>Minimum contribution is ₹50.</Text>
              )}
            </View>

            {/* Dynamic Estimated Reach Meter */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Your Estimated Message Impact</Text>
              <ReachMeter
                amount={activeAmount}
                ratePer100={campaign.reachSettings.estimatedImpressionsPer100INR}
                uniqueRatio={campaign.reachSettings.uniqueReachRatio}
                showBreakdown={true}
              />
            </View>

            {/* Important Rule Banner */}
            <Banner
              variant="neutral"
              title="Distribution Not Donation"
              message={APP_CONFIG.disclaimers.distributionNotDonation}
            />

            <View style={styles.stageActions}>
              <Button
                title={`Continue to Review (${ReachCalculator.formatCurrency(activeAmount)})`}
                onPress={() => setStage('review')}
                disabled={activeAmount < 50}
                variant="primary"
                size="lg"
                style={styles.fullBtn}
              />
            </View>
          </View>
        )}

        {/* STAGE 3: REVIEW SUMMARY */}
        {stage === 'review' && (
          <View>
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewHeading, { color: colors.textPrimary }]}>Contribution Breakdown</Text>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Distribution Ad Spend (85%):</Text>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {ReachCalculator.formatCurrency(metrics.directAdSpend)}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Editorial Review & Ops (10%):</Text>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {ReachCalculator.formatCurrency(metrics.platformFee)}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Payment & Gateway Processing (5%):</Text>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
                  {ReachCalculator.formatCurrency(metrics.processingFee)}
                </Text>
              </View>

              <View style={[styles.totalRow, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Contribution:</Text>
                <Text style={[styles.totalValue, { color: colors.accent }]}>
                  {ReachCalculator.formatCurrency(totalToPay)}
                </Text>
              </View>
            </View>

            {/* Reach impact callout */}
            <View
              style={[
                styles.impactCard,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Eye size={18} color={colors.accent} />
              <View style={styles.impactTextCol}>
                <Text style={[styles.impactTitle, { color: colors.textPrimary }]}>
                  ~{ReachCalculator.formatNumber(metrics.impressions)} Estimated Impressions
                </Text>
                <Text style={[styles.impactSub, { color: colors.textSecondary }]}>
                  Reaching approximately ~{ReachCalculator.formatNumber(metrics.uniquePeople)} unique people in {campaign.reachSettings.targetLocations.join(', ')}.
                </Text>
              </View>
            </View>

            <Banner
              variant="info"
              title="Notice Before Demo Checkout"
              message="Payments in this version are simulated for evaluation and demonstration. No actual credit card or bank funds will be transferred."
            />

            <View style={styles.stageActions}>
              <Button
                title="Proceed to Simulated Checkout"
                onPress={() => setStage('checkout')}
                variant="primary"
                size="lg"
                style={styles.fullBtn}
              />
              <Button
                title="Change Amount"
                onPress={() => setStage('amount')}
                variant="ghost"
                size="md"
                style={styles.fullBtn}
              />
            </View>
          </View>
        )}

        {/* STAGE 4: SIMULATED CHECKOUT */}
        {stage === 'checkout' && (
          <View>
            <View
              style={[
                styles.demoNoticeBadge,
                {
                  backgroundColor: colors.warningMuted,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Shield size={16} color={colors.warning} />
              <Text style={[styles.demoNoticeText, { color: colors.warning }]}>
                DEMONSTRATION SIMULATED CHECKOUT
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Select Simulated Payment Method</Text>

            <View style={styles.methodsList}>
              <TouchableOpacity
                onPress={() => setPaymentMethod('upi')}
                style={[
                  styles.methodCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  paymentMethod === 'upi' && [styles.methodCardActive, { backgroundColor: colors.accentMuted, borderColor: colors.accent }],
                ]}
              >
                <QrCode size={20} color={paymentMethod === 'upi' ? colors.accent : colors.textSecondary} />
                <View style={styles.methodTextCol}>
                  <Text style={[styles.methodName, { color: colors.textPrimary }]}>UPI (GPay, PhonePe, Paytm)</Text>
                  <Text style={[styles.methodSub, { color: colors.textMuted }]}>Instant simulated UPI handle approval</Text>
                </View>
                <View
                  style={[
                    styles.radioDot,
                    { borderColor: colors.border },
                    paymentMethod === 'upi' && [styles.radioDotActive, { borderColor: colors.accent, backgroundColor: colors.accent }],
                  ]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMethod('card')}
                style={[
                  styles.methodCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  paymentMethod === 'card' && [styles.methodCardActive, { backgroundColor: colors.accentMuted, borderColor: colors.accent }],
                ]}
              >
                <CreditCard size={20} color={paymentMethod === 'card' ? colors.accent : colors.textSecondary} />
                <View style={styles.methodTextCol}>
                  <Text style={[styles.methodName, { color: colors.textPrimary }]}>Debit / Credit Card (Demo)</Text>
                  <Text style={[styles.methodSub, { color: colors.textMuted }]}>Simulated test card ending in •••• 4242</Text>
                </View>
                <View
                  style={[
                    styles.radioDot,
                    { borderColor: colors.border },
                    paymentMethod === 'card' && [styles.radioDotActive, { borderColor: colors.accent, backgroundColor: colors.accent }],
                  ]}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMethod('netbanking')}
                style={[
                  styles.methodCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  paymentMethod === 'netbanking' && [styles.methodCardActive, { backgroundColor: colors.accentMuted, borderColor: colors.accent }],
                ]}
              >
                <Building size={20} color={paymentMethod === 'netbanking' ? colors.accent : colors.textSecondary} />
                <View style={styles.methodTextCol}>
                  <Text style={[styles.methodName, { color: colors.textPrimary }]}>Netbanking (Simulated)</Text>
                  <Text style={[styles.methodSub, { color: colors.textMuted }]}>All major scheduled domestic banks</Text>
                </View>
                <View
                  style={[
                    styles.radioDot,
                    { borderColor: colors.border },
                    paymentMethod === 'netbanking' && [styles.radioDotActive, { borderColor: colors.accent, backgroundColor: colors.accent }],
                  ]}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.testLabel, { color: colors.textMuted }]}>Deterministic QA Simulation Actions:</Text>
            <View style={styles.stageActions}>
              <Button
                title={`Pay ${ReachCalculator.formatCurrency(totalToPay)} (Test Success)`}
                onPress={() => executeSimulatedPayment('success')}
                loading={isProcessing}
                variant="primary"
                size="lg"
                style={styles.fullBtn}
              />

              <Button
                title="Simulate Payment Failure"
                onPress={() => executeSimulatedPayment('failed')}
                loading={isProcessing}
                variant="outline"
                size="md"
                style={styles.fullBtn}
              />

              <Button
                title="Cancel Payment"
                onPress={() => executeSimulatedPayment('cancelled')}
                loading={isProcessing}
                variant="ghost"
                size="md"
                style={styles.fullBtn}
              />
            </View>
          </View>
        )}

        {/* STAGE 5: CONFIRMATION & RECEIPT */}
        {stage === 'confirmation' && lastReceipt && (
          <View style={styles.centerContainer}>
            <View style={[styles.successIconBox, { backgroundColor: colors.successMuted }]}>
              <CheckCircle2 size={44} color={colors.success} />
            </View>

            <Text style={[styles.receiptHeaderTitle, { color: colors.textPrimary }]}>Contribution Confirmed!</Text>
            <Text style={[styles.receiptSubtext, { color: colors.textSecondary }]}>
              Thank you for amplifying this verified public message.
            </Text>

            <View style={[styles.officialReceiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.receiptIdRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.receiptIdLabel, { color: colors.textMuted }]}>Receipt Identifier:</Text>
                <Text style={[styles.receiptIdVal, { color: colors.primary }]}>{lastReceipt.receiptNumber}</Text>
              </View>

              <Text style={[styles.recCampaign, { color: colors.textPrimary }]}>{lastReceipt.campaignTitle}</Text>

              <View style={styles.recAmountRow}>
                <Text style={[styles.recAmountLabel, { color: colors.textSecondary }]}>Amount Backed:</Text>
                <Text style={[styles.recAmountVal, { color: colors.textPrimary }]}>
                  {ReachCalculator.formatCurrency(lastReceipt.amount)}
                </Text>
              </View>

              <View style={styles.recAmountRow}>
                <Text style={[styles.recAmountLabel, { color: colors.textSecondary }]}>Platform & Processing:</Text>
                <Text style={[styles.recAmountVal, { color: colors.textPrimary }]}>
                  {ReachCalculator.formatCurrency(lastReceipt.platformFee)}
                </Text>
              </View>

              <View style={[styles.recDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.recAmountRow}>
                <Text style={[styles.recTotalLabel, { color: colors.textPrimary }]}>Total Paid (Simulated):</Text>
                <Text style={[styles.recTotalVal, { color: colors.accent }]}>
                  {ReachCalculator.formatCurrency(lastReceipt.totalPaid)}
                </Text>
              </View>

              <View style={[styles.recImpactBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border, borderWidth: 1 }]}>
                <Eye size={16} color={colors.accent} />
                <Text style={[styles.recImpactText, { color: colors.textSecondary }]}>
                  Your support funds an estimated ~{ReachCalculator.formatNumber(lastReceipt.estimatedImpressions)} audience views (~{ReachCalculator.formatNumber(lastReceipt.estimatedPeopleReached)} people).
                </Text>
              </View>
            </View>

            <View style={styles.receiptActions}>
              <Button
                title="Share Amplification Receipt"
                onPress={handleShareReceipt}
                variant="primary"
                size="lg"
                style={styles.fullBtn}
                leftIcon={<Share2 size={16} color={colors.textInverse} />}
              />

              <Button
                title="View in Activity Feed"
                onPress={() => router.push('/activity')}
                variant="secondary"
                size="md"
                style={styles.fullBtn}
              />

              <Button
                title="Back to Campaign"
                onPress={() => router.replace(`/campaign/${campaign.id}`)}
                variant="ghost"
                size="md"
                style={styles.fullBtn}
              />
            </View>
          </View>
        )}

        {/* STAGE: FAILURE / CANCELLED */}
        {stage === 'failure' && (
          <View style={styles.centerContainer}>
            <View style={[styles.successIconBox, { backgroundColor: colors.dangerMuted }]}>
              <AlertCircle size={44} color={colors.danger} />
            </View>

            <Text style={[styles.receiptHeaderTitle, { color: colors.textPrimary }]}>Payment Failed / Cancelled</Text>
            <Text style={[styles.receiptSubtext, { color: colors.textSecondary }]}>
              As expected in this simulation test, no transaction was recorded and the campaign's funding total remains completely unchanged.
            </Text>

            <View style={styles.stageActions}>
              <Button
                title="Try Demo Checkout Again"
                onPress={() => setStage('checkout')}
                variant="primary"
                size="lg"
                style={styles.fullBtn}
              />
              <Button
                title="Return to Campaign"
                onPress={() => router.replace(`/campaign/${campaign.id}`)}
                variant="outline"
                size="md"
                style={styles.fullBtn}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFound: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  campaignHeader: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  campaignCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  campaignTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  campaignCreator: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    minWidth: 60,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetTextActive: {
    color: Colors.textInverse,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    height: 48,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  minWarn: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  stageActions: {
    marginTop: Spacing.xl,
    gap: 10,
  },
  fullBtn: {
    width: '100%',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  reviewHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accentMuted,
    borderRadius: Radii.md,
    padding: 12,
    gap: 10,
    marginBottom: Spacing.lg,
  },
  impactTextCol: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  impactSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  demoNoticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
  },
  demoNoticeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  methodsList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  methodCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  methodTextCol: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  methodSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioDotActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  testLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  centerContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  receiptHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  receiptSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 290,
  },
  officialReceiptCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: 20,
    ...Shadows.card,
  },
  receiptIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  receiptIdLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  receiptIdVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  recCampaign: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 19,
  },
  recAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  recAmountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recAmountVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  recTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
  },
  recImpactBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: 10,
    borderRadius: Radii.md,
    gap: 8,
    marginTop: 12,
  },
  recImpactText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  receiptActions: {
    width: '100%',
    gap: 10,
  },
});
