import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SideEmployeeProfile from './SideEmployeeProfile'; // Make sure this path is correct

const ProfileEmp = () => {
  return (
    <View style={styles.container}>
      <SideEmployeeProfile />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ProfileEmp;