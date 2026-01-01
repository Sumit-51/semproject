//app/index.tsx
import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

const Index: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallDevice = height < 700;
  const isTablet = width >= 768;
  const isMedium = width >= 480;

  const responsiveStyles = useMemo(
    () => ({
      logoSize: isSmallDevice ? 90 : isTablet ? 130 : 110,
      brandFontSize: isSmallDevice ? 36 : isTablet ? 52 : 46,
      taglineFontSize: isSmallDevice ? 13 : isTablet ? 18 : 16,
      cardPadding: isTablet ? width * 0.08 : width * 0.06,
      horizontalPadding: isTablet ? width * 0.12 : width * 0.05,
      featureIconSize: isTablet ? 60 : 50,
      buttonHeight: isSmallDevice ? 50 : isTablet ? 58 : 54,
      buttonFontSize: isSmallDevice ? 15 : isTablet ? 18 : 16,
      cardTitleSize: isSmallDevice ? 20 : isTablet ? 30 : 26,
      statNumberSize: isSmallDevice ? 18 : isTablet ? 28 : 24,
    }),
    [width, height, isSmallDevice, isTablet]
  );

  const onLogin = (): void => router.push('/login');
  const onSignUp = (): void => router.push('/signup');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#0a0f1a' }]}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

        {/* Decorative Background Circles */}
        <View
          style={[
            styles.accentCircle,
            {
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: (width * 0.8) / 2,
              top: -width * 0.3,
              right: -width * 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.accentCircle,
            {
              width: width * 0.6,
              height: width * 0.6,
              borderRadius: (width * 0.6) / 2,
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              bottom: height * 0.15,
              left: -width * 0.25,
            },
          ]}
        />
        <View
          style={[
            styles.accentCircle,
            {
              width: width * 0.35,
              height: width * 0.35,
              borderRadius: (width * 0.35) / 2,
              backgroundColor: 'rgba(251, 191, 36, 0.06)',
              bottom: -width * 0.1,
              right: width * 0.05,
            },
          ]}
        />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsiveStyles.horizontalPadding,
              paddingTop: isSmallDevice ? height * 0.08 : height * 0.12,
              paddingBottom: height * 0.05,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.logoCircle,
                {
                  width: responsiveStyles.logoSize,
                  height: responsiveStyles.logoSize,
                  borderRadius: responsiveStyles.logoSize / 2,
                },
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={isSmallDevice ? 40 : isTablet ? 60 : 50}
                color="#0a0f1a"
              />
            </View>

            <Text
              style={[
                styles.brandName,
                {
                  fontSize: responsiveStyles.brandFontSize,
                  marginTop: height * 0.02,
                },
              ]}
            >
              FITCORE
            </Text>

            <Text
              style={[
                styles.tagline,
                {
                  fontSize: responsiveStyles.taglineFontSize,
                  marginTop: height * 0.015,
                },
              ]}
            >
              Strengthen Your Routine{'\n'}Track Your Wins
            </Text>
          </View>

          {/* Features Section */}
          <View
            style={[
              styles.featuresRow,
              {
                marginBottom: height * 0.05,
                marginTop: height * 0.02,
              },
            ]}
          >
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    width: responsiveStyles.featureIconSize,
                    height: responsiveStyles.featureIconSize,
                    borderRadius: responsiveStyles.featureIconSize * 0.25,
                  },
                ]}
              >
                <Ionicons
                  name="trophy-outline"
                  size={isTablet ? 28 : 22}
                  color="#4ade80"
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  { fontSize: isTablet ? 14 : 12 },
                ]}
              >
                Achievements
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    width: responsiveStyles.featureIconSize,
                    height: responsiveStyles.featureIconSize,
                    borderRadius: responsiveStyles.featureIconSize * 0.25,
                  },
                ]}
              >
                <Ionicons
                  name="analytics-outline"
                  size={isTablet ? 28 : 22}
                  color="#3b82f6"
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  { fontSize: isTablet ? 14 : 12 },
                ]}
              >
                Analytics
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    width: responsiveStyles.featureIconSize,
                    height: responsiveStyles.featureIconSize,
                    borderRadius: responsiveStyles.featureIconSize * 0.25,
                  },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={isTablet ? 28 : 22}
                  color="#fbbf24"
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  { fontSize: isTablet ? 14 : 12 },
                ]}
              >
                Community
              </Text>
            </View>
          </View>

          {/* Main Card */}
          <View
            style={[
              styles.card,
              {
                padding: responsiveStyles.cardPadding,
                maxWidth: isTablet ? 600 : '100%',
                alignSelf: 'center',
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                {
                  fontSize: responsiveStyles.cardTitleSize,
                },
              ]}
            >
              Ready to Transform?
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                {
                  marginBottom: height * 0.03,
                  fontSize: isTablet ? 16 : 14,
                },
              ]}
            >
              Join thousands of members achieving their fitness goals with Fitcore.
            </Text>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  height: responsiveStyles.buttonHeight,
                  marginBottom: height * 0.02,
                },
              ]}
              activeOpacity={0.75}
              onPress={onLogin}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { fontSize: responsiveStyles.buttonFontSize },
                ]}
              >
                Login
              </Text>
              <Ionicons name="arrow-forward" size={responsiveStyles.buttonFontSize} color="#0a0f1a" />
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  height: responsiveStyles.buttonHeight,
                  marginBottom: height * 0.035,
                },
              ]}
              activeOpacity={0.75}
              onPress={onSignUp}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { fontSize: responsiveStyles.buttonFontSize },
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Stats Section */}
            <View style={[styles.statsRow, { marginTop: height * 0.02 }]}>
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statNumber,
                    { fontSize: responsiveStyles.statNumberSize },
                  ]}
                >
                  10K+
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { fontSize: isTablet ? 13 : 11, marginTop: 6 },
                  ]}
                >
                  Members
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { height: isSmallDevice ? 30 : 40 },
                ]}
              />

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statNumber,
                    { fontSize: responsiveStyles.statNumberSize },
                  ]}
                >
                  500+
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { fontSize: isTablet ? 13 : 11, marginTop: 6 },
                  ]}
                >
                  Gyms
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { height: isSmallDevice ? 30 : 40 },
                ]}
              />

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statNumber,
                    { fontSize: responsiveStyles.statNumberSize },
                  ]}
                >
                  98%
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { fontSize: isTablet ? 13 : 11, marginTop: 6 },
                  ]}
                >
                  Satisfaction
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  accentCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoCircle: {
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 15,
  },
  brandName: {
    fontWeight: '900',
    color: '#e9eef7',
    letterSpacing: 5,
    textAlign: 'center',
  },
  tagline: {
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  featureIcon: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureText: {
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#94a3b8',
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ade80',
    borderRadius: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: '#0a0f1a',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
    color: '#e9eef7',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: '800',
    color: '#4ade80',
  },
  statLabel: {
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: 10,
  },
});

export default Index;