import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceToken, getServer } from '../utils/deviceUtil';
import { FLAVOR, LOGO, BACKGROUND } from '@env'
const { styles } = global.gstyles;

const SecureScreen = ({ navigation }: StackScreenProps<{ HomeScreen: any }>) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const onScreenLoad = async () => {
    var token;
    try {
      token = await AsyncStorage.getItem('@auth');
    } catch (e) {
      console.log(e);
      navigation.navigate('Login');
    }

    if (token) {
      const deviceToken = await getDeviceToken();
      const server = await getServer();
      const response = await fetch(`${server}/secured-page`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'silent-auth': deviceToken.token,
          'device-id': deviceToken.deviceId,
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        setPhoneNumber(data.phone_number);
      } else {
        navigation.navigate('Login');
      }
    } else {
      navigation.navigate('Login');
    }
  };

  useEffect(() => {
    onScreenLoad();
  });

  const logoutHandler = async () => {
    // This is the place to unset everything!!
    try {
      await AsyncStorage.removeItem('@auth');
    } catch (e) {
      console.log(e);
    }

    navigation.navigate('Home');
  };

  return (
    <View style={styles.view}>
      <ImageBackground source={global.back} resizeMode="cover" style={styles.Background} >
        <View style={styles.overlay}>
          <Image source={global.logo} style={styles.Image} />
          <Text style={[styles.heading, styles.white]} >Welcome to the</Text>
          <Text style={[styles.heading2, styles.white]}>{global.name} SilentAuth</Text>
          <Text style={[styles.heading2, styles.white]}>Demo Application</Text>
          <Text style={styles.heading3}>
            Congratulations!
          </Text>
          <Text style={styles.heading3}>
            Your verification was
          </Text>
          <Text style={styles.heading3}>
            SUCCESSFUL!
          </Text>
          <Text style={[styles.subHeading, styles.white]}>
            Authenticated number: {phoneNumber}.
          </Text>
          <TouchableOpacity
            onPress={logoutHandler}
            style={[styles.button, styles.enabledButton]}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default SecureScreen;
