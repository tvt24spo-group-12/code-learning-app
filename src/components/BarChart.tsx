import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getTheme, ThemeMode } from "../theme/theme";

type Props = {
  labels: string[];
  values: number[];
  theme: ThemeMode;
};

const BAR_WIDTH = 22;
const BAR_GAP = 8;
const CHART_HEIGHT = 140;

export default function BarChart({ labels, values, theme }: Props) {
  const colors = getTheme(theme);
  const max = Math.max(1, ...values);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        persistentScrollbar
        scrollEventThrottle={32}
      >
        <View style={styles.plot}>
          {values.map((v, i) => (
            <View key={i} style={styles.column}>
              <View style={styles.barArea}>
                {v > 0 && (
                  <View
                    style={{
                      width: BAR_WIDTH,
                      height: (v / max) * CHART_HEIGHT,
                      backgroundColor: colors.primary,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      alignItems: 'center',
                      paddingTop: 2,
                    }}
                  >
                    <Text style={styles.barValue}>{v}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {labels[i]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  plot: {
    flexDirection: "row",
    paddingRight: 12,
  },
  column: {
    alignItems: "center",
    marginRight: BAR_GAP,
  },
  barArea: {
    height: CHART_HEIGHT,
    width: BAR_WIDTH,
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    width: BAR_WIDTH + 4,
    textAlign: "center",
  },
  scrollHint: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
});
