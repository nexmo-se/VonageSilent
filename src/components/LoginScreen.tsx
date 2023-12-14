import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import parsePhoneNumber, { CountryCode } from 'libphonenumber-js';

import PhoneInput from 'react-native-phone-number-input';
import { getDeviceToken, getPhone, getServer } from '../utils/deviceUtil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import { FLAVOR, LOGO, BACKGROUND } from '@env'
const { styles } = global.gstyles;

import SilentAuthSdkReactNative, {
  CheckResponse,
} from '@silentauth/silentauth-sdk-react-native';
const initialState = {
  sms: true,
  voice: false,
};
const logo = LOGO ? LOGO : 'vonage.png';
var back = '';
console.log("ENV Background is " + BACKGROUND);
if (BACKGROUND !== undefined) {
  back = require('../assets/wpback.jpeg');
}
const LoginScreen = ({
  navigation,
  route,
}: StackScreenProps<{ HomeScreen: any }>) => {
  const [inputNumber, setInputNumber] = useState(global.myPhone);
  const [defaultNumber, setDefaultNumber] = useState(global.myPhone);
  const [countryCode, setCountryCode] = useState<CountryCode>(global.myCountry);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isPhoneNumberValidState, setIsPhoneNumberValidState] = useState(false);
  const [failover, setFailover] = React.useState(initialState);
  const [sandbox, setSandbox] = React.useState<boolean>(false);
  useEffect(() => {
    const error = route?.params?.errorMessage;

    if (error) {
      setErrorMessage(error);
    }
  }, [route]);

  useEffect(() => {
    const phoneNumber = parsePhoneNumber(inputNumber, countryCode);

    if (phoneNumber?.isValid()) {
      setIsPhoneNumberValidState(true);
    } else {
      setIsPhoneNumberValidState(false);
    }
  }, [inputNumber, countryCode]);

  useEffect(() => {
    const phoneNumber = parsePhoneNumber(inputNumber, countryCode);

    if (phoneNumber?.isValid()) {
      setIsPhoneNumberValidState(true);
    } else {
      setIsPhoneNumberValidState(false);
    }
  }, [inputNumber, countryCode]);
  const createAlert = () =>
    Alert.alert('Use Sandbox', 'The Sandbox allows you to test the flow without actually verifying against the cellular network. Sending a phone number ending in an even digit will ALWAYS succeed, and sending an odd will ALWAYS fail. SMS and Voice flows are disabled when using the Sandbox.', [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  const loginHandler = async () => {
    Keyboard.dismiss();
    setErrorMessage('');
    setIsLoading(true);

    const deviceToken = await getDeviceToken();
    const parsed = parsePhoneNumber(inputNumber, countryCode)
    const tel = parsed?.number;
    const national = parsed?.nationalNumber;
    console.log("Setting parameters into storage: ", national, countryCode);
    AsyncStorage.setItem('@phone', national);
    AsyncStorage.setItem('@country', countryCode);
    global.myPhone = national;
    global.myCountry = countryCode;

    // Step 1 - Make POST to /login
    console.log("Failover object: ", failover, " Sandbox: ", sandbox);
    const body = { phone_number: tel, country_code: countryCode, failover: failover, sandbox: sandbox };
    const server = await getServer();
    const loginResponse = await fetch(`${server}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'silent-auth': deviceToken?.token,
        'device-id': deviceToken?.deviceId,
      },
      body: JSON.stringify(body),
    });
    const data = await loginResponse.json();
    if (loginResponse.status === 200) {
      const requestId = data.requestId;
      const checkUrl = data.checkUrl; // Vonage CheckURL
      console.log(`Response from server: ${{ data }}`);
      console.log(`checkurl from login ${checkUrl}`);
      console.log(`1 requestId from POST/login: ${requestId}`);

      const openCheckResponse =
        await SilentAuthSdkReactNative.openWithDataCellularWithDebug<CheckResponse>(
          checkUrl,
          true
        );
      await fetch(`${server}/debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'silent-auth': deviceToken?.token,
          'device-id': deviceToken?.deviceId,
        },
        body: JSON.stringify(openCheckResponse),
      });

      if ('error' in openCheckResponse) {
        setIsLoading(false);
        console.log(
          `Error in openWithDataCellular moving onto VerifyScreen: requestID: ${requestId} `,
        );
        if (!failover.sms && !failover.voice) {
          console.log("Got no need for a pin! ", openCheckResponse);
          setErrorMessage('Error checking the URL over the Cellular Path: ' + openCheckResponse.error_description);
          navigation.navigate('Login', { errorMessage: errorMessage });
        } else {
          navigation.navigate('Verify', { requestId: requestId });
        }
      } else if ('http_status' in openCheckResponse) {
        console.log("OpenCheckResponse: ", openCheckResponse)
        const httpStatus = openCheckResponse.http_status;
        if (httpStatus >= 200) {
          console.log('Resp from silentauth >= 200: ', openCheckResponse);
          if (openCheckResponse.response_body) {
            const rBody = openCheckResponse.response_body;
            console.log(`SilentAuthResponse Body: `, rBody);
            if ('code' in rBody) {
              const code = rBody.code;
              console.log(`code: ${code}`);
              const newBody = { request_id: requestId, pin: code };
              const server = await getServer();
              const verifyResponse = await fetch(`${server}/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'silent-auth': deviceToken.token,
                  'device-id': deviceToken.deviceId,
                },
                body: JSON.stringify(newBody),
              });

              const verifyData = await verifyResponse.json();
              if (verifyResponse.status === 200) {
                console.log('Verified! Go to Secure Page!!');
                try {
                  await AsyncStorage.setItem('@auth', verifyData.token);
                  navigation.navigate('Secure');
                } catch (e) {
                  console.log(e);
                }
              } else if (verifyResponse.status === 400) {
                console.log('Verification Pin incorrect!!');
                setErrorMessage('Incorrect pin entered. Please retry');
              } else if (verifyResponse.status === 409) {
                console.log("Workflow doesn't require a pin.");
                setErrorMessage(
                  'A pin is not required for this step of the verification process.',
                );
              } else {
                console.log('Verification does not exist or has expired!!');
                navigation.navigate('Login', { errorMessage: verifyData?.error });
              }
            } else {
              setIsLoading(false);
              console.log('Before Verify No Code...');
              if (!failover.sms && !failover.voice) {
                console.log("Got no pin!");
                setErrorMessage('This device is not the one specified, and you have no failover verification method chosen.');
                navigation.navigate('Login', { errorMessage: errorMessage });
              } else {
                navigation.navigate('Verify', { requestId: requestId });
                console.log('After Verify No Code...');
              }
            }
          }
        } else {
          setIsLoading(false);
          console.log('Before Verify...');
          navigation.navigate('Verify', { requestId: requestId });
          console.log(`After Verify...`);
        }
      }
    } else {
      console.log(`Error response from server: ${{ data }}`);
      setErrorMessage(`Error in login: ${data.error}`);
      setIsLoading(false);
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
          {errorMessage && <Text style={[styles.errorText]}>{errorMessage}</Text>}
          <Text style={[styles.subHeading, styles.white]}>
            Please enter your phone number to login.
          </Text>
          <PhoneInput
            defaultValue={defaultNumber}
            defaultCode={global.myCountry}
            textInputProps={{ returnKeyType: "done" }}
            onChangeText={text => {
              setInputNumber(text);
            }}
            onChangeFormattedText={text => {
              setInputNumber(text);
            }}
            onChangeCountry={text => {
              setCountryCode(text.cca2);
            }}
          />
          <View style={[styles.checkboxWrapper]}>
            <CheckBox
              onFillColor={'white'}
              onCheckColor={'black'}
              tintColors={global.back ? { true: 'white', false: 'black' } : {}}
              value={failover.sms}
              onValueChange={value => {
                setFailover({
                  ...failover,
                  sms: value,
                })
                if (value) {
                  setSandbox(false);
                }
              }
              }
            />
            <Text style={[styles.checkboxLabel, styles.white]}>Failover to SMS</Text>
          </View>
          <View style={styles.checkboxWrapper}>
            <CheckBox
              value={failover.voice}
              onFillColor={'white'}
              onCheckColor={'black'}
              tintColors={global.back ? { true: 'white', false: 'black' } : {}}
              onValueChange={value => {
                setFailover({
                  ...failover,
                  voice: value,
                })
                if (value) {
                  setSandbox(false);
                }
              }
              }
            />
            <Text style={[styles.checkboxLabel, styles.white]}>Failover to Voice</Text>
          </View>
          <View style={styles.checkboxWrapper}>
            <CheckBox
              value={sandbox}
              onFillColor={'white'}
              onCheckColor={'black'}
              tintColors={global.back ? { true: 'white', false: 'black' } : {}}
              onValueChange={value => {
                setSandbox(value);
                if (value) {
                  createAlert();
                  setFailover({
                    ...failover,
                    voice: false, sms: false
                  });
                }
              }
              }
            />
            <Text style={[styles.checkboxLabel2, styles.pinkish]}>Use Sandbox</Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                color={styles.loadingContainer.color}
                size="large"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={loginHandler}
              style={[
                styles.button,
                isPhoneNumberValidState
                  ? styles.enabledButton
                  : styles.disabledButton,
              ]}
              disabled={!isPhoneNumberValidState}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
