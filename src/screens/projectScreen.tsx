import { ScrollView, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const ProjectScreen = () => {
    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="flex-grow">
                <Text>Project Screen</Text>
            </ScrollView>
        </SafeAreaView>
    )
}
export default ProjectScreen