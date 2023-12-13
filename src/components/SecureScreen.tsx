import React, {useState, useEffect} from 'react';
import {TouchableOpacity, ScrollView, Text, Image} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {SERVER_BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDeviceToken} from '../utils/deviceUtil';
import {styles} from '../public/styles';

const SecureScreen = ({navigation}: StackScreenProps<{HomeScreen: any}>) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const onScreenLoad = async () => {
    var token;
    var forcePassPhoneNumber;
    try {
      token = await AsyncStorage.getItem('@auth');
      forcePassPhoneNumber = await AsyncStorage.getItem('@auth_phone');
    } catch (e) {
        console.log("get auth error", e);
    }

    if (forcePassPhoneNumber) {
      setPhoneNumber(forcePassPhoneNumber);
    }
    else if (token) {
      const deviceToken = await getDeviceToken();
      const response = await fetch(`${SERVER_BASE_URL}/secured-page`, {
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
      await AsyncStorage.removeItem('@auth_phone');
    } catch (e) {
      console.log(e);
    }

    navigation.navigate('Home');
  };

  return (
  <ScrollView contentContainerStyle={styles.scrollView}>
      <Image source={require('../assets/vonage.png')} style={styles.Image}/>
      <Text style={styles.heading}>Welcome to the</Text>
      <Text style={styles.heading2}>Vonage SilentAuth</Text>
      <Text style={styles.heading2}>Demo Application</Text>
      <Text style={styles.heading3}>
        Congratulations!
      </Text>
      <Text style={styles.heading3}>
        Your verification was
      </Text>
      <Text style={styles.heading3}>
        SUCCESSFUL!
      </Text>
      <Text style={styles.subHeading}>
       Authenticated number: {phoneNumber}.
      </Text>
      <TouchableOpacity
        onPress={logoutHandler}
        style={[styles.button, styles.enabledButton]}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SecureScreen;
