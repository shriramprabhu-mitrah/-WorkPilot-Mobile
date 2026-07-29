import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigationTypes";
import LoginScreen from "../screens/login";
import SignUpScreen from "../screens/signUp";
import VerifyEmailScreen from "../screens/verifyEmail";
import ForgotPassword from "../screens/forgetPassword";
import ResetPassword from "../screens/resetPassword";
import TabNavigator from "./tabNavigator";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="login" screenOptions={{ headerShown: false, animation: 'none' }}>
                <Stack.Screen name="login" component={LoginScreen} />
                <Stack.Screen name="signUp" component={SignUpScreen} />
                <Stack.Screen name="verifyEmail" component={VerifyEmailScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="resetPassword" component={ResetPassword} />
                <Stack.Screen name="HomeTabs" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;