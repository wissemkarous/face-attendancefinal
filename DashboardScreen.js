import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function DashboardScreen() {
  const [isDoubleSession, setIsDoubleSession] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDoubleSession = () => {
    setIsDoubleSession(true);
  };

  const handleSingleSession = () => {
    setIsDoubleSession(false);
  };

  const renderTimeSlot = () => {
    if (isDoubleSession) {
      return (
        <>
          <Text style={styles.timeSlotText}>8:00 AM - 12:00 PM</Text>
          <Text style={styles.timeSlotText}>12:00 PM - 2:00 PM (Break)</Text>
          <Text style={styles.timeSlotText}>2:00 PM - 5:30 PM</Text>
        </>
      );
    } else {
      return <Text style={styles.timeSlotText}>8:00 AM - 2:30 PM</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.section, styles.header]}>
        <View style={styles.currentTimeContainer}>
          <AntDesign name="clockcircleo" size={25} color="#000" />
          <Text style={styles.currentTimeText}>Current Time: {currentTime}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.buttonContainer]}>
        <TouchableOpacity
          style={[styles.button, !isDoubleSession ? styles.selectedButton : null]}
          onPress={handleSingleSession}
        >
          <Text style={[styles.buttonText, !isDoubleSession ? styles.selectedButtonText : null]}>
            Single Session
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isDoubleSession ? styles.selectedButton : null]}
          onPress={handleDoubleSession}
        >
          <Text style={[styles.buttonText, isDoubleSession ? styles.selectedButtonText : null]}>
            Double Session
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, styles.timeSlotContainer]}>
        <Text style={styles.timeSlotTitle}>Time Slot:</Text>
        {renderTimeSlot()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  section: {
    borderRadius: 8,
    marginBottom: 20,
    padding: 20,
    width: '100%',
  },
  header: {
    backgroundColor: '#f5f5f5',
  },
  currentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the current time text
    marginTop: 10,
  },
  currentTimeText: {
    fontSize: 18,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#c0c0c0',
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedButton: {
    backgroundColor: '#f0a500',
  },
  selectedButtonText: {
    fontWeight: 'bold',
  },
  timeSlotContainer: {},
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 10,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 15,
  },
  timeSlotText: {
    fontSize: 16,
    marginBottom: 5,
    //changer style d'ecriture italique
    fontStyle: 'italic',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 15,
  },
});

export default DashboardScreen;
