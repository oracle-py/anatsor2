import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Label } from '../../components/UI'; import { colors } from '../../theme';
export default function Verification() { const { email } = useLocalSearchParams<{ email: string }>(); return <View style={s.page}><Card><Label>Email verification</Label><Text style={s.title}>Check your inbox</Text><Text style={s.copy}>We sent a confirmation link to {email || 'your email address'}. Confirm it, then return and sign in to connect your device.</Text><Button title="Return to sign in" onPress={() => router.replace('/(auth)/login')} /></Card></View>; }
const s = StyleSheet.create({ page: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.sage }, title: { fontSize: 30, fontWeight: '900', color: colors.barn, marginVertical: 14 }, copy: { color: colors.barnSoft, lineHeight: 22, marginBottom: 24 } });
