export type ThemeMode = "light" | "dark";

export const lightTheme = {
    primary: '#2563eb',
    danger: '#ef4444',
    success: '#10b981',
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    inputBackground: '#f9fafb',
    inputBorder: '#d1d5db',
};

export const darkTheme = {
    primary: '#3b82f6',
    danger: '#f87171',
    success: '#34d399',
    background: '#1f2937',
    surface: '#111827',
    text: '#f3f4f6',
    textSecondary: '#9ca3af',
    border: '#374151',
    inputBackground: '#111827',
    inputBorder: '#4b5563',
};

export const getTheme = (mode: ThemeMode) => mode === "light" ? lightTheme : darkTheme;