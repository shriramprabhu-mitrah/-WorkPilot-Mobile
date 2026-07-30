import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';

const TermsScreen = () => {
  const { colors } = useTheme();
  const { layout, moderateScale, hp } = useAuthLayout();

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
        <AppText
          variant='h2'
          style={{
            marginBottom: moderateScale(6),
            fontSize: moderateScale(24),
          }}
        >
          Terms & Conditions
        </AppText>

        <AppText
          variant='body'
          color={colors.textSecondary}
          style={{
            marginBottom: moderateScale(18),
            fontSize: moderateScale(13),
          }}
        >
          Last Updated: July 2026
        </AppText>

        <AppText variant='body' style={styles.paragraph}>
          Welcome to WorkPilot, a collaborative project management platform that
          helps teams plan projects, manage tasks, organize sprints, track
          progress, and work together efficiently.
        </AppText>

        <AppText variant='body' style={styles.paragraph}>
          By accessing or using WorkPilot, you agree to comply with these Terms
          & Conditions. If you do not agree, please discontinue use of the
          application.
        </AppText>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            1. Eligibility
          </AppText>
          <AppText variant='body'>
            You must be at least 18 years of age, or have authorization from
            your organization, to create and use a WorkPilot account.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            2. User Accounts
          </AppText>
          <AppText variant='body'>
            When creating an account, you agree to:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Provide accurate and up-to-date information.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Keep your login credentials secure.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Maintain the confidentiality of your account.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Notify us immediately if you suspect unauthorized access.
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            You are responsible for all activities performed through your
            account.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            3. Workspace Usage
          </AppText>
          <AppText variant='body'>WorkPilot enables users to:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • Create and manage workspaces
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Create and manage projects
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Plan sprints and backlogs
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Assign and track tasks
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Collaborate with team members
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Share files and comments
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Generate reports and dashboards
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            You agree to use the platform responsibly and in accordance with
            applicable laws.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            4. Acceptable Use
          </AppText>
          <AppText variant='body'>Users must not:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • Upload malicious software or harmful content.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Attempt unauthorized access to systems or data.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Interfere with platform performance.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Harass or abuse other users.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Violate intellectual property rights.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Use the platform for unlawful activities.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            5. Intellectual Property
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            All trademarks, software, logos, designs, and application content
            are the property of WorkPilot unless otherwise stated.
          </AppText>
          <AppText variant='body'>
            Users retain ownership of the content they create within their own
            workspaces.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            6. User Content
          </AppText>
          <AppText variant='body'>
            Users are responsible for the content they upload, including:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Tasks
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Comments
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Documents
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Images
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Attachments
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Project data
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            By uploading content, you grant WorkPilot permission to store and
            process it solely to provide the service.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            7. Data Protection
          </AppText>
          <AppText variant='body'>
            WorkPilot implements reasonable technical and organizational
            measures to safeguard your information from unauthorized access,
            alteration, or disclosure.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            8. Account Suspension
          </AppText>
          <AppText variant='body'>
            We reserve the right to suspend or terminate accounts that:
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Violate these Terms.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Engage in fraudulent or illegal activities.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Compromise the security or stability of the platform.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            9. Limitation of Liability
          </AppText>
          <AppText variant='body' style={styles.paragraph}>
            WorkPilot is provided on an “as is” and “as available” basis.
          </AppText>
          <AppText variant='body'>We are not liable for:</AppText>
          <AppText variant='body' style={styles.bullet}>
            • Data loss caused by user actions.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Third-party service outages.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Internet connectivity issues.
          </AppText>
          <AppText variant='body' style={styles.bullet}>
            • Losses arising from misuse of the platform.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            10. Changes to These Terms
          </AppText>
          <AppText variant='body'>
            We may update these Terms from time to time. Continued use of
            WorkPilot after updates indicates your acceptance of the revised
            Terms.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant='h3' style={styles.sectionTitle}>
            11. Contact Us
          </AppText>
          <AppText variant='body'>
            For questions regarding these Terms, please contact:
          </AppText>
          <AppText variant='body' style={styles.boldText}>
            WorkPilot Support
          </AppText>
          <AppText variant='body'>Email: support@WorkPilot.com</AppText>
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

export default TermsScreen;
