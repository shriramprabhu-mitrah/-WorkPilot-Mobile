import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigationTypes";

const stats = [
    {
        label: "Assigned",
        value: "12",
        color: "#0052CC",
    },
    {
        label: "Completed",
        value: "47",
        color: "#36B37E",
    },
    {
        label: "In Review",
        value: "3",
        color: "#6554C0",
    },
    {
        label: "Overdue",
        value: "2",
        color: "#DE350B",
    },
];

const recentActivity = [
    {
        id: 1,
        action: "Updated status on",
        target: "CLOUD-330",
        detail: "→ In Progress",
        time: "2h ago",
        color: "#0052CC",
    },
    {
        id: 2,
        action: "Commented on",
        target: "API-67",
        detail: '"Will have a fix by EOD"',
        time: "3h ago",
        color: "#6B778C",
    },
    {
        id: 3,
        action: "Created issue",
        target: "MOB-129",
        detail: "Dark mode flicker on navigation",
        time: "Yesterday",
        color: "#36B37E",
    },
    {
        id: 4,
        action: "Closed",
        target: "CLOUD-320",
        detail: "Circuit breaker implementation",
        time: "2 days ago",
        color: "#36B37E",
    },
];

const teams = [
    {
        name: "Cloud",
        color: "#0052CC",
    },
    {
        name: "Mobile",
        color: "#6554C0",
    },
    {
        name: "Platform",
        color: "#FF5630",
    },
];

const quickLinks = [
    {
        label: "Starred issues",
        icon: "star-outline",
        path: "Home",
        color: "#FFAB00",
    },
    {
        label: "My open issues",
        icon: "checkbox-outline",
        path: "Home",
        color: "#0052CC",
    },
    {
        label: "Settings",
        icon: "settings-outline",
        path: "Settings",
        color: "#6B778C",
    },
];
const ProfileScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    return (
        <SafeAreaView className="flex-1 bg-[#F4F5F7]" edges={["top"]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >

                <View className="bg-[#0052CC] p-4 pb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-white text-[20px] font-bold">
                            Profile
                        </Text>

                        <TouchableOpacity
                            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Ionicons
                                name="settings-outline"
                                size={18}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-end gap-4">
                        <View className="relative">
                            <View className="w-20 h-20 rounded-full bg-[#FFAB00] items-center justify-center">
                                <Text className="text-white text-3xl font-bold">
                                    AJ
                                </Text>
                            </View>

                            <TouchableOpacity className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-gray-300 items-center justify-center">
                                <Ionicons
                                    name="create-outline"
                                    size={14}
                                    color="#0052CC"
                                />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-white text-[20px] font-bold">
                                Alex Johnson
                            </Text>

                            <Text className="text-blue-200 text-[15px]">
                                Senior Software Engineer
                            </Text>

                            <Text className="text-blue-300 text-[14px] mt-1">
                                alex.johnson@company.com
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-4 -mt-4 mb-4">
                    <View className="bg-white rounded-2xl border border-gray-200 flex-row justify-between py-4">
                        {stats.map((item) => (
                            <View
                                key={item.label}
                                className="flex-1 items-center"
                            >

                                <Text
                                    className="text-[20px] font-bold mt-1"
                                    style={{ color: item.color }}
                                >
                                    {item.value}
                                </Text>

                                <Text className="text-[12px] text-gray-500 text-center mt-1">
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="px-4 mb-5">
                    <Text className="text-[15px] font-semibold text-[#172B4D] mb-3">
                        Teams & Projects
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {teams.map((team) => (
                            <View
                                key={team.name}
                                className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2 mr-2"
                            >
                                <View
                                    className="w-5 h-5 rounded-md mr-2"
                                    style={{
                                        backgroundColor: team.color,
                                    }}
                                />

                                <Text className="text-[#172B4D] text-[15px] font-medium">
                                    {team.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-4 mb-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-semibold text-[15px] text-[#172B4D]">
                            Recent Activity
                        </Text>

                        <TouchableOpacity>
                            <Text className="text-[#0052CC] text-[14px] font-medium">
                                View all
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-white rounded-xl border border-gray-200">
                        {recentActivity.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                className={`flex-row px-5 py-4 items-start ${index !== recentActivity.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                    }`}
                            >
                                <View
                                    className="w-2 h-2 rounded-full mt-2 mr-3"
                                    style={{
                                        backgroundColor: item.color,
                                    }}
                                />

                                <View className="flex-1">
                                    <Text className="text-[#172B4D] text-[15px]">
                                        {item.action}{" "}
                                        <Text className="text-[#0052CC] font-bold">
                                            {item.target}
                                        </Text>
                                    </Text>

                                    <Text
                                        className="text-[14px] text-gray-500 mt-1"
                                        numberOfLines={1}
                                    >
                                        {item.detail}
                                    </Text>
                                </View>

                                <Text className="text-[13px] text-gray-400">
                                    {item.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-4 mb-5">
                    <View className="bg-white rounded-xl border border-gray-200">
                        {quickLinks.map((item, index) => (
                            <TouchableOpacity
                                key={item.label}
                                className={`flex-row items-center px-4 py-4 ${index !== quickLinks.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                    }`}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={20}
                                    color={item.color}
                                />

                                <Text className="flex-1 pl-4 text-[#172B4D] text-[15px] font-medium">
                                    {item.label}
                                </Text>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color="#B3BAC5"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-4">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('login')}
                        className="border-2 border-gray-300 rounded-xl py-4 flex-row gap-2 items-center justify-center"
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={18}
                            color="#DE350B"
                        />

                        <Text className="text-[#DE350B] text-[15px] font-semibold">
                            Log out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;