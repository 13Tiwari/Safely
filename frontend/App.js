import React, { useState, useEffect } from 'react';  
import { Image, View, StyleSheet, Text, Modal, Button } from 'react-native'; 
import CustomButton from './components/Button';
import EmergencyButton from './components/EmergencyButton';
import AddContactButton from './components/AddContactButton';
import CrimeRateModal from './components/CrimeRateModal';
import ReportingModal from './components/ReportingModal'; 
import EmergencyContactsModal from './components/EmergencyContactsModal'; 
import LocationMap from './components/LocationMap';
import { TOKEN } from '@env'; 
import axios from 'axios';

const AppScreen = () => {
  const [crimeRateModalVisible, setCrimeRateModalVisible] = useState(false);
  const [reportingModalVisible, setReportingModalVisible] = useState(false);
  const [emergencyContactsModalVisible, setEmergencyContactsModalVisible] = useState(false);
  const [city, setCity] = useState(''); 
  const [region, setRegion] = useState(''); 
  const [country, setCountry] = useState(''); 
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [safetyScore, setSafetyScore] = useState(null);

  useEffect(() => {
    const fetchSafetyScore = async () => {
      try {
        const response = await axios.get('http://10.29.26.230:5000/api/safety');
        console.log('Safety Score Data:', response.data);
        setSafetyScore(response.data.safety_score);
      } catch (error) {
        console.error('Error fetching safety score:', error);
      }
    };

    fetchSafetyScore();
  }, []);

  // Fetch location using IP info API
  useEffect(() => {
    fetch(`https://ipinfo.io/json?token=${TOKEN}`) 
      .then(response => response.json())
      .then(data => {
        setCity(data.city || 'Unknown City');
        setRegion(data.region || 'Unknown Region');
        setCountry(data.country || 'Unknown Country');
        
        if (data.loc) {
          const [lat, lon] = data.loc.split(',');
          setLatitude(parseFloat(lat));
          setLongitude(parseFloat(lon));
        } else {
          console.error('Location data not found');
        }
      })
      .catch(error => {
        console.error('Error fetching location:', error);
        setCity('Error fetching city'); 
      });
  }, []);

  const handlePress = (name) => {
    if (name === 'Crime Rate') {
      setCrimeRateModalVisible(true);
    } else if (name === 'Reporting') {
      setReportingModalVisible(true);
    } else if (name === 'Emergency Contacts') {
      setEmergencyContactsModalVisible(true);
    }
  };

  const closeModal = (name) => {
    if (name === 'Crime Rate') {
      setCrimeRateModalVisible(false);
    } else if (name === 'Reporting') {
      setReportingModalVisible(false);
    } else if (name === 'Emergency Contacts') {
      setEmergencyContactsModalVisible(false); // Corrected this line
    }
  };

  const handleUnsafePress = () => {
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/Logo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Crime Rate"
          onPress={() => handlePress('Crime Rate')}
          mode="contained"
        />
        <CustomButton
          title="Reporting"
          onPress={() => handlePress('Reporting')}
          mode="contained"
        />
      </View>

      <CrimeRateModal
        visible={crimeRateModalVisible}
        location={`${city}, ${region}, ${country}`}
        onClose={() => closeModal('Crime Rate')}
        crimePercentage={`${safetyScore}`} 
      />

      <ReportingModal
        visible={reportingModalVisible}
        latitude={`${latitude}`}
        longitude={`${longitude}`}
        onClose={() => closeModal('Reporting')}
      />

      <EmergencyContactsModal
        visible={emergencyContactsModalVisible}
        onClose={() => closeModal('Emergency Contacts')}
      />

      <LocationMap latitude={latitude} longitude={longitude} />

      <View style={styles.emergencyButtonContainer}>
        <View style={styles.buttonRow}>
          <EmergencyButton
            title="Unsafe"
            onPress={handleUnsafePress}
          />
          <EmergencyButton
            title="Uncomfortable"
            onPress={() => console.log('Button 2 pressed')}
          />
        </View>
        <View style={styles.buttonRow}>
          <EmergencyButton
            title="Medical Emergency"
            onPress={() => console.log('Button 3 pressed')}
          />
          <EmergencyButton
            title="Help"
            onPress={() => console.log('Button 4 pressed')}
          />
        </View>
      </View>

      {notificationVisible && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>Notification sent</Text>
        </View>
      )}

      <AddContactButton
        title="Emergency Contacts"
        onPress={() => setEmergencyContactsModalVisible(true)} // Corrected this line
      />
    </View>
  );
};

export default AppScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    backgroundColor: '#FFFDD0',
  },
  logo: {
    width: 200, 
    height: 150, 
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  buttonContainer: {
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonGrid: {
    flexDirection: 'column',
    marginTop: 10, 
    paddingBottom: 20, 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  emergencyButtonContainer: {
    marginTop: 20,
  },
  notification: {
    position: 'absolute',
    bottom: '30%',
    backgroundColor: 'black',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  notificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
