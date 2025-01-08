import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SpecialtyListModal = ({ visible, onClose, onSpecialtyPress, selectedSpecialties }) => {
  const specialtyList = [
    'Oil Change and Filter Replacement',
    'Computerized Engine Diagnostics',
    'Brake Pad and Rotor Replacement',
    'Tire Repair and Vulcanizing',
    'Timing Belt or Chain Replacement',
    'Radiator Flush and Coolant Replacement',
    'Shock Absorber and Strut Replacement',
    'Transmission Fluid Service',
    'AC Recharge and Compressor Repair',
    'Battery Testing and Replacement',
  ];

  const handleSpecialtyPress = (specialty) => {
    onSpecialtyPress(specialty);
  };

  return (
    <Modal
      visible={visible}
      onBackdropPress={onClose}
    >
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
        <FlatList
          data={specialtyList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                backgroundColor: selectedSpecialties.includes(item) ? '#4CAF50' : '#fff',
              }}
              onPress={() => handleSpecialtyPress(item)}
            >
              <Text style={{ fontSize: 16, color: selectedSpecialties.includes(item) ? '#fff' : '#333' }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>
    </Modal>
  );
};

export default SpecialtyListModal;