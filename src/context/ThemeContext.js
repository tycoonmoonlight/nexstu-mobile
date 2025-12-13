import React from 'react';

// 1. Define Global Colors
export const DarkColors = { 
    bg: '#000000', 
    card: '#121212', 
    text: '#ffffff', 
    textSec: '#a1a1aa', 
    border: '#27272a', 
    accent: '#FACC15', 
    icon: '#fff' 
};

export const LightColors = { 
    bg: '#ffffff', 
    card: '#f4f4f5', 
    text: '#000000', 
    textSec: '#52525b', 
    border: '#e4e4e7', 
    accent: '#ca8a04', 
    icon: '#000' 
};

// 2. Create the Context
export const ThemeContext = React.createContext({
    theme: DarkColors,
    isDarkMode: true,
    toggleTheme: () => {}
});
