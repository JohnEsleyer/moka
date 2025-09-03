import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
} from 'react-native';

// Define the shape of each menu item
interface MenuItem {
  id: string;
  icon: React.ReactNode;
  onPress: () => void;
}

// Define the props for the FloatingMenu component
interface FloatingMenuProps {
  menuItems: MenuItem[];
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ menuItems }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  const mainButtonStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    <View style={styles.container}>
      {/* Floating Menu Items - Mapped from props */}
      {menuItems.map((item, index) => {
        const itemBottom = 70 + (index + 1) * 60; // Calculate a unique bottom position for each item

        const itemStyle = {
          position: 'absolute',
          right: 20,
          bottom: itemBottom,
          opacity: animation,
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
        };

        return (
          <Animated.View
    key={item.id}
    style={[
        // Static styles first
        styles.menuItem,
        {
            position: 'absolute',
            right: 20,
            bottom: itemBottom,
        },
        // Animated styles next
        {
            opacity: animation,
            transform: [
                {
                    scale: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    }),
                },
            ],
        },
    ]}
>
    <Pressable onPress={item.onPress}>
        {item.icon}
    </Pressable>
</Animated.View>
        );
      })}

      {/* Main Floating Action Button */}
      <Pressable style={styles.mainButton} onPress={toggleMenu}>
        <Animated.Text style={[styles.mainButtonText, mainButtonStyle]}>
          +
        </Animated.Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    right: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  menuItem: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f1c40f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
  },
  menuItemText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FloatingMenu;