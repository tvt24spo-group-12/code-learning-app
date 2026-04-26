import { StyleSheet } from 'react-native';
import { ThemeMode } from './theme';
import { getTheme } from './theme';

export const createGlobalStyles = (mode: ThemeMode) => {
    const colors = getTheme(mode);

    return StyleSheet.create({
        // Containers
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: 16,
            paddingVertical: 20,
        },
        screenContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },

        // Text
        heading: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
        },
        subheading: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        bodyText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
        },
        label: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 6,
            textTransform: 'uppercase',
        },

        // Inputs
        input: {
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: colors.text,
            marginBottom: 12,
        },

        // Buttons
        button: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonPrimary: {
            backgroundColor: colors.primary,
        },
        buttonDanger: {
            backgroundColor: colors.danger,
        },
        buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },

        // Card/Section
        card: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
        },

        bannerIcon: {
            marginLeft: 10,
            paddingRight: 10,
        },
        bannerTitle: {
            color: colors.bannerText,
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'left',
        },
        bannerBottomText: {
            color: colors.bannerText,
            fontSize: 14,
            marginTop: 5,
            textAlign: 'left',
        },

        // Separator
        divider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 12,
        },

        // Password show hide icon
        passwordShowIcon: {
            position: "absolute",
            right: 6,
            top: 0,
            bottom: 10,
            justifyContent: "center",
            alignItems: "center",
            width: 40,
        },

        // Loading wheel (a throbber)
        loading: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
