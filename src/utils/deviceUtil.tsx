import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUniqueId } from 'react-native-device-info';
import { SERVER_BASE_URL } from '@env';

export async function getDeviceToken() {
  try {
    const token = await AsyncStorage.getItem('@device');
    const deviceId = await getUniqueId();

    return { token, deviceId };
  } catch (e) {
    console.log(e);
    return {};
  }
}
export async function getPhone() {
  try {
    var phone = await AsyncStorage.getItem('@phone');
    var country = await AsyncStorage.getItem('@country');
    console.log("Phone from async: " + phone)
    if (phone == null) phone = '';
    if (country == null) country = global.myCountry;
    return { phone, country };
  } catch (e) {
    console.log(e);
    return {};
  }
}
export async function getServer() {
  try {
    var server = await AsyncStorage.getItem('@server');
    //console.log("Server from async, env: " + server, SERVER_BASE_URL)
    if (server == null) {
      server = SERVER_BASE_URL;
    }
    return server;
  } catch (e) {
    console.log(e);
    return {};
  }
}

