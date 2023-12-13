import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import parsePhoneNumber, { CountryCode, PhoneNumber } from 'libphonenumber-js';

import PhoneInput from 'react-native-phone-number-input';
import { getDeviceToken, getPhone } from '../utils/deviceUtil';
import { SERVER_BASE_URL, FORCE_PASS_NUMBERS } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../public/styles';
import CheckBox from '@react-native-community/checkbox';

import SilentAuthSdkReactNative, {
  CheckResponse,
} from '@silentauth/silentauth-sdk-react-native';
const initialState = {
  sms: true,
  voice: false,
  whatsapp: false,
};

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
  const [requestId, setRequestId] = React.useState('')
  const [checkUrl, setCheckUrl] = React.useState('')
  const [submittedNumber, setSubmittedNumber] = React.useState<E164Number | undefined>(undefined)

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
  Alert.alert('Please Turn On Cellular Data', '', [
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
   
    setSubmittedNumber(tel)

    let sandbox = false
    console.log("force pass number ", FORCE_PASS_NUMBERS)
    console.log("tel ", tel)
    if (FORCE_PASS_NUMBERS.includes(tel)) {
      console.log("set sandbox to true ")
      sandbox = true
    }

    // Check if mobile data is on
    const mobileNetworkCheck =
    await SilentAuthSdkReactNative.openWithDataCellular<CheckResponse>(
      "https://vids.vonage.com/",
    );
    if ('error' in mobileNetworkCheck) {
      setIsLoading(false);
      console.log(`Error in openWithDataCellular moving onto VerifyScreen: ${JSON.stringify(mobileNetworkCheck)}`);
      //cancel request
      createAlert()
      return;
    }

    // Step 1 - Make POST to /login
    console.log("Failover object: ", failover, " Sandbox: ", sandbox);
    const body = { phone_number: tel, country_code: countryCode, failover: failover, sandbox: sandbox };    
    const loginResponse = await fetch(`${SERVER_BASE_URL}/login`, {
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
      console.log(`Response from server: ${JSON.stringify({ data })}`);
      console.log(`checkurl from login ${checkUrl}`);
      console.log(`1 requestId from POST/login: ${requestId}`);

      const openCheckResponse =
        await SilentAuthSdkReactNative.openWithDataCellular<CheckResponse>(
          checkUrl, //url: api-eu-3.vonage.com/
        );

      if ('error' in openCheckResponse) {
        setIsLoading(false);
        console.log(`Error in openWithDataCellular moving onto VerifyScreen: ${JSON.stringify(openCheckResponse)}`);
      } else if ('http_status' in openCheckResponse) {
        const httpStatus = openCheckResponse.http_status;
        if (httpStatus >= 200) {
          console.log('Resp from silentauth >= 200');
          if (openCheckResponse.response_body) {
            const rBody = openCheckResponse.response_body;
            console.log(`SilentAuthResponse Body: ${JSON.stringify(rBody)} ---`);
            if ('code' in rBody) {
              const code = rBody.code;
              console.log(`code: ${code}`);
              const newBody = { request_id: requestId, pin: code };
              console.log(`pin/code: ${code}`);
              console.log(`newBody: ${newBody.request_id} and ${newBody.pin}`);

              const verifyResponse = await fetch(`${SERVER_BASE_URL}/verify`, {
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
                        // Force sandbox to go Secure Screen
              if (sandbox) {
                try {
                  await AsyncStorage.setItem('@auth_phone', tel?.toString());
                  navigation.navigate('Secure');
                  return
                } catch (e) {
                  console.log(e);
                }
              }
              else if (!failover.sms && !failover.voice &&  !failover.whatsapp) {
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
      console.log(`Error response from server: ${JSON.stringify({ data })}`);
      setErrorMessage(`Error in login: ${data.error}`);
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Image source={require('../assets/vonage.png')} style={styles.Image} />
      <Text style={styles.heading}>Welcome to the</Text>
      <Text style={styles.heading2}>Vonage SilentAuth</Text>
      <Text style={styles.heading2}>Demo Application</Text>
      <Text style={styles.subHeading}>
        Please enter your phone number to login.
      </Text>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <PhoneInput
        defaultValue={defaultNumber}
        defaultCode={countryCode}
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
      <View style={styles.checkboxWrapper}>
        <CheckBox
          value={failover.sms}
          onValueChange={value => {
            setFailover({
              ...failover,
              sms: value,
            })
          }
          }
        />
        <Text style={styles.checkboxLabel}>Failover to SMS</Text>
      </View>
      <View style={styles.checkboxWrapper}>
        <CheckBox
          value={failover.whatsapp}
          onValueChange={value => {
            setFailover({
              ...failover,
              whatsapp: value,
            })
          }
          }
        />
        <Text style={styles.checkboxLabel}>Failover to Whatsapp</Text>
      </View>
      {/* <View style={styles.checkboxWrapper}>
        <CheckBox
          value={failover.voice}
          onValueChange={value => {
            setFailover({
              ...failover,
              voice: value,
            })
          }
          }
        />
        <Text style={styles.checkboxLabel}>Failover to Voice</Text>
      </View> */}
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
    </ScrollView>
  );
};

export default LoginScreen;
