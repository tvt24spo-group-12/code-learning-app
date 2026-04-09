import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { createGlobalStyles } from "../theme/globalStyles";
import { getTheme } from "../theme/theme";
import {
  CourseActivity,
  getRecentCourseActivity,
} from "../services/activityService";

export default function HomeScreen() {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  const colors = getTheme(theme);
  const navigation = useNavigation<any>();
  const [activities, setActivities] = useState<CourseActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentCourseActivity()
      .then((data) => {
        setActivities(data);
      })
      .catch((error) => {
        console.error("Error fetching activity:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <View
      style={[
        globalStyles.screenContainer,
        { paddingTop: 20, paddingHorizontal: 16 },
      ]}
    >
      <Text style={globalStyles.heading}>Kurssit</Text>
      <Text style={[globalStyles.subheading, { marginTop: 8 }]}>
        Viimeisimmät kurssit
      </Text>

      {loading ? (
        <View style={globalStyles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activities.length === 0 ? (
        <Text style={globalStyles.bodyText}>
          Ei viimeaikaista aktiviteettia
        </Text>
      ) : (
        activities.map((activity) => (
          <TouchableOpacity
            key={activity.courseId}
            style={globalStyles.card}
            onPress={() => {
              navigation.navigate("CoursePage", {
                courseId: activity.courseId,
              });
            }}
          >
            <Text style={globalStyles.subheading}>{activity.courseName}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={globalStyles.bodyText}>
                {activity.completedExercises}/{activity.totalExercises}{" "}
                exercises
              </Text>
              <Text
                style={[globalStyles.bodyText, { color: colors.textSecondary }]}
              >
                {activity.lastAccessed.toLocaleDateString()}
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 3,
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${(activity.completedExercises / activity.totalExercises) * 100}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 3,
                }}
              />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}
