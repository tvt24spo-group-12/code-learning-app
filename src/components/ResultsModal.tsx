import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { JudgingResult } from "../types/codingProblem";

interface ResultsModalProps {
  visible: boolean;
  onClose: () => void;
    results: JudgingResult[] | null;
}  

export default function ResultsModal({ visible, onClose, results }: ResultsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Testien tulokset</Text>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {results?.length ? (
              results.map((r, i) => (
                <View key={i} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Test {i + 1} {r.passed ? "✅" : "❌"}
                  </Text>

                  <Text style={styles.label}>Syöte</Text>
                  <Text style={styles.code}>{r.input}</Text>

                  <Text style={styles.label}>Tuloste</Text>
                  <Text style={styles.code}>{r.output}</Text>

                  <Text
                    style={[
                      styles.status,
                      { color: r.passed ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {r.passed ? "Läpäisty" : "Epäonnistui"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Ei tuloksia saatavilla.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  container: {
    height: "85%",
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },

  closeBtn: {
    padding: 6,
  },

  closeText: {
    fontSize: 18,
    color: "#94a3b8",
  },

  content: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },

  label: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 6,
  },

  code: {
    color: "#e5e7eb",
    fontFamily: "monospace",
    marginTop: 2,
  },

  status: {
    marginTop: 10,
    fontWeight: "600",
  },

  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 40,
  },
});