'use strict';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  view: {
    flex: 1,
    alignItems: 'center',
    marginTop: 120,
    marginLeft: 20,
    marginRight: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  heading2: {
    fontSize: 20,
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
    fontSize: 15,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
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
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    alignItems: "center",
    height: "20%",
    width: "40%",

  },
});
