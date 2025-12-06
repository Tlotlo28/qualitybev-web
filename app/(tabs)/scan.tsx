import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QrCode, Nfc, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '@/lib/supabase';

export default function Scan() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [scanType, setScanType] = useState<'qr' | 'nfc' | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  const handleQRScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert('Camera permission is required to scan QR codes');
        return;
      }
    }
    setScanType('qr');
    setScanning(true);
  };

  const handleNFCScan = async () => {
    setScanType('nfc');
    setScanning(true);

    setTimeout(async () => {
      const isAuthentic = Math.random() > 0.3;
      await createScanRecord('NFC', isAuthentic);
      setScanning(false);
      setScanType(null);

      if (isAuthentic) {
        router.push('/result-verified');
      } else {
        router.push('/result-counterfeit');
      }
    }, 2000);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scanning) return;

    setScanning(false);
    setScanType(null);

    const isAuthentic = Math.random() > 0.3;
    await createScanRecord('QR', isAuthentic);

    if (isAuthentic) {
      router.push('/result-verified');
    } else {
      router.push('/result-counterfeit');
    }
  };

  const createScanRecord = async (type: string, isAuthentic: boolean) => {
    if (!user) return;

    const products = [
      { name: 'Jack Daniels Old No. 7', brand: 'Jack Daniels', manufacturer: 'Brown-Forman', origin: 'Tennessee, USA' },
      { name: 'Johnnie Walker Black Label', brand: 'Johnnie Walker', manufacturer: 'Diageo', origin: 'Scotland' },
      { name: 'Hennessy VS', brand: 'Hennessy', manufacturer: 'Moët Hennessy', origin: 'Cognac, France' },
      { name: 'Grey Goose Vodka', brand: 'Grey Goose', manufacturer: 'Bacardi', origin: 'France' },
    ];

    const product = products[Math.floor(Math.random() * products.length)];

    await supabase.from('scans').insert({
      user_id: user.id,
      product_name: product.name,
      brand: product.brand,
      manufacturer: product.manufacturer,
      origin: product.origin,
      batch_number: `BN${Math.floor(Math.random() * 100000)}`,
      verification_id: `VID${Math.floor(Math.random() * 1000000)}`,
      is_authentic: isAuthentic,
      scan_type: type,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Product</Text>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={[styles.title, { color: colors.text }]}>Choose Scan Method</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select how you want to verify the product
          </Text>
        </Animated.View>

        <View style={styles.scanOptions}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <TouchableOpacity
              style={[styles.scanCard, { backgroundColor: colors.cardBackground }]}
              onPress={handleQRScan}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#334155' }]}>
                <QrCode size={48} color={colors.primary} />
              </View>
              <Text style={[styles.scanTitle, { color: colors.text }]}>QR Code Scan</Text>
              <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                Quick & easy verification using QR codes
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <TouchableOpacity
              style={[styles.scanCard, { backgroundColor: colors.cardBackground }]}
              onPress={handleNFCScan}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#7C2D12' }]}>
                <Nfc size={48} color={colors.primary} />
              </View>
              <Text style={[styles.scanTitle, { color: colors.text }]}>NFC Scan</Text>
              <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                Tap your device to verify instantly
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <Modal
        visible={scanType === 'qr' && scanning}
        animationType="slide"
        onRequestClose={() => {
          setScanning(false);
          setScanType(null);
        }}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraText}>Align QR code within the frame</Text>
              <View style={styles.scanFrame} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setScanning(false);
                  setScanType(null);
                }}
              >
                <X size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      <Modal
        visible={scanType === 'nfc' && scanning}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setScanning(false);
          setScanType(null);
        }}
      >
        <View style={styles.nfcOverlay}>
          <View style={[styles.nfcModal, { backgroundColor: colors.cardBackground }]}>
            <Animated.View entering={FadeInDown.duration(600)}>
              <View style={[styles.nfcIconContainer, { backgroundColor: colors.primary }]}>
                <Nfc size={64} color="#FFFFFF" />
              </View>
              <Text style={[styles.nfcTitle, { color: colors.text }]}>
                Hold Near NFC Tag
              </Text>
              <Text style={[styles.nfcSubtitle, { color: colors.textSecondary }]}>
                Position your device near the NFC tag on the product
              </Text>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setScanning(false);
                  setScanType(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  scanOptions: {
    gap: spacing.lg,
  },
  scanCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scanTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
  },
  scanDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: spacing.sm,
  },
  nfcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  nfcModal: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  nfcIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  nfcTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  nfcSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
});
