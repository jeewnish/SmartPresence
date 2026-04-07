import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Login(){
    return(
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text> SmartPresence Login</Text>
            <Button title="Login" onPress={() => {}}/>
        </View>
    );
}
