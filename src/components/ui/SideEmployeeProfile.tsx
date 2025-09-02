import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

// Dummy data
const userData = {
  name: 'Nama User',
  role: 'Role',
  email: 'user@example.com',
};

const SideEmployeeProfile = () => {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          onPress: () => console.log("Logout Canceled"),
          style: "cancel"
        },
        { 
          text: "Ya", 
          onPress: () => {
            console.log("User logged out");
            // Add your actual logout logic here, e.g., navigate to login screen
            // or clear user tokens from storage.
          }
        }
      ],
      { cancelable: false }
    );
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0][0];
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(userData.name)}</Text>
      </View>
      <Text style={styles.nameText}>{userData.name}</Text>
      <Text style={styles.roleText}>{userData.role}</Text>
      <Text style={styles.emailText}>{userData.email}</Text>
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D3D3D3', // Light gray background
    padding: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#808080', // Darker gray for the avatar circle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 40, // Space before the button
  },
  logoutButton: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF0000', // Red color for logout button
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SideEmployeeProfile;