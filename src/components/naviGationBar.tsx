import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import HomeScreen from '../screens/homeScreen';
import CoursePage from '../screens/Courses';

function TabBar({state, descriptors, navigation}: any){
  const { colors } = useTheme();
  const {buildHref  } = useLinkBuilder();
return(
    <View style={{flexDirection:'row'}}>
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
            style={{ flex: 1 }}
          >
            <Text style={{ color: focused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </PlatformPressable>
        );
        })}
        
    </View>
)

}

const Tabs = createBottomTabNavigator({
    tabBar: (props) => <TabBar{...props}/>,
    screens:{
        Home: HomeScreen,
        Courses: CoursePage
    },
})