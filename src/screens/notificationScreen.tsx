import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

const notifications = [
    {
        id: 1,
        type: "mention",
        read: false,
        time: "2 min ago",
        avatar: "MK",
        color: "#6554C0",
        actor: "Maya Kim",
        action: "mentioned you in",
        target: "CLOUD-330",
        preview: "Looking at the auth service logs, @alex the token TTL might be causing the refresh issue.",
        issueId: "CLOUD-330",
    },
    {
        id: 2,
        type: "assigned",
        read: false,
        time: "1 hour ago",
        avatar: "SR",
        color: "#FF5630",
        actor: "Sam Rivera",
        action: "assigned you to",
        target: "API-72",
        preview: "Update OpenAPI spec for v3 endpoints",
        issueId: "API-72",
    },
    {
        id: 3,
        type: "comment",
        read: false,
        time: "2 hours ago",
        avatar: "JL",
        color: "#36B37E",
        actor: "Jordan Lee",
        action: "commented on",
        target: "MOB-128",
        preview: "The push notification service is ready for testing on both iOS and Android.",
        issueId: "MOB-128",
    },
    {
        id: 4,
        type: "status",
        read: true,
        time: "Yesterday",
        avatar: "MK",
        color: "#6554C0",
        actor: "Maya Kim",
        action: "moved",
        target: "DS-14",
        preview: "Design token audit → In Review",
        issueId: "DS-14",
    },
    {
        id: 5,
        type: "mention",
        read: true,
        time: "Yesterday",
        avatar: "SR",
        color: "#FF5630",
        actor: "Sam Rivera",
        action: "mentioned you in",
        target: "CLOUD-302",
        preview: "@alex can you review the Terraform plan before we apply?",
        issueId: "CLOUD-302",
    },
    {
        id: 6,
        type: "assigned",
        read: true,
        time: "2 days ago",
        avatar: "JL",
        color: "#36B37E",
        actor: "Jordan Lee",
        action: "assigned you to",
        target: "MOB-100",
        preview: "Offline mode support implementation",
        issueId: "MOB-100",
    },
    {
        id: 7,
        type: "review",
        read: true,
        time: "2 days ago",
        avatar: "MK",
        color: "#6554C0",
        actor: "Maya Kim",
        action: "requested review on",
        target: "API-67",
        preview: "Rate limiting documentation updates ready for review",
        issueId: "API-67",
    },
];

const typeIcons: Record<string, { icon: string; bg: string }> = {
    mention: { icon: "at", bg: "#0052CC" },
    assigned: { icon: "arrow-forward", bg: "#FFAB00" },
    comment: { icon: "reader", bg: "#36B37E" },
    status: { icon: "arrow-up-sharp", bg: "#6554C0" },
    review: { icon: "eye", bg: "#FF5630" },
};

export default function NotificationsScreen() {
    const [notifs, setNotifs] = useState(notifications);
    const [tab, setTab] = useState<"all" | "unread">("all");

    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    const displayed = tab === "unread" ? notifs.filter(n => !n.read) : notifs;
    const unreadCount = notifs.filter(n => !n.read).length;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View className="flex-1">
                    <View className="flex-row items-center justify-between bg-white items-center p-6 border-b border-[#DFE1E6] gap-4">
                        <Text className="text-[20px] font-bold text-[#172B4D]">Notifications</Text>
                        <View className="flex-row gap-6 items-center">
                            <TouchableOpacity
                                onPress={markAllRead}
                            >
                                <Text className="text-[16px] font-medium text-[#0052CC]">All read</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="settings-outline" size={22} className="text-[#172B4D]" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="bg-white border-b border-[#DFE1E6] flex-row">
                        {(["all", "unread"] as const).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTab(t)}
                                className={`flex-1 py-4 flex-row items-center gap-2 justify-center ${tab === t ? "border-[#0052CC] border-b-2 text-[#0052CC]" : "text-[#6B778C]"}`}
                            >
                                <Text className={`text-[15px] font-semibold ${tab === t ? "text-[#0052CC]" : "text-[#6B778C]"}`}>{t === "unread" ? "Unread" : "All"}</Text>
                                {t === "unread" && unreadCount > 0 && (
                                    <View className="w-6 h-6 bg-[#DE350B] rounded-full items-center justify-center">
                                        <Text className="text-white text-[12px] font-bold">{unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    {displayed.length > 0 ? (
                        <View>
                            {displayed.map(n => (
                                <TouchableOpacity
                                    onPress={() => { markRead(n.id) }}
                                    key={n.id}
                                    className={`w-full flex-row items-start gap-3 p-5 text-left ${n.read ? "bg-white" : "bg-[#DEEBFF]/40"} border-b border-[#F4F5F7]`}
                                >
                                    {!n.read && <Text className="w-2 h-2 bg-[#0052CC] rounded-full mt-5" />}
                                    {n.read && <Text className="w-2 h-2" />}

                                    <View className="relative">
                                        <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: n.color }}>
                                            <Text className="text-white text-[15px] font-bold">{n.avatar}</Text>
                                        </View>
                                        <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white items-center justify-center border border-[#DFE1E6]">
                                            <Ionicons name={typeIcons[n.type]?.icon as any} color="#000" size={14} />
                                            {/* <Text className="text-[13px] font-bold">{typeIcons[n.type]?.icon}</Text> */}
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-[#172B4D] text-[15px] mb-1">
                                            <Text className="font-semibold text-[15px]"> {n.actor} </Text>
                                            {n.action}
                                            <Text className="text-[#0052CC] font-semibold text-[15px]"> {n.target} </Text>
                                        </Text>
                                        <Text className="text-[#6B778C] text-[13px]">{n.preview}</Text>
                                        <Text className="text-[#B3BAC5] text-[12px] mt-1">{n.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View className="flex-column items-center justify-center py-24 px-6 text-center">
                            <View className="w-16 h-16 bg-[#DFE1E6] rounded-full items-center justify-center mb-4">
                                <Ionicons name="notifications" size={28} className="text-[#B3BAC5]" />
                            </View>
                            <Text className="text-[#172B4D] text-[16px] font-semibold mb-1">{"You're all caught up!"}</Text>
                            <Text className="text-[#6B778C] text-sm">No unread notifications right now.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
