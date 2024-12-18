import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Firebase configuration
import AppBar from './AppBar'; // Import AppBar component

const FeedbackScreen = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0); // State for rating

  const handleStarPress = (index) => {
    setRating(index + 1); // Set rating based on star index
  };

  const handleSubmitFeedback = async () => {
    if (feedbackText.trim() === '') {
      Alert.alert('Feedback Required', 'Please provide your feedback before submitting.');
      return;
    }

    try {
      const userId = auth.currentUser ?.uid;
      if (!userId) {
        Alert.alert('Authentication Error', 'You must be logged in to submit feedback.');
        return;
      }

      // Add feedback to Firebase
      await addDoc(collection(db, 'feedback'), {
        userId: userId,
        feedbackText: feedbackText,
        rating: rating, // Include rating in the feedback
        createdAt: new Date(),
      });

      // Reset the form
      setFeedbackText('');
      setRating(0); // Reset rating
      Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Submission Error', 'There was an error submitting your feedback. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <View style={styles.content}>
        <Text style={styles.title}>Feedback</Text>

        {/* Star Rating */}
        <View style={styles.starContainer}>
          {[...Array(5)].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => handleStarPress(index)}>
              <Ionicons
                name={index < rating ? 'star' : 'star-outline'}
                size={32}
                color="#FFD700" // Gold color for stars
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write your feedback here..."
          value={feedbackText}
          onChangeText={setFeedbackText}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});