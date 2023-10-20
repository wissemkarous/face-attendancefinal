// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, Button, Image, TouchableOpacity } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';

// function AdminRolesScreen() {
//   const [name, setName] = useState('');
//   const [profilePic, setProfilePic] = useState(null);
//   const [isAddingUser, setIsAddingUser] = useState(false);

//   // Function to add a new user to the backend
//   const addUser = async () => {
//     try {
//       const newUser = {
//         name: name,
//         photo: profilePic ? await convertImageToBase64(profilePic) : null,
//       };

//       // Send a POST request to the backend to create descriptions and save the user
//       const response = await axios.post('http://192.168.1.13:4000/create-descriptions', newUser);
//       const descriptions = response.data.descriptions;

//       // Reset the input fields and user profile picture after adding the user
//       setName('');
//       setProfilePic(null);
//       setIsAddingUser(false);
//     } catch (error) {
//       console.error('Error adding user:', error);
//     }
//   };

//   // Function to handle profile picture selection
//   const handleProfilePicSelect = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       alert('Sorry, we need camera roll permissions to select a profile picture.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets.length > 0) {
//       setProfilePic(result.assets[0].uri); // Set the URI of the first selected asset as profilePic
//     }
//   };

//   // Function to convert the selected image to a Data URI (Base64 format)
//   const convertImageToBase64 = async (imageUri) => {
//     const response = await fetch(imageUri);
//     const blob = await response.blob();
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Admin Roles</Text>
//         <TouchableOpacity onPress={() => setIsAddingUser(!isAddingUser)}>
//           <Ionicons name={isAddingUser ? 'md-remove' : 'md-add'} size={30} color="black" />
//         </TouchableOpacity>
//       </View>
//       {isAddingUser && (
//         <View style={styles.inputContainer}>
//           <TouchableOpacity onPress={handleProfilePicSelect} style={styles.addProfilePicButton}>
//             <Text style={styles.addProfilePicButtonText}>Add Profile Picture</Text>
//           </TouchableOpacity>
//           <View style={styles.profilePicContainer}>
//             {profilePic ? (
//               <Image source={{ uri: profilePic }} style={styles.profilePic} />
//             ) : (
//               <View style={styles.profilePicPlaceholder}>
//                 <Text style={styles.profilePicText}>No Profile Picture</Text>
//               </View>
//             )}
//           </View>
//           <TextInput
//             style={styles.input}
//             placeholder="UserName"
//             value={name}
//             onChangeText={setName}
//           />
//           <Button title="Add User" onPress={addUser} color="#0066FF" />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     fontVariant: 'small-caps',
//     fontStyle: 'italic',
//     color: '#008b8b',
//   },
//   inputContainer: {
//     backgroundColor: '#fff',
//     padding: 25,
//     width: '100%',
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   addProfilePicButton: {
//     backgroundColor: '#0066FF',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 8,
//   },
//   addProfilePicButtonText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//   },
//   profilePicContainer: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   profilePic: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 8,
//   },
//   profilePicPlaceholder: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profilePicText: {
//     fontSize: 16,
//     color: '#616161',
//   },
// });

// export default AdminRolesScreen;
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

function AdminRolesScreen() {
  const [users, setUsers] = useState([]);
  const [label, setName] = useState('');
  const [id, setId] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Function to add a new user to the backend
  const addUser = async () => {
    try {
      const newUser = {
        name: label,
        profilePic: profilePic,
      };

      // Send a POST request to the backend to add the user
      const response = await axios.post('http://192.168.1.13:4000/api/users', newUser);
      const addedUser = response.data.user;

      setUsers([...users, addedUser]);
      setName('');
      setProfilePic(null);
      setIsAddingUser(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Function to remove a user from the backend
  const removeUser = async (userId) => {
    try {
      // Send a DELETE request to the backend to remove the user
      await axios.delete(`http://192.168.1.13:4000/api/users/${userId}`);
      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Function to fetch the user list from the backend when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Send a GET request to the backend to retrieve the user list
        const response = await axios.get('http://192.168.1.13:4000/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleProfilePicSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to select a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Roles</Text>
        <TouchableOpacity onPress={() => setIsAddingUser(!isAddingUser)}>
          <Ionicons name={isAddingUser ? 'md-remove' : 'md-add'} size={30} color="black" />
        </TouchableOpacity>
      </View>
      {isAddingUser && (
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleProfilePicSelect} style={styles.addProfilePicButton}>
            <Text style={styles.addProfilePicButtonText}>Add Profile Picture</Text>
          </TouchableOpacity>
          <View style={styles.profilePicContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <Text style={styles.profilePicText}>No Profile Picture</Text>
              </View>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="UserName"
            value={label}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="ID"
            value={id}
            onChangeText={setId}
          />
          <Button title="Add User" onPress={addUser} color="#0066FF" />
        </View>
      )}
      <View style={styles.userList}>
        <Text style={styles.userListTitle}>User List :</Text>
        <Text style={styles.userList}>{users.length} Member(s)</Text>
        {users.map((user) => (
          <View key={user._id} style={styles.userItem}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.userProfilePic} />
            ) : (
              <View style={styles.userProfilePicPlaceholder}>
                <Text style={styles.profilePicText}>No Profile Picture</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.label}</Text>
              {/* <Text style={styles.userId}>{user._id}</Text> */}
            </View>
            <Button title="Remove" onPress={() => removeUser(user._id)} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: 'small-caps',
    fontStyle: 'italic',
    color: '#008b8b',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 25,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
  },
  addProfilePicButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  addProfilePicButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicText: {
    fontSize: 16,
    color: '#616161',
  },
  userList: {
    width: '100%',
    fontStyle: 'italic',
    fontVariant: 'small-caps',
  },
  userListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontVariant: 'small-caps',
    marginBottom: 8,
    color: '#008b8b',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  userProfilePicPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0066FF',
    backgroundColor: '#F5F5F5',
  },
  userId: {
    fontSize: 16,
    color: '#616161',
  },
});

export default AdminRolesScreen;
