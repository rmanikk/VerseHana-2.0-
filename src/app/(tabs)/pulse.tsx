
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

import { Colors, Radius, Spacing, Typography } from "@/constants/theme";

const theme = Colors.dark;

type PulseStep = "welcome" | "identity" | "home";
type VoteType = "up" | "down" | null;

export default function PulseScreen() {
  const [step, setStep] = useState<PulseStep>("welcome");
  const [username, setUsername] = useState("");
  const [vote, setVote] = useState<VoteType>(null);

  const cleanUsername = username.trim();
  const isUsernameValid = /^[a-zA-Z0-9_]{3,16}$/.test(cleanUsername);
  const pulseUsername = `Verse${cleanUsername}`;

  const handleContinue = () => {
    if (!isUsernameValid) {
      Alert.alert(
        "Invalid username",
        "Use 3–16 letters, numbers, or underscores."
      );
      return;
    }

    setStep("home");
  };

  const handleVote = (selectedVote: "up" | "down") => {
    setVote((currentVote) =>
      currentVote === selectedVote ? null : selectedVote
    );
  };

  const upvotes = 128 + (vote === "up" ? 1 : 0);
  const downvotes = 12 + (vote === "down" ? 1 : 0);

  // WELCOME SCREEN
  if (step === "welcome") {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#103638", "#07191B", "#07191B"]}
          style={styles.welcomeBackground}
        >
          <View style={styles.welcomeContent}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#35C9BC", "#58D8E8"]}
                style={styles.logoGradient}
              >
                <Ionicons name="pulse" size={42} color="#07191B" />
              </LinearGradient>
            </View>

            <Text style={styles.brandLabel}>VERSEHANA COMMUNITY</Text>

            <Text style={styles.welcomeTitle}>
              Feel the{"\n"}
              <Text style={styles.highlightText}>Pulse.</Text>
            </Text>

            <Text style={styles.welcomeDescription}>
              A place for music lovers to discover, share, and vote on the
              sounds that move them.
            </Text>

            <View style={styles.featureList}>
              <FeatureRow
                icon="musical-notes-outline"
                title="Share your music"
                description="Post songs and VerseFlow reels you love."
              />

              <FeatureRow
                icon="people-outline"
                title="Find your community"
                description="Join groups or create your own."
              />

              <FeatureRow
                icon="bar-chart-outline"
                title="Make your voice count"
                description="Upvote or downvote the music you discover."
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => setStep("identity")}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#07191B" />
            </TouchableOpacity>

            <Text style={styles.bottomNote}>
              Your music community starts here.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // IDENTITY CREATION SCREEN
  if (step === "identity") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.identityScroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep("welcome")}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.identityIcon}>
            <Ionicons name="person-outline" size={34} color={theme.primary} />
          </View>

          <Text style={styles.identityTitle}>Create your Pulse identity</Text>

          <Text style={styles.identityDescription}>
            Choose a unique username for your community presence. Your Pulse
            identity will be connected to your VerseHana account.
          </Text>

          <Text style={styles.inputLabel}>YOUR PULSE USERNAME</Text>

          <View style={styles.usernameInputContainer}>
            <Text style={styles.usernamePrefix}>Verse</Text>

            <View style={styles.usernameDivider} />

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="yourname"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={16}
              style={styles.usernameInput}
            />
          </View>

          <Text style={styles.usernameHint}>
            Your username will look like{" "}
            <Text style={styles.highlightText}>
              {cleanUsername ? pulseUsername : "VerseYourname"}
            </Text>
          </Text>

          <View style={styles.rulesContainer}>
            <View style={styles.ruleRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={theme.primary}
              />
              <Text style={styles.ruleText}>3–16 characters</Text>
            </View>

            <View style={styles.ruleRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={theme.primary}
              />
              <Text style={styles.ruleText}>
                Letters, numbers, and underscores
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={theme.primary}
              />
              <Text style={styles.ruleText}>Must begin with Verse</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.primaryButton,
              !isUsernameValid && styles.disabledButton,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#07191B" />
          </TouchableOpacity>

          <Text style={styles.bottomNote}>
            You only need one Pulse identity.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // PULSE GLOBAL FEED
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {/* HEADER */}
        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.feedEyebrow}>YOUR MUSIC COMMUNITY</Text>
            <Text style={styles.feedTitle}>Pulse</Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-outline" size={21} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* GROUP SELECTOR */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.groupSelector}
          onPress={() =>
            Alert.alert("Communities", "Group discovery will be added next.")
          }
        >
          <View style={styles.groupIcon}>
            <Ionicons name="globe-outline" size={21} color={theme.primary} />
          </View>

          <View style={styles.groupInfo}>
            <Text style={styles.groupLabel}>CURRENT COMMUNITY</Text>
            <Text style={styles.groupName}>Global Group</Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* COMPOSER */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.composer}
          onPress={() =>
            Alert.alert("Create a post", "Music sharing will be added next.")
          }
        >
          <View style={styles.composerAvatar}>
            <Ionicons name="person" size={19} color={theme.background} />
          </View>

          <Text style={styles.composerPlaceholder}>
            Share a song or VerseFlow...
          </Text>

          <View style={styles.addButton}>
            <Ionicons name="add" size={23} color="#07191B" />
          </View>
        </TouchableOpacity>

        {/* FEED SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Global Feed</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Feed", "Feed sorting will be added next.")
            }
          >
            <Text style={styles.sortText}>Latest</Text>
          </TouchableOpacity>
        </View>

        {/* SAMPLE POST */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postAvatar}>
              <Ionicons name="person" size={19} color={theme.primary} />
            </View>

            <View style={styles.postAuthorInfo}>
              <Text style={styles.postAuthor}>VerseMelody</Text>
              <Text style={styles.postTime}>Global Group · 2 hours ago</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert("Post options", "More post options coming soon.")
              }
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.postCaption}>
            This track has been on repeat lately. The atmosphere is
            incredible. What do you think?
          </Text>

          {/* MUSIC PREVIEW */}
          <View style={styles.musicCard}>
            <LinearGradient
              colors={["#1C6665", "#123B40", "#102B2D"]}
              style={styles.musicArtwork}
            >
              <Ionicons name="musical-notes" size={42} color="#58D8E8" />
            </LinearGradient>

            <View style={styles.musicInfo}>
              <Text style={styles.musicType}>SHARED SONG</Text>
              <Text style={styles.musicTitle}>Midnight Memories</Text>
              <Text style={styles.musicArtist}>Demo Artist</Text>

              <TouchableOpacity
                style={styles.playButton}
                onPress={() =>
                  Alert.alert(
                    "Demo player",
                    "Music playback will be connected later."
                  )
                }
              >
                <Ionicons name="play" size={15} color="#07191B" />
                <Text style={styles.playButtonText}>Play preview</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* VOTING */}
          <View style={styles.voteContainer}>
            <Text style={styles.voteHeading}>COMMUNITY VOTES</Text>

            <View style={styles.voteActions}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleVote("up")}
                style={[
                  styles.voteButton,
                  vote === "up" && styles.activeUpvote,
                ]}
              >
                <Ionicons
                  name="arrow-up"
                  size={19}
                  color={vote === "up" ? "#07191B" : theme.primary}
                />
                <Text
                  style={[
                    styles.voteCount,
                    vote === "up" && styles.activeVoteText,
                  ]}
                >
                  {upvotes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleVote("down")}
                style={[
                  styles.voteButton,
                  vote === "down" && styles.activeDownvote,
                ]}
              >
                <Ionicons
                  name="arrow-down"
                  size={19}
                  color={vote === "down" ? "#07191B" : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.voteCount,
                    vote === "down" && styles.activeVoteText,
                  ]}
                >
                  {downvotes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CREATE COMMUNITY */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.createCommunity}
          onPress={() =>
            Alert.alert("Create a community", "Community creation comes next.")
          }
        >
          <View style={styles.createCommunityIcon}>
            <Ionicons name="people-outline" size={22} color={theme.primary} />
          </View>

          <View style={styles.createCommunityInfo}>
            <Text style={styles.createCommunityTitle}>
              Create your community
            </Text>
            <Text style={styles.createCommunityDescription}>
              Bring music lovers together around a shared interest.
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={theme.primary}
          />
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          You're viewing a demo feed. Community features will be connected
          in the next development stage.
        </Text>
      </ScrollView>
    </View>
  );
}

