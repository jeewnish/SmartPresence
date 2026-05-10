import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Details: undefined;
};

type LoginProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function Login({ navigation }: LoginProps){
    return(
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text> SmartPresence Login</Text>
            <Button title="Login" onPress={() => navigation.navigate('Home')}/>
        </View>
    );
}
