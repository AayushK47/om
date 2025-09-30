import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/styles/colors';
import CreateOrderScreen from './src/components/CreateOrderScreen';
import OrderListScreen from './src/components/OrderListScreen';

export type RootStackParamList = {
  OrderList: undefined;
  CreateOrder: undefined;
};

export type StackNavigationProps = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Stack.Navigator
          id={undefined}
          initialRouteName="OrderList"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            cardStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="OrderList"
            component={OrderListScreenWrapper}
            options={{
              title: 'Food Orders',
              headerLeft: () => null,
            }}
          />
          <Stack.Screen
            name="CreateOrder"
            component={CreateOrderScreenWrapper}
            options={{
              title: '',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Wrapper component to handle navigation in OrderListScreen
function OrderListScreenWrapper({ navigation }: { navigation: StackNavigationProps }) {
  return <OrderListScreen navigation={navigation} />;
}

// Wrapper component to handle navigation in CreateOrderScreen
function CreateOrderScreenWrapper({ navigation, route }: any) {
  const handleOrderCreated = () => {
    // Navigate back and refresh the order list
    navigation.navigate('OrderList', { refresh: Date.now() });
  };

  return <CreateOrderScreen onOrderCreated={handleOrderCreated} />;
}
