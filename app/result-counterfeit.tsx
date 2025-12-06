import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultCounterfeit() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [scan, setScan] = useState<any>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);

  useEffect(() => {
    loadLatestScan();
  }, []);

  const loadLatestScan = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setScan(data);
  };

  if (!scan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={[colors.error, '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.warningCard}
          >
            <View style={styles.warningIcon}>
              <AlertTriangle size={80} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.warningTitle}>Counterfeit Detected!</Text>
            <Text style={styles.warningSubtitle}>
              This product may not be authentic. Do not consume.
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={24} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>What to do next</Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Do not consume this product
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Counterfeit alcohol can be dangerous and harmful to your health
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Report this product
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Help protect others by reporting this counterfeit product
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Contact authorities
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Report to local authorities or the brand owner
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.whyButton}
              onPress={() => setShowWhyModal(true)}
            >
              <Info size={20} color={colors.primary} />
              <Text style={[styles.whyButtonText, { color: colors.primary }]}>
                Why is this dangerous?
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/report')}
          >
            <Text style={styles.primaryButtonText}>Report This Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showWhyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWhyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Risks of Fake Alcohol
              </Text>
              <TouchableOpacity onPress={() => setShowWhyModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.riskItem}>
                <AlertTriangle size={24} color={colors.error} />
                <View style={styles.riskContent}>
                  <Text style={[styles.riskTitle, { color: colors.text }]}>
                    Toxic Ingredients
                  </Text>
                  <Text style={[styles.riskDescription, { color: colors.textSecondary }]}>
                    Counterfeit alcohol may contain methanol and other toxic substances that can
                    cause blindness, organ damage, or death.
                  </Text>
                </View>
              </View>

              <View style={styles.riskItem}>
                <AlertTriangle size={24} color={colors.error} />
                <View style={styles.riskContent}>
                  <Text style={[styles.riskTitle, { color: colors.text }]}>
                    Unknown Composition
                  </Text>
                  <Text style={[styles.riskDescription, { color: colors.textSecondary }]}>
                    The exact ingredients and alcohol content are unknown, making it impossible to
                    predict the effects on your health.
                  </Text>
                </View>
              </View>

              <View style={styles.riskItem}>
                <AlertTriangle size={24} color={colors.error} />
                <View style={styles.riskContent}>
                  <Text style={[styles.riskTitle, { color: colors.text }]}>
                    No Quality Control
                  </Text>
                  <Text style={[styles.riskDescription, { color: colors.textSecondary }]}>
                    Fake products are made in unregulated facilities with no safety standards,
                    increasing contamination risks.
                  </Text>
                </View>
              </View>

              <View style={styles.riskItem}>
                <AlertTriangle size={24} color={colors.error} />
                <View style={styles.riskContent}>
                  <Text style={[styles.riskTitle, { color: colors.text }]}>
                    Legal Consequences
                  </Text>
                  <Text style={[styles.riskDescription, { color: colors.textSecondary }]}>
                    Buying or selling counterfeit alcohol is illegal and can result in fines or
                    prosecution.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowWhyModal(false)}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 60,
    gap: spacing.lg,
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginTop: 100,
  },
  warningCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  warningIcon: {
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxxl,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  warningSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  whyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  whyButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '85%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
  },
  modalBody: {
    maxHeight: 400,
  },
  riskItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  riskDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  modalButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
  },
});
