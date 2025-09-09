import React, { useState, useRef } from 'react';
import { StyleSheet, Pressable, Animated, View } from 'react-native';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  onPress: () => void;
}

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
    }).start(() => setIsMenuOpen(!isMenuOpen));
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const mainButtonStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    // 💡 FIX: The main container now has absolute positioning
    <View style={styles.container}>
      {/* Floating Menu Items - Mapped from props */}
      {isMenuOpen && menuItems.map((item, index) => {
        const itemBottom = 70 + (index + 1) * 60;

        const itemStyle = {
          opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
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
            style={[styles.menuItem, { bottom: itemBottom }, itemStyle]}
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
    // 💡 FIX: Make the container itself an overlay
    position: 'absolute',
    bottom: 50,
    right: 20,
    alignItems: 'center',
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
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
    // 💡 FIX: These are now positioned relative to the container
    position: 'absolute',
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
});

export default FloatingMenu;