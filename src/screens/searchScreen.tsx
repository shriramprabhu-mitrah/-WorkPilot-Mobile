import { ScrollView, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const SearchScreen = () => {
    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="flex-grow">
                <Text>Search Screen</Text>
            </ScrollView>
        </SafeAreaView>
    )
}
export default SearchScreen