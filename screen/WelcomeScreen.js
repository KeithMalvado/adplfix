import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { themeColors } from '../theme/theme';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
            <View style={{ flex: 1, justifyContent: 'space-around', marginTop: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: themeColors.text }}>
                    Lelangin
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Image 
                        source={require("../assets/images/welcome.png")}
                        style={{ width: 350, height: 350 }} 
                    />
                </View>
                <View style={{ marginHorizontal: 28 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup')}
                        style={{
                            paddingVertical: 12,
                            backgroundColor: themeColors.button,
                            borderRadius: 16,
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: themeColors.textSecondary }}>
                            Daftar
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                        <Text style={{ color: themeColors.text }}>Sudah memiliki akun?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ fontWeight: 'bold', color: themeColors.primary }}> Masuk</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
