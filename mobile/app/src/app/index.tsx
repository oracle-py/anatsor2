import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
export default function Index() { const { user, device, loading } = useAuth(); if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.barn} /></View>; if (!user) return <Redirect href="/(auth)/login" />; if (!device) return <Redirect href="/(auth)/device-setup" />; return <Redirect href="/(tabs)" />; }
