import React, { useState , useEffect, useCallback} from 'react';
import { Text, View, StyleSheet, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from "axios"

function TimesheetsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const renderItem = ({ item }) => {
  return   (
      <View style={styles.userItem}>
      <View>
        <Text>Username: {item.user?.label}</Text>
        <Text>Worktime: {item.date}</Text>
      </View>
    </View>
  );
} 

  const handleSearch = () => {
    const filteredItems = filteredUsers.filter((item) =>
      item.user?.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filteredItems);
  };

  const fetchUsers =async () => {
    try {
      const {data : { users } } = await axios.get("http://192.168.1.13:4000/api/pointage", {
        params : {
          search_date : selectedDate
        }
      })
      console.log("users : ", users)
      setFilteredUsers(users)
    }catch(error){
      console.log("error ", error)
    }
  }

  useEffect(() => {
    if (selectedDate){
      fetchUsers()
    }
  }, [selectedDate])

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={date => {
            setSelectedDate(date.dateString);
          }}
          markedDates={{
            [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
          }}
          theme={{
            selectedDayBackgroundColor: 'blue',
            todayTextColor: 'blue',
            arrowColor: 'blue',
            textDayFontWeight: 'bold',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
          }}
        />
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity opacity={.85} style={styles.searchBtn}
          onPress={handleSearch}
        >
            <Image 
              source={require("../assets/search.png")}
              style={styles.searchIconImage}
              resizeMode="contain" />
        </TouchableOpacity>
      </View>
      {selectedDate && (
        <View style={styles.selectedUsersContainer}>
          <Text style={styles.selectedUsersTitle}> Users of the selected day: {selectedDate} </Text>
          {
            filteredUsers.length > 0 ?
            <FlatList
            data={filteredUsers}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            />
            :
            <View style={{padding : 10, alignItems : "center", height : 300}}>
              <Text style={{fontSize : 17}}>No Users</Text>
            </View>
          }
        </View>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    width: '100%',
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItem : "center",
    justifyContent : "center",
    flexDirection : "row", 
    gap : 5,
  },
  searchInput: {
    flex : 1,
    fontSize: 16,
    borderWidth : 1,
    borderColor : "grey",
    borderRadius : 5,
    paddingHorizontal : 15,
    paddingVertical : 10,
  },
  searchBtn : {
    width : 65,
    height : 65,
    borderRadius : 12,
    backgroundColor : "tomato",
    alignItems : "center",
    justifyContent: "center",
  },
  searchIconImage : {
    tintColor : "white",
    width : "50%",
    height : "50%"
  },
  calendarContainer: {
    width: '100%',
    marginBottom: 10,   
      
  },
  selectedUsersContainer: {
    flex: 1,
    width: '100%',
  },
  selectedUsersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default TimesheetsScreen;
