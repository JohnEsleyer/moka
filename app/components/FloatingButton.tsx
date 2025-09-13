import React, { useState, useRef } from 'react';
import { StyleSheet, Pressable, Animated, View } from 'react-native';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface FloatingMenuProps {
  icon: React.ReactNode;
  onPress: () => void;
}

const FloatingButton: React.FC<FloatingMenuProps> = ({ icon, onPress}) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.container, {transform: [{scale: scaleAnimation}]}]}>
      <Pressable
        style={styles.button}
        onPressIn={() => {
          Animated.spring(scaleAnimation, {
            toValue: 0.9,
            useNativeDriver: true,
          }).start();
          onPress();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnimation, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }}
      >{icon}</Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2c3e50', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default FloatingButton;