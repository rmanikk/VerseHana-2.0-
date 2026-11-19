
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
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

import { Colors, Radius, Spacing, Typography } from "@/constants/theme";

const theme = Colors.dark;

type ContentType = "song" | "reel";

export default function CreatePostScreen() {
  const [contentType, setContentType] = useState<ContentType>("song");
  const [caption, setCaption] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Global Group");

  const handlePublish = () => {
    if (!caption.trim()) {
      Alert.alert("Add a caption", "Write something before publishing.");
      return;
    }

    Alert.alert(
      "Demo post ready",
      `Your ${contentType === "song" ? "song" : "VerseFlow reel"} post is ready for ${selectedGroup}. Backend publishing will be connected later.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleSelectGroup = () => {
    Alert.alert("Choose community", "More communities will be available soon.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Global Group",
        onPress: () => setSelectedGroup("Global Group"),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Post</Text>

        <TouchableOpacity onPress={handlePublish}>
          <Text style={styles.publishHeader}>Publish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionLabel}>WHAT ARE YOU SHARING?</Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setContentType("song")}
            style={[
              styles.typeOption,
              contentType === "song" && styles.selectedTypeOption,
            ]}
          >
            <Ionicons
              name="musical-notes"
              size={20}
              color={contentType === "song" ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.typeText,
                contentType === "song" && styles.selectedTypeText,
              ]}
            >
              Song
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setContentType("reel")}
            style={[
              styles.typeOption,
              contentType === "reel" && styles.selectedTypeOption,
            ]}
          >
            <Ionicons
              name="videocam"
              size={20}
              color={contentType === "reel" ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.typeText,
                contentType === "reel" && styles.selectedTypeText,
              ]}
            >
              VerseFlow Reel
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>YOUR CAPTION</Text>

        <View style={styles.captionContainer}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="What makes this music special to you?"
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
            style={styles.captionInput}
          />

          <Text style={styles.characterCount}>{caption.length}/500</Text>
        </View>

        <Text style={styles.sectionLabel}>
          {contentType === "song" ? "SELECT A SONG" : "SELECT A VERSEFLOW REEL"}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.mediaPicker}
          onPress={() =>
            Alert.alert(
              contentType === "song" ? "Select a song" : "Select a reel",
              "Your VerseFlow library integration will be added in a later stage."
            )
          }
        >
          <View style={styles.mediaPickerIcon}>
            <Ionicons
              name={contentType === "song" ? "musical-note" : "play"}
              size={25}
              color={theme.primary}
            />
          </View>

          <View style={styles.mediaPickerText}>
            <Text style={styles.mediaPickerTitle}>
              {contentType === "song"
                ? "Choose from your music"
                : "Choose from VerseFlow"}
            </Text>
            <Text style={styles.mediaPickerDescription}>
              {contentType === "song"
                ? "Select a song from your VerseHana library"
                : "Select a reel you've discovered in VerseFlow"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>SHARE WITH</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.groupSelector}
          onPress={handleSelectGroup}
        >
          <View style={styles.groupIcon}>
            <Ionicons name="globe-outline" size={21} color={theme.primary} />
          </View>

          <View style={styles.groupInfo}>
            <Text style={styles.groupSmallLabel}>COMMUNITY</Text>
            <Text style={styles.groupName}>{selectedGroup}</Text>
          </View>

          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.previewSection}>
          <Text style={styles.sectionLabel}>POST PREVIEW</Text>

          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewAvatar}>
                <Ionicons
                  name="person"
                  size={18}
                  color={theme.background}
                />
              </View>

              <View>
                <Text style={styles.previewUsername}>Your Pulse identity</Text>
                <Text style={styles.previewGroup}>{selectedGroup}</Text>
              </View>
            </View>

            <Text style={styles.previewCaption}>
              {caption.trim() || "Your caption will appear here..."}
            </Text>

            <LinearGradient
              colors={["#1C6665", "#123B40", "#102B2D"]}
              style={styles.previewMedia}
            >
              <Ionicons
                name={contentType === "song" ? "musical-notes" : "play-circle"}
                size={35}
                color="#58D8E8"
              />

              <Text style={styles.previewMediaText}>
                {contentType === "song" ? "Song preview" : "VerseFlow reel"}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.publishButton}
          onPress={handlePublish}
        >
          <Ionicons name="paper-plane-outline" size={19} color="#07191B" />
          <Text style={styles.publishButtonText}>Publish Post</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your community can discover and vote on your shared music.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: theme.text,
    fontSize: Typography.size.lg,
    fontWeight: "800",
  },

  publishHeader: {
    color: theme.primary,
    fontSize: Typography.size.sm,
    fontWeight: "800",
  },

  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.seven,
  },

  sectionLabel: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },

  typeSelector: {
    flexDirection: "row",
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
  },

  typeOption: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: Radius.sm,
  },

  selectedTypeOption: {
    backgroundColor: theme.backgroundSelected,
    borderWidth: 1,
    borderColor: theme.primary,
  },

  typeText: {
    color: theme.textMuted,
    fontSize: Typography.size.sm,
    fontWeight: "600",
  },

  selectedTypeText: {
    color: theme.primary,
    fontWeight: "800",
  },

  captionContainer: {
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.md,
    padding: Spacing.three,
    minHeight: 140,
  },

  captionInput: {
    color: theme.text,
    fontSize: Typography.size.md,
    lineHeight: 23,
    minHeight: 90,
  },

  characterCount: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "right",
    marginTop: Spacing.two,
  },

  mediaPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },

  mediaPickerIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },

  mediaPickerText: {
    flex: 1,
    marginHorizontal: Spacing.two,
  },

  mediaPickerTitle: {
    color: theme.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  mediaPickerDescription: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    marginTop: 4,
  },

  groupSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },

  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: theme.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },

  groupInfo: {
    flex: 1,
    marginLeft: Spacing.two,
  },

  groupSmallLabel: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  groupName: {
    color: theme.text,
    fontSize: Typography.size.md,
    fontWeight: "700",
    marginTop: 3,
  },

  previewSection: {
    marginTop: Spacing.two,
  },

  previewCard: {
    backgroundColor: theme.backgroundElement,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  previewAvatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  previewUsername: {
    color: theme.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  previewGroup: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    marginTop: 3,
  },

  previewCaption: {
    color: theme.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: 22,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },

  previewMedia: {
    minHeight: 110,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },

  previewMediaText: {
    color: "#D5F5F2",
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  publishButton: {
    minHeight: 54,
    backgroundColor: theme.primary,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: Spacing.five,
  },

  publishButtonText: {
    color: "#07191B",
    fontSize: Typography.size.md,
    fontWeight: "800",
  },

  footerNote: {
    color: theme.textMuted,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    textAlign: "center",
    marginTop: Spacing.three,
  },
});
