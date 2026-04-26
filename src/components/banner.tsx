import { Text, View, StyleSheet, Dimensions } from "react-native";
import { GraduationCap, CodeXml, Settings } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { createGlobalStyles } from "../theme/globalStyles";
import Svg, { Path } from "react-native-svg";
import { getTheme } from "../theme/theme";

const { width } = Dimensions.get("window");

//määritellään propsit
interface bannerProps {
    title: string;
    bottomText: string;
    isHome?: boolean;
    isSettings?: boolean;
}

export default function Banner({ title, bottomText, isHome, isSettings }: bannerProps) {
    const { theme } = useTheme();
    const globalStyles = createGlobalStyles(theme);
    const colors = getTheme(theme);

    const renderIcon = () => {
        if (isHome) {
            return <CodeXml color="white" size={65} />;
        }
        else if (isSettings) {
            return <Settings color="white" size={65} />;
        } else {
            return <GraduationCap color="white" size={65} />;
        }
    };

    //luodaan "simppeli" svg pathi bannerille niin saadaan wawe efekti
    const bannerPath = ` 
    M0,0 L${width},
    0 L${width},
    130 C${width * 0.75},
    170 ${width * 0.5},
    95, 0, 140 Z`

    return (
        <View style={{ marginTop: -10, marginBottom: -44, height: 220, width: "100%" }}>
            <View style={StyleSheet.absoluteFill}>
                <Svg viewBox={`0 0 ${width} 200`}>
                    <Path
                        d={bannerPath}
                        fill={colors.bannerBackground}
                    />
                </Svg>
            </View>
            <View style={{
                flexDirection: 'row',
                marginTop: 74,
                paddingHorizontal: 25,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={globalStyles.bannerTitle}>{title}</Text>
                    <Text style={globalStyles.bannerBottomText}>
                        {bottomText}
                    </Text>
                </View>
                <View style={globalStyles.bannerIcon}>
                    {renderIcon()}
                </View>
            </View>
        </View>
    );
};