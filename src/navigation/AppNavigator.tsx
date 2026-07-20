import React, { useState } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigationTypes";
import LoginScreen from "../screens/login";
import SignUpScreen from "../screens/signUp";
import VerifyEmailScreen from "../screens/verifyEmail";
import ForgotPassword from "../screens/forgetPassword";
import ResetPassword from "../screens/resetPassword";
import TapNavigator from "./tapNavigator";
// import ChatScreen from "../components/Chat/ChatScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {

    // const [authenticated, setAuthenticated] = useState<boolean>(true);
    // const { user } = useAuth();

    return (
        <NavigationContainer>

            {/* {user ? (
                <Stack.Navigator initialRouteName="HomeTabs" screenOptions={{ headerShown: false, animation: 'none' }}>
                    <Stack.Screen name="HomeTabs" component={HomeTabs} />
                    <Stack.Screen name="AccountAndCard" component={AccountAndCard} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false, animation: 'none' }}>
                    <Stack.Screen name="SignIn" component={SignInScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="ForgotPassword" component={FortgotPassword} />
                    <Stack.Screen name="SuccessfullScreen" component={SuccessfullScreen} />
                </Stack.Navigator>
            )} */}
            <Stack.Navigator initialRouteName="login" screenOptions={{ headerShown: false, animation: 'none' }}>
                <Stack.Screen name="login" component={LoginScreen} />
                <Stack.Screen name="signUp" component={SignUpScreen} />
                <Stack.Screen name="verifyEmail" component={VerifyEmailScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="resetPassword" component={ResetPassword} />
                <Stack.Screen name="HomeTabs" component={TapNavigator} />
                {/*<Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="SuccessfullScreen" component={SuccessfullScreen} /> */}

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;