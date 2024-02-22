'use strict';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    //marginTop: 120,
    //marginLeft: 20,
    //marginRight: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  heading2: {
    fontSize: 22,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: 'bold',
  },
  heading3: {
    fontSize: 24,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: 'bold',
    color: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    // textShadowColor: 'rgba(0, 0, 0, 1.0)',
    // textShadowOffset: { width: -1, height: 1 },
    // textShadowRadius: 30,
  },
  subHeading: {
    fontSize: 15,
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginVertical: 20,
    marginTop: -30,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1955ff',
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#EBEBE4',
  },
  enabledButton: {
    backgroundColor: '#1955ff',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    marginTop: 40,
    justifyContent: 'center',
    color: '#00B4FF',
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkboxLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkboxLabel2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
  Image: {
    shadowColor: "black",
    shadowOffset: {
      width: -10,
      height: 9,
    },
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    alignItems: "center",
    marginTop: -40,
    height: '30%',
    width: '100%',
    aspectRatio: 1.0,
    resizeMode: 'contain',
  },
  Background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'rgba(224,255,255,1.50)',
  },
  white: {
    color: 'black',
    textShadowColor: 'aqua',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tint: {
    tintColors: 'white'
  },
  captionText: {
    fontSize: 16,
    position: 'absolute',
    alignItems: 'center',
    bottom: 24,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 16,
    position: 'absolute',
    alignItems: 'center',
    bottom: 2,
    fontWeight: 'bold',
  },
  pinkish: {
    color: 'black',
  },

});
