import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/Colors";

interface CategoryItemProps {
    icon: string;
    title: string;
    onPress: () => void;
}
const CategoryItem: React.FC<CategoryItemProps> = ({
    icon,
    title,
    onPress,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

export default CategoryItem;
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        width: 80,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8
    },
    icon: {
        fontSize: 24
    },
    title: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center"
    }
})