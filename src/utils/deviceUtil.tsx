import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUniqueId} from 'react-native-device-info';

export async function getDeviceToken() {
  try {
    const token = await AsyncStorage.getItem('@device');
    const deviceId = await getUniqueId();

    return {token, deviceId};
  } catch (e) {
    console.log(e);
    return {};
  }
}
export async function getPhone() {
  try {
    var phone = await AsyncStorage.getItem('@phone');
    var country = await AsyncStorage.getItem('@country');
    console.log("Phone from async: "+phone)
    if (phone == null) phone = '4083645655';
    if (country == null) country = 'US';
    return {phone, country};
  } catch (e) {
    console.log(e);
    return {};
  }
}
