import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { useResponsive } from '../utils/responsive';

const recentProjects = [
  { id: '1', key: 'CLOUD', name: 'Cloud Migration', color: '#0052CC', avatar: 'CM' },
  { id: '2', key: 'MOB', name: 'Mobile App v3', color: '#6554C0', avatar: 'MA' },
  { id: '3', key: 'API', name: 'API Gateway', color: '#FF5630', avatar: 'AG' },
  { id: '4', key: 'DS', name: 'Design System', color: '#36B37E', avatar: 'DS' },
];

const myIssues = [
  { id: 'CLOUD-341', type: 'bug', priority: 'high', title: 'OAuth token refresh failing on iOS', status: 'In Progress', project: 'CLOUD' },
  { id: 'MOB-128', type: 'story', priority: 'medium', title: 'Implement push notifications for sprint updates', status: 'To Do', project: 'MOB' },
  { id: 'API-67', type: 'task', priority: 'low', title: 'Update rate limiting documentation', status: 'In Review', project: 'API' },
  { id: 'DS-14', type: 'story', priority: 'medium', title: 'Design token audit and cleanup', status: 'To Do', project: 'DS' },
];

const starredIssues = [
  { label: 'CLOUD-302 · Migrate to k8s v1.28', tag: 'Epic' },
  { label: 'MOB-100 · Offline mode support', tag: 'Story' },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'bug': return { icon: 'B', color: '#DE350B' };
    case 'story': return { icon: 'S', color: '#36B37E' };
    case 'task': return { icon: 'T', color: '#0052CC' };
    default: return { icon: 'D', color: '#0052CC' };
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#DE350B';
    case 'medium': return '#FFAB00';
    case 'low': return '#36B37E';
    default: return '#B3BAC5';
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'In Progress': return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'In Review': return { bg: '#EDE9FE', text: '#6D28D9' };
    default: return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { wp, hp, moderateScale } = useResponsive();

  const avatarSize = moderateScale(40);
  const iconBtnSize = moderateScale(40);
  const typeIconSize = moderateScale(32);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F5F7' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(12), flexGrow: 1 }}>

        {/* Header */}
        <View style={{ backgroundColor: '#0052CC', paddingHorizontal: wp(4), paddingTop: hp(1.5), paddingBottom: hp(2.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(2) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: '#FFAB00', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: moderateScale(15) }}>AJ</Text>
              </View>
              <View style={{ marginLeft: wp(3) }}>
                <Text style={{ color: 'rgba(191,215,255,1)', fontSize: moderateScale(12) }}>Good morning,</Text>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: moderateScale(16) }}>Alex Johnson</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Projects')}
                style={{ width: iconBtnSize, height: iconBtnSize, borderRadius: iconBtnSize / 2, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: wp(2) }}>
                <Ionicons name="add" size={moderateScale(24)} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Inbox')}
                style={{ width: iconBtnSize, height: iconBtnSize, borderRadius: iconBtnSize / 2, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="notifications-outline" size={moderateScale(20)} color="#fff" />
                <View style={{ position: 'absolute', top: moderateScale(4), right: moderateScale(4), width: moderateScale(14), height: moderateScale(14), borderRadius: 999, backgroundColor: '#FF5630', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: moderateScale(8), color: '#fff', fontWeight: 'bold' }}>5</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: moderateScale(12), paddingHorizontal: wp(4), paddingVertical: hp(1.5), flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search-outline" size={moderateScale(18)} color="rgba(255,255,255,0.7)" />
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginLeft: wp(2), fontSize: moderateScale(14) }}>Search issues, projects...</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: wp(4), paddingTop: hp(2.5) }}>

          {/* Recent Projects */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.5) }}>
            <Text style={{ color: '#172B4D', fontSize: moderateScale(15), fontWeight: '600' }}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={{ color: '#0052CC', fontWeight: '500', fontSize: moderateScale(14) }}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {recentProjects.map(item => (
              <TouchableOpacity
                key={item.id}
                style={{ width: '48%', backgroundColor: '#fff', borderRadius: moderateScale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: wp(3.5), marginBottom: hp(1.5) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(8), backgroundColor: item.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: moderateScale(14), fontWeight: 'bold' }}>{item.avatar}</Text>
                  </View>
                  <View style={{ marginLeft: wp(2.5), flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: moderateScale(14), color: '#172B4D' }}>{item.name}</Text>
                    <Text style={{ fontSize: moderateScale(12), color: '#6B7280' }}>{item.key}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* My Work */}
          <View style={{ marginTop: hp(1) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(1.5) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <Ionicons name="time-outline" size={moderateScale(18)} color="#6B778C" />
                <Text style={{ fontSize: moderateScale(15), fontWeight: '600', color: '#172B4D' }}>My Work</Text>
              </View>
              <View style={{ backgroundColor: '#DFE1E6', paddingHorizontal: wp(2), paddingVertical: hp(0.5), borderRadius: 999 }}>
                <Text style={{ fontSize: moderateScale(12), color: '#6B778C', fontWeight: '500' }}>{myIssues.length}</Text>
              </View>
            </View>
            {myIssues.map(issue => {
              const type = getTypeIcon(issue.type);
              const statusStyle = getStatusStyle(issue.status);
              return (
                <TouchableOpacity
                  key={issue.id}
                  style={{ backgroundColor: '#fff', borderRadius: moderateScale(12), borderWidth: 1, borderColor: '#E5E7EB', padding: wp(3.5), marginBottom: hp(1.5), flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(2), gap: wp(2.5) }}>
                    <View style={{ width: typeIconSize, height: typeIconSize, borderRadius: moderateScale(8), backgroundColor: type.color, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: moderateScale(14), fontWeight: 'bold' }}>{type.icon}</Text>
                    </View>
                    <View style={{ width: moderateScale(8), height: moderateScale(8), borderRadius: 999, backgroundColor: getPriorityColor(issue.priority) }} />
                  </View>
                  <View style={{ flex: 1, marginLeft: wp(3), gap: hp(0.8) }}>
                    <Text numberOfLines={2} style={{ color: '#172B4D', fontWeight: '600', fontSize: moderateScale(14) }}>{issue.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#6B7280', fontSize: moderateScale(12) }}>{issue.id}</Text>
                      <View style={{ width: moderateScale(4), height: moderateScale(4), borderRadius: 999, backgroundColor: '#9CA3AF', marginHorizontal: wp(1.5) }} />
                      <View style={{ paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: 999, backgroundColor: statusStyle.bg }}>
                        <Text style={{ fontSize: moderateScale(11), fontWeight: '500', color: statusStyle.text }}>{issue.status}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={moderateScale(20)} color="#B3BAC5" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Starred */}
          <View style={{ marginTop: hp(1.5) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(1.5) }}>
              <Ionicons name="star" size={moderateScale(20)} color="#FFAB00" />
              <Text style={{ marginLeft: wp(2), fontSize: moderateScale(14), fontWeight: '600', color: '#172B4D' }}>Starred</Text>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: moderateScale(12), borderWidth: 1, borderColor: '#E5E7EB' }}>
              {starredIssues.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(4), paddingVertical: hp(1.8), borderBottomWidth: index !== starredIssues.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="star" size={moderateScale(16)} color="#FFAB00" />
                    <Text numberOfLines={1} style={{ marginLeft: wp(3), color: '#172B4D', fontSize: moderateScale(13), flex: 1 }}>{item.label}</Text>
                  </View>
                  <View style={{ backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: wp(2), paddingVertical: hp(0.4) }}>
                    <Text style={{ fontSize: moderateScale(11), color: '#6B7280' }}>{item.tag}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
