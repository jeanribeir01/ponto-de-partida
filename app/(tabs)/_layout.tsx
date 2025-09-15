import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'purple' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="add-client"
                options={{
                    title: 'Adicionar Cliente',
                    tabBarIcon: ({ color }) => <FontAwesome name="plus" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}