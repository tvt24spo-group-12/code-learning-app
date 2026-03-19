import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../theme/theme';

type ThemeContextType = {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@app_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeMode>('light');
    const [isLoading, setIsLoading] = useState(true);

    // Load theme from AsyncStorage on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_KEY);
                if (savedTheme === 'dark' || savedTheme === 'light') {
                setThemeState(savedTheme);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, []);

    const setTheme = async (newTheme: ThemeMode) => {
        try {
            setThemeState(newTheme);
            await AsyncStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        await setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLoading  }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};