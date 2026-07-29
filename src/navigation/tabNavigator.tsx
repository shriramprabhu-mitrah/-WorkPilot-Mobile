import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../types/navigationTypes";
import HomeScreen from "../screens/homeScreen";
import ProfileScreen from "../screens/profileScreen";
import SearchScreen from "../screens/searchScreen";
import NotificationsScreen from "../screens/notificationScreen";
import Ionicons from "@react-native-vector-icons/ionicons";
import ProjectScreen from "../screens/projectScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0052CC',
                tabBarInactiveTintColor: '#6B7280',
                tabBarLabelStyle: {
                    fontSize: 14,
                },}}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} /> }}
            />
            <Tab.Screen
                name="Projects"
                component={ProjectScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="folder-open-outline" size={22} color={color} /> }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} /> }}
            />
            <Tab.Screen
                name="Inbox"
                component={NotificationsScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={22} color={color} /> }}
            />
            <Tab.Screen
                name="You"
                component={ProfileScreen}
                options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} /> }}
            />
        </Tab.Navigator>
    )
}
export default TabNavigator