import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {countAverage, successRate} from '../services/mathService'
import {
  fetchCompletedTasks,
  computeUserStats,
  tasksByDayOfMonth,
  tasksByMonth,
  tasksByYear,
  CompletedTask,
  UserStats,
} from '../services/mathService';
import BarChart from '../components/BarChart';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';
import { getTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Activity,
  BarChart3,
  Rocket,
  Code,
  Smartphone,
  ChevronRight,
  Group,
} from 'lucide-react-native';
const SPACING = { xl: 20, lg: 16, md: 12 };

type ChartMode = 'day' | 'month' | 'year';

const CHART_MODES: { key: ChartMode; label: string }[] = [
  { key: 'day', label: 'Päivittäinen' },
  { key: 'month', label: 'Kuukausittainen' },
  { key: 'year', label: 'Vuosittainen' },
];

const trendLabel = (slope: number) =>
  slope < -0.01 ? '↓ Paranee' : slope > 0.01 ? '↑ Nousee' : '→ Vakaa';

const buildTiles = (s: UserStats | null) => [
  { label: 'Suoritetut tehtävät', value: String(s?.totalTasks ?? 0) },
  { label: 'Aktiiviset päivät', value: String(s?.activeDays ?? 0) },
  { label: 'Nykyinen putki', value: `${s?.currentStreak ?? 0} pv` },
  { label: 'Pisin putki', value: `${s?.longestStreak ?? 0} pv` },
  { label: 'Mediaani yrityksiä', value: (s?.medianAttempts ?? 0).toFixed(1) },
  { label: 'Keskihajonta', value: (s?.stdDevAttempts ?? 0).toFixed(2) },
  { label: 'Tehtäviä / viikko', value: (s?.weeklyAverage ?? 0).toFixed(1) },
  { label: 'Oppimistrendi', value: s ? trendLabel(s.improvementSlope) : '–' },
];

/**
Account page
sivulla näytetään käyttäjän tiedot, aktiivisuus,groupit ja suositellut kurssit .
 */
