
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors, Radius } from "@/constants/theme";

const colors = Colors.dark;

type Playlist = {
  id: string;
  name: string;
  songs: number;
};

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setPlaylistName("");
    setEditingId(null);
    setModalVisible(true);
  };

  const openRenameModal = (playlist: Playlist) => {
    setPlaylistName(playlist.name);
    setEditingId(playlist.id);
    setModalVisible(true);
  };

  const savePlaylist = () => {
    const cleanName = playlistName.trim();

    if (!cleanName) {
      Alert.alert("Playlist name required", "Please enter a name.");
      return;
    }

    if (editingId) {
      setPlaylists((current) =>
        current.map((playlist) =>
          playlist.id === editingId
            ? { ...playlist, name: cleanName }
            : playlist
        )
      );
    } else {
      setPlaylists((current) => [
        ...current,
        {
          id: `${Date.now()}`,
          name: cleanName,
          songs: 0,
        },
      ]);
    }

    setModalVisible(false);
    setPlaylistName("");
    setEditingId(null);
  };

  const deletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      "Delete playlist?",
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setPlaylists((current) =>
              current.filter((item) => item.id !== playlist.id)
            ),
        },
      ]
    );
  };

  const showPlaylistMenu = (playlist: Playlist) => {
    Alert.alert(playlist.name, "Manage your playlist", [
      {
        text: "Rename",
        onPress: () => openRenameModal(playlist),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePlaylist(playlist),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Playlists</Text>
          <Text style={styles.subtitle}>
            Your personal song collections.
          </Text>
        </View>

        <Pressable
          onPress={openCreateModal}
          style={styles.addButton}
        >
          <Ionicons name="add" size={25} color={colors.background} />
        </Pressable>
      </View>

      {/* PLAYLIST COUNT */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
        </Text>
        <Text style={styles.summaryHint}>Songs only</Text>
      </View>

      {/* PLAYLIST LIST */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="musical-notes"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Your playlists start here
            </Text>

            <Text style={styles.emptyDescription}>
              Create a playlist and bring your favourite songs together.
            </Text>

            <Pressable
              onPress={openCreateModal}
              style={styles.emptyButton}
            >
              <Ionicons name="add" size={19} color={colors.background} />
              <Text style={styles.emptyButtonText}>
                Create Playlist
              </Text>
            </Pressable>
          </View>
        ) : (
          playlists.map((playlist) => (
            <View key={playlist.id} style={styles.playlistRow}>
              <Pressable
                style={styles.playlistMain}
                onPress={() =>
                  Alert.alert(
                    playlist.name,
                    "Adding songs and opening playlist details will be implemented next."
                  )
                }
              >
                <View style={styles.cover}>
                  <Ionicons
                    name="musical-notes"
                    size={26}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.playlistMeta}>
                    {playlist.songs} songs
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => showPlaylistMenu(playlist)}
                style={styles.menuButton}
                hitSlop={10}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* CREATE / RENAME MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Rename Playlist" : "Create Playlist"}
            </Text>

            <Text style={styles.modalDescription}>
              Give your song collection a name.
            </Text>

            <TextInput
              value={playlistName}
              onChangeText={setPlaylistName}
              placeholder="Playlist name"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
              maxLength={40}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={savePlaylist}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={savePlaylist}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>
                  {editingId ? "Save Changes" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 13,
    marginBottom: 25,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    marginHorizontal: 22,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  summaryHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 35,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 390,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: "#174442",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 9,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 270,
    marginBottom: 22,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: 19,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "700",
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 11,
  },
  playlistMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  cover: {
    width: 58,
    height: 58,
    borderRadius: 13,
    backgroundColor: "#174442",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: {
    flex: 1,
    gap: 6,
  },
  playlistName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  playlistMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  menuButton: {
    width: 35,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  modalCard: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 7,
    marginBottom: 20,
  },
  modalInput: {
    height: 49,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: colors.background,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: colors.primary,
  },
  saveText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "700",
  },
});
