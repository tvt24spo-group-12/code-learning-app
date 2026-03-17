import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform,StyleSheet } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import HomeScreen from '../screens/homeScreen';
import CoursePage from '../screens/Courses';
import AccountPage from '../screens/account';
import SettingsPage from '../screens/settings';
import {Menu, Home, CircleUser, Settings} from 'lucide-react-native'
const Tab = createBottomTabNavigator();

function TabBar({state, descriptors, navigation}: any){
  const { colors } = useTheme();
  const {buildHref  } = useLinkBuilder();
return(
    <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number)=>{
            const {options} = descriptors[route.key];
            const label=
            options.tabBarLabel !== undefined
            ? options.tabBarLabel 
            : options.title !== undefined
            ? options.title 
            :route.name;

            const focused = state.index===index
            const onPress=()=>{
                const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault:true,
                });
                if(!focused && !event.defaultPrevented){
                    navigation.navigate(route.name, route.params)
                }
            };
            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            }
            return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {(label === "CoursePage")&&<Menu/>}
           {(label=== "Home") && <Home/>}
            {(label === "AccountPage")&& <CircleUser/>}
                {(label === "SettingsPage") && <Settings/>}
             
          </PlatformPressable>
        );
        })}
        
    </View>
)

}
export default function Tabs() {
  return (
  
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} initialRouteName='Home'>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CoursePage" component={CoursePage} />
      <Tab.Screen name='AccountPage' component={AccountPage}/>
      <Tab.Screen name='SettingsPage' component={SettingsPage}/>

    </Tab.Navigator>
   
  );
}



const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'absolute', // stick to bottom
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // safe area
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});