export default function AccountPage() {
  const navigation = useNavigation<any>();
   const [successrate,setSuccessRate] = useState<number>(0)
   const[avgAttempts, setAvgAttempts] = useState<number>(0)
   const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
   const [userStats, setUserStats] = useState<UserStats | null>(null);
   const [chartMode, setChartMode] = useState<ChartMode>('month');
  // Aktiivinen välilehti (Yleiskatsaus oletuksena)
 const [activeTab, setActiveTab] = useState('Yleiskatsaus');

  // Välilehtien konfiguraatio
  const tabs = [
    { name: 'Yleiskatsaus', icon: Code },
    { name: 'Tilastot', icon: BarChart3 },
    { name: 'Groups', icon: Group },
  ];
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  const colors = getTheme(theme);

  const [formData, setFormData] = useState({
    username: '',
    joinDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  //väliaikainen data kunnes saadaan oikea data firebasesta
  const progress = 50;
  const latestCourse = "Python Basics";
const totalAttempts = async()=>{
   const attempts = await countAverage(String(userProfile?.uid))
    const success = await successRate(String(userProfile?.uid))
  setAvgAttempts(Number(attempts))
    setSuccessRate(Number(success))
   console.log('on average it takes you ',attempts, ' attempts to complete a task and your successrate is ', `${success}%`)
}
  //useEffect haetaa käyttäjän datat firebasesta.
  React.useEffect(() => {
    
   totalAttempts()
   
    console.log()
    if (userProfile) {
      let displayDate = "Liittymis aika tuntematon";

      // Katsotaan onko createdAt olemassa ja onko siinä 'seconds'
      if (userProfile.createdAt && userProfile.createdAt.seconds) {
        const date = new Date(userProfile.createdAt.seconds * 1000);
        displayDate = `Jäsen vuodesta ${date.getFullYear()}`;
      }

      setFormData({
        username: userProfile.username || '',
        joinDate: displayDate,
      });
    }
  }, [userProfile]);

  React.useEffect(() => {
    const loadStats = async () => {
      if (!userProfile?.uid) return;
      const tasks = await fetchCompletedTasks(String(userProfile.uid));
      setCompletedTasks(tasks);
      setUserStats(computeUserStats(tasks));
    };
    loadStats();
  }, [userProfile]);

  const chartSeries = useMemo(() => {
    if (chartMode === 'day') return tasksByDayOfMonth(completedTasks);
    if (chartMode === 'month') return tasksByMonth(completedTasks);
    return tasksByYear(completedTasks);
  }, [chartMode, completedTasks]);

  const tiles = buildTiles(userStats);

  return (
    <View style={globalStyles.screenContainer}>

      {/* Yläosan banneri ja profiilikuva osio */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/account-page-banner.png')}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.pageTitle}>Minun Profiili</Text>

          {/* Käyttäjän tiedot (Kuva, Nimi, Liittymisaika) */}
          <View style={styles.profileInfoContainer}>
            {/* Profiilikuva kuva napattu suoraa netistä tähän voidaan laittaa vaikka firebasen ne kuva hommelit */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/170x/f1/59/70/f1597088385c013a6b3121042750ed3d.jpg' }}
                  style={styles.avatar}
                />
              </View>
            </View>

            <Text
              style={styles.userName}>
            {formData.username}
            </Text>

            <Text
              style={styles.memberSince}>
              {formData.joinDate}
            </Text>

          </View>
        </View>
      </View>

{/* "Välilehtivalikko"*/}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity 
            key={tab.name} 
            style={styles.tabItem}
           onPress={() => setActiveTab(tab.name)}
            >
              <tab.icon 
              size={22} 
              color={activeTab === tab.name ? colors.primary : colors.textSecondary} />

              <Text style={[
                styles.tabText, 
               { color: activeTab === tab.name ? colors.primary : colors.textSecondary },
              activeTab === tab.name && styles.activeTabText
              ]}>
              {tab.name}
             </Text>
              {activeTab === tab.name && (
                <View style={[styles.activeIndicator, { width: 100, backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

{/* Yleiskatsaus sivu */}
         <View style={[
          {backgroundColor: colors.surface},
          styles.activityBackground]}>
            {activeTab === 'Yleiskatsaus' && (
            <View style={styles.section}>
            <Text style={[{color: colors.text}, styles.sectionTitle]}>Viimeisin aktiviteetti</Text>

          
        <View style={[
          {backgroundColor: colors.background},
          styles.activityCard]}>
  {/* VASEN PUOLI */}
          <View style={styles.activityContent}>
            <Text style={[{color: colors.text}, styles.courseHeader]}>
              Nykyinen kurssi:
              </Text>

            <Text style={[{color: colors.text},styles.courseTitle]}>
              {latestCourse}
              </Text>
            
            <View style={styles.progressContainer}>
              <Text style={[{color: colors.text}, styles.progressText]}>
                Edistyminen: {progress}%
                </Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View 
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: colors.primary } 
              ]} 
            />
              </View>
            </View>
          </View>
  {/* OIKEA PUOLI */}
          <View style={styles.rocketIconContainer}>
            <Rocket size={48} color={colors.primary} />
          </View>
         </View>
     {/* tähän tulee vielä jatkoa esim suositut kurssit yms */}
         </View>)}

{/* Tilastot sivu*/}
        {activeTab === 'Tilastot' && (
       
          <View style={styles.section}>
            <Text style={[{color: colors.text}, styles.sectionTitle]}>Tilastot</Text>
            <Text style={{color: colors.text}}>it takes you on average {avgAttempts} attempts to complete a task</Text>
            <Text style={{color: colors.text}}>your success rate is {successrate}%</Text>

            <ScrollView
              style={styles.statsScroll}
              contentContainerStyle={styles.statsScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.chartToggleRow}>
                {CHART_MODES.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setChartMode(key)}
                    style={[
                      styles.chartToggleBtn,
                      {
                        backgroundColor: chartMode === key ? colors.primary : colors.surface,
                        borderColor: chartMode === key ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: chartMode === key ? '#fff' : colors.text, fontWeight: '600' }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <BarChart
                labels={chartSeries.labels}
                values={chartSeries.values}
                theme={theme}
              />

              <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                Edistymismittarit
              </Text>

              <View style={styles.statsGrid}>
                {tiles.map(({ label, value }) => (
                  <View
                    key={label}
                    style={[styles.statTile, { backgroundColor: colors.background, borderColor: colors.border }]}
                  >
                    <Text style={[styles.statTileLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <Text style={[styles.statTileValue, { color: colors.text }]}>{value}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
{/* Groups sivu*/}
        {activeTab === 'Groups' && (
          <View style={styles.section}>
            <Text style={[{color: colors.text}, styles.sectionTitle]}>Groups</Text>
            <Text style={{color: colors.text}}>Groups-osio on vielä kehitteillä.</Text>
          </View>
        )} 

     </View> 
      </View>    
     
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 400,
    width: '100%',
    position: 'relative',
    marginTop: 0,
  },
  headerImage: {
    width: '100%',
    marginTop: -7,
     height: 410,
     top: 0,
    position: 'absolute',
    resizeMode: 'cover',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 80,
    position: 'relative',
  },
  pageTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  profileInfoContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarBorder: {
    width: 150,
    height: 150,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: 'white',
    padding: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: {
    width: 150,
    height: 150
  },
  userName: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  memberSince: {
    color: 'black',
    fontSize: 14,
    marginTop: 2,
  },
   tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 14,
    marginTop: 3,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
    activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 30,
    height: 3,
    backgroundColor: 'colors.primary',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
   section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  activityBackground: {
    paddingBottom: SPACING.lg,
  },
  
  activityCard: {
  borderRadius: 20,
  padding: 20,
  flexDirection: 'row', // Pitää tekstin vasemmalla ja raketin oikealla
  alignItems: 'center', // Keskittää raketin pystysuunnassa suhteessa tekstiin
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
},
  activityContent: {
    flex: 1,
  },
  courseHeader: {
    fontSize: 14,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 6,
  },
  // Edistymispalkin tyhjä tausta
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  // Edistymispalkin täyttö (liukuväri)
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rocketIconContainer: {
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10, 
    overflow: 'visible', 
  },
  
  scrollView: {
    flex: 1,
  },
  statsScroll: {
    marginTop: SPACING.md,
    maxHeight: Dimensions.get('window').height - 560,
  },
  statsScrollContent: {
    paddingBottom: 100,
  },
  chartToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chartToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statTile: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  statTileLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statTileValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
