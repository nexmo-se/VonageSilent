import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPhone, getServer } from '../utils/deviceUtil';
import { FLAVOR, LOGO, BACKGROUND } from '@env'
interface Props {
  navigation: any;
}
const { styles } = global.gstyles;
console.log("Background: ", global.back);
console.log("Logo: " + global.logo);
//const lg = require('../assets/' + global.logo);
async function createDeviceToken() {
  const deviceId = await getUniqueId();
  const phone = await getPhone();
  var server = await getServer();
  console.log("Got phone from local repo: ", phone);
  global.myPhone = phone.phone;
  global.myCountry = phone.country;
  console.log("Flavor: ", FLAVOR);
  var response = await fetch(
    `${server}/device?deviceId=${deviceId}&flavor=${FLAVOR}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  var data = await response.json();
  if (data.server && (data.server != server)) {
    console.log("Setting new server URL: ", data.server);
    await AsyncStorage.setItem('@server', data.server);
    return false;
  }
  if (data.token !== 'undefined') {
    try {
      await AsyncStorage.setItem('@device', data.token);
    } catch (e) {
      console.log(e);
    }
  }
  return true;
}
const createClearAlert = async () =>
  Alert.alert('Clear Settings', 'Clear all settings and reset to the defaults (including backend server)', [
    {
      text: 'Cancel',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    },
    {
      text: 'OK', onPress: async () => {
        console.log('OK Pressed');
        AsyncStorage.removeItem('@server');
        AsyncStorage.removeItem('@phone');
        AsyncStorage.removeItem('@country');
        AsyncStorage.removeItem('@device');
        AsyncStorage.removeItem('@auth');
        await startup();
      }
    },
  ]);
async function startup() {
  if (!(await createDeviceToken())) {
    console.log("Retrying on backend change.");
    createDeviceToken(); //Change of backend!  Retry
  };
}
function HomeScreen({ navigation }: Props) {
  const onScreenLoad = async () => {
    // if (!(await createDeviceToken())) {
    //   console.log("Retrying on backend change.");
    //   createDeviceToken(); //Change of backend!  Retry
    // };
    await startup();
  };
  useEffect(() => {
    onScreenLoad();
  });
  return (
    <View style={styles.view}>
      <ImageBackground source={global.back} resizeMode="cover" style={styles.Background} >
        <View style={styles.overlay}>
          <Image source={global.logo} style={styles.Image} />
          <Text style={[styles.heading, styles.white]} >Welcome to the</Text>
          <Text style={[styles.heading2, styles.white]}>{global.name} SilentAuth</Text>
          <Text style={[styles.heading2, styles.white]}>Demo Application</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, styles.enabledButton]}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => createClearAlert()}
            style={[styles.button, styles.enabledButton, styles.bottomButton]}>
            <Text style={styles.buttonText}>Clear Settings</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground >
    </View >
  );
}

export default HomeScreen;