// REUSABLE WELCOME FEATURE
function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // WELCOME
  welcomeBackground: {
    flex: 1,
  },
  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.seven,
    paddingBottom: Spacing.four,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  logoGradient: {
    width: 82,
    height: 82,
    borderRadius: Radius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  brandLabel: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: "700",
    letterSpacing: 2.5,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  welcomeTitle: {
    color: theme.text,
    fontSize: 48,
    lineHeight: 55,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  highlightText: {
    color: theme.primary,
  },
  welcomeDescription: {
    color: theme.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: Spacing.five,
  },
  featureList: {
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundElement,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: theme.text,
    fontSize: Typography.size.md,
    fontWeight: "700",
    marginBottom: 3,
  },
  featureDescription: {
    color: theme.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 56,
    backgroundColor: theme.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  primaryButtonText: {
    color: "#07191B",
    fontSize: Typography.size.md,
    fontWeight: "800",
  },
  bottomNote: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "center",
    marginTop: Spacing.three,
  },

  // IDENTITY
  identityScroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundElement,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.six,
  },
  identityIcon: {
    width: 66,
    height: 66,
    borderRadius: Radius.lg,
    backgroundColor: theme.backgroundElement,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  identityTitle: {
    color: theme.text,
    fontSize: Typography.size["2xl"],
    fontWeight: "800",
    marginBottom: Spacing.two,
  },
  identityDescription: {
    color: theme.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 24,
    marginBottom: Spacing.five,
  },
  inputLabel: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: Spacing.two,
  },
  usernameInputContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  usernamePrefix: {
    color: theme.primary,
    fontSize: Typography.size.md,
    fontWeight: "800",
  },
  usernameDivider: {
    width: 1,
    height: 25,
    backgroundColor: theme.border,
    marginHorizontal: Spacing.two,
  },
  usernameInput: {
    flex: 1,
    color: theme.text,
    fontSize: Typography.size.md,
    paddingVertical: Spacing.three,
  },
  usernameHint: {
    color: theme.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: Spacing.two,
  },
  rulesContainer: {
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  ruleText: {
    color: theme.textSecondary,
    fontSize: Typography.size.sm,
  },
  disabledButton: {
    opacity: 0.65,
  },

  // FEED
  feedContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  feedEyebrow: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  feedTitle: {
    color: theme.text,
    fontSize: Typography.size["3xl"],
    fontWeight: "800",
    marginTop: 3,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  groupSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  groupIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  groupLabel: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  groupName: {
    color: theme.text,
    fontSize: Typography.size.md,
    fontWeight: "700",
    marginTop: 3,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.two,
    marginBottom: Spacing.four,
  },
  composerAvatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  composerPlaceholder: {
    flex: 1,
    color: theme.textMuted,
    fontSize: Typography.size.sm,
    marginLeft: Spacing.two,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: Typography.size.lg,
    fontWeight: "800",
  },
  sortText: {
    color: theme.primary,
    fontSize: Typography.size.sm,
    fontWeight: "600",
  },
  postCard: {
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: theme.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  postAuthorInfo: {
    flex: 1,
    marginLeft: Spacing.two,
  },
  postAuthor: {
    color: theme.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  postTime: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    marginTop: 3,
  },
  postCaption: {
    color: theme.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 22,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  musicCard: {
    flexDirection: "row",
    backgroundColor: "#0B2022",
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border,
  },
  musicArtwork: {
    width: 112,
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
  },
  musicInfo: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "center",
  },
  musicType: {
    color: theme.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  musicTitle: {
    color: theme.text,
    fontSize: Typography.size.md,
    fontWeight: "800",
  },
  musicArtist: {
    color: theme.textSecondary,
    fontSize: Typography.size.xs,
    marginTop: 4,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    backgroundColor: theme.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
    marginTop: Spacing.two,
  },
  playButtonText: {
    color: "#07191B",
    fontSize: Typography.size.xs,
    fontWeight: "700",
  },
  voteContainer: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  voteHeading: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: Spacing.two,
  },
  voteActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 76,
    justifyContent: "center",
    backgroundColor: theme.backgroundSelected,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  activeUpvote: {
    backgroundColor: theme.primary,
  },
  activeDownvote: {
    backgroundColor: "#A3B8B8",
  },
  voteCount: {
    color: theme.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  activeVoteText: {
    color: "#07191B",
  },
  createCommunity: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  createCommunityIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  createCommunityInfo: {
    flex: 1,
    marginHorizontal: Spacing.two,
  },
  createCommunityTitle: {
    color: theme.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  createCommunityDescription: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    marginTop: 4,
  },
  demoNote: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
});
