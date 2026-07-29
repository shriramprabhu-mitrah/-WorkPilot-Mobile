import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

const PrivacyPolicyScreen = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, hp } = useAuthLayout();

  const styles = createStyles(moderateScale, colors);

  return (
    <Screen backgroundColor={colors.surface}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: hp(5),
        }}
      >
        <AppText variant='h2' style={styles.title}>
          Privacy Policy
        </AppText>
        <AppText variant='body' style={styles.date}>
          Last Updated: July 2026
        </AppText>

        <AppText variant='body' style={styles.paragraph}>
          At WorkPilot, we respect your privacy and are committed to protecting
          your personal information.
        </AppText>
        <AppText variant='body' style={styles.paragraph}>
          This Privacy Policy explains how we collect, use, store, and protect
          your data when you use our services.
        </AppText>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            1. Information We Collect
          </AppText>

          <AppText variant='body' style={styles.subTitle}>
            Personal Information
          </AppText>
          <AppText variant='body'>We may collect:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • Full Name
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Email Address
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Company Name
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Job Title
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Profile Picture
          </AppText>

          <AppText variant='body' style={styles.subTitle}>
            Workspace Information
          </AppText>
          <AppText variant='body'>
            We store information necessary to provide our services, including:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Projects & Boards
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Tasks, Sprint Data & Backlogs
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Reports & Team Members
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Comments & Attachments
          </AppText>

          <AppText variant='body' style={styles.subTitle}>
            Technical Information
          </AppText>
          <AppText variant='body'>We may collect:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • IP Address
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Browser Type & Operating System
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Device Information
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Login Activity & Usage Analytics
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            2. How We Use Your Information
          </AppText>
          <AppText variant='body'>We use your information to:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • Create and manage your account.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Authenticate users securely.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Provide project management features.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Enable collaboration within workspaces.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Improve application performance.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Send important notifications.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Provide technical support.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            3. Cookies
          </AppText>
          <AppText variant='body'>
            WorkPilot uses cookies and similar technologies to:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Keep you signed in.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Remember your preferences.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Improve application performance.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Enhance your overall user experience.
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            You can manage or disable cookies through your browser settings,
            though some features may not function correctly.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            4. Data Security
          </AppText>
          <AppText variant='body'>
            We use industry-standard security measures, including:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • HTTPS encryption
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Password hashing
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Secure authentication
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Role-based access control
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Continuous security monitoring
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            5. Data Sharing
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            We do not sell your personal information.
          </AppText>
          <AppText variant='body'>Information may only be shared:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • With trusted service providers supporting our platform.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • When required by law.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • To protect our legal rights.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • With your explicit consent.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            6. Data Retention
          </AppText>
          <AppText variant='body'>
            Your data is retained only for as long as necessary to:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Deliver our services.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Meet legal obligations.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Resolve disputes.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Enforce our agreements.
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            You may request deletion of your account, subject to applicable
            legal and contractual requirements.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            7. Your Rights
          </AppText>
          <AppText variant='body'>
            Depending on your location, you may have the right to:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Access your personal information.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Update or correct your information.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Export your data.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Delete your account.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            8. Third-Party Integrations
          </AppText>
          <AppText variant='body'>
            WorkPilot may integrate with third-party services such as:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Google Sign-In & Google Calendar
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Microsoft Sign-In & Outlook
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • GitHub & Slack
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            These services are governed by their own privacy policies.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            9. Children's Privacy
          </AppText>
          <AppText variant='body'>
            WorkPilot is intended for business and professional use and is not
            designed for children under the age of 13.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            10. Changes to This Privacy Policy
          </AppText>
          <AppText variant='body'>
            We may update this Privacy Policy periodically. Material changes
            will be communicated through the application or by email where
            appropriate.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            11. Contact Us
          </AppText>
          <AppText variant='body'>
            If you have questions or concerns about this Privacy Policy, please
            contact:
          </AppText>
          <AppText variant='body' style={styles.boldText}>
            WorkPilot Support
          </AppText>
          <AppText variant='body'>Email: support@WorkPilot.com</AppText>
          <AppText variant='body'>Website: https://www.WorkPilot.com</AppText>
          <AppText variant='body'>
            Business Hours: Monday – Friday, 9:00 AM – 6:00 PM (IST)
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 4,
  },
  date: {
    opacity: 0.6,
    marginBottom: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginVertical: 4,
    lineHeight: 20,
  },
  bullet: {
    marginLeft: 8,
    marginVertical: 2,
  },
  boldText: {
    fontWeight: '600',
    marginTop: 4,
  },
});

const createStyles = (moderateScale: (size: number) => number, colors: any) =>
  StyleSheet.create({
    title: {
      marginBottom: moderateScale(6),
      fontSize: moderateScale(24),
      fontWeight: '700',
      color: colors.text,
    },

    date: {
      marginBottom: moderateScale(18),
      color: colors.textSecondary,
    },

    section: {
      marginTop: moderateScale(18),
    },

    sectionTitle: {
      marginBottom: moderateScale(8),
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: colors.text,
    },

    subTitle: {
      marginTop: moderateScale(10),
      marginBottom: moderateScale(6),
      fontSize: moderateScale(15),
      fontWeight: '600',
      color: colors.text,
    },

    paragraph: {
      marginTop: moderateScale(6),
      lineHeight: moderateScale(22),
      color: colors.text,
    },

    bullet: {
      marginLeft: moderateScale(10),
      marginTop: moderateScale(4),
      lineHeight: moderateScale(22),
      color: colors.text,
    },

    boldText: {
      marginTop: moderateScale(6),
      fontWeight: '600',
      color: colors.text,
    },
  });

export default PrivacyPolicyScreen;
