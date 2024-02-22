import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceToken, getServer } from '../utils/deviceUtil';
import { FLAVOR, LOGO, BACKGROUND } from '@env'
const { styles } = global.gstyles;
const VerifyScreen = ({
  navigation,
  route,
}: StackScreenProps<{ HomeScreen: any }>) => {
  const [pin, setPin] = useState('');
  const [isPinValidState, setIsPinValidState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      setIsPinValidState(true);
    } else {
      setIsPinValidState(false);
    }
  }, [pin]);

  const cancelHandler = async () => {
    navigation.navigate('Login');
  }
  const verifyHandler = async () => {
    const body = {
      request_id: route?.params?.requestId,
      pin: pin,
    };
    console.log(`pin in verify from login code: ${pin}`);
    const deviceToken = await getDeviceToken();
    const server = await getServer();

    const response = await fetch(`${server}/verify`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'silent-auth': deviceToken.token,
        'device-id': deviceToken.deviceId,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('Verified! Go to Secure Page!!');
      setPin('');

      try {
        await AsyncStorage.setItem('@auth', data.token);
        navigation.navigate('Secure');
      } catch (e) {
        console.log(e);
      }
    } else if (response.status === 400) {
      console.log('Verification Pin incorrect!!');
      setErrorMessage('Incorrect pin entered. Please retry');
      setPin('');
    } else if (response.status === 409) {
      console.log("Workflow doesn't require a pin.");
      setErrorMessage(
        'A pin is not required for this step of the verification process.',
      );
      setPin('');
    } else {
      console.log('Verification does not exist or has expired!!');
      setPin('');
      navigation.navigate('Login', { errorMessage: data?.error });
    }
  };

  return (
    <View style={styles.view}>
      <ImageBackground source={global.back} resizeMode="cover" style={styles.Background} >
        <View style={styles.overlay}>
          <Image source={global.logo} style={styles.Image} />
          <Text style={[styles.heading, styles.white]} >Welcome to the</Text>
          <Text style={[styles.heading2, styles.white]}>{global.name} SilentAuth</Text>
          <Text style={[styles.heading2, styles.white]}>Demo Application</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> :
            <Text style={[styles.heading2, styles.white]}></Text>}
          <Text style={[styles.heading2, styles.white]}>
            Please enter your verification code to continue.
          </Text>
          <TextInput
            style={[styles.input, styles.white]}
            placeholder="Enter Verification Pin"
            placeholderTextColor="white"
            keyboardType="numeric"
            returnKeyType="done"
            autoCapitalize="none"
            onChangeText={text => setPin(text)}
            value={pin}
          />

          <TouchableOpacity
            onPress={verifyHandler}
            style={[styles.button, styles.enabledButton]}>
            <Text style={styles.buttonText}>Verify Me!</Text>
          </TouchableOpacity>
          <Text></Text>
          <TouchableOpacity
            onPress={cancelHandler}
            style={[styles.button, styles.enabledButton]}>
            <Text style={styles.buttonText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.versionText}>V0.12</Text>
        <Text style={styles.captionText}>Powered by Vonage</Text>
      </ImageBackground>
    </View>
  );
};

export default VerifyScreen;
