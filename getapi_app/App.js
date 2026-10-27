import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './userSlice';
import UserList from './components/UserList';

const store = configureStore({ reducer: { users: usersReducer } });

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Text style={styles.title}>Phần 1: GET API</Text>
        <UserList />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#f5f5f5',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
