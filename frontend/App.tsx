import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/styles/colors';
import { healthApi } from './src/services/api';
import CreateOrderScreen from './src/components/CreateOrderScreen';
import OrderListScreen from './src/components/OrderListScreen';

export type RootStackParamList = {
  OrderList: undefined;
  CreateOrder: undefined;
};

export type StackNavigationProps = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealthAndStart();
  }, []);

  const checkHealthAndStart = async () => {
    try {
      // Try to reach the health endpoint with retries
      let attempts = 0;
      const maxAttempts = 10;
      const retryDelay = 2000; // 2 seconds

      while (attempts < maxAttempts) {
        try {
          await healthApi.check();
          setIsLoading(false);
          setError(null);
          return;
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw err;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setError('Unable to connect to server. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.splashContainer}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <View style={styles.splashContent}>
            <Text style={styles.splashTitle}>Food Order App</Text>
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            <Text style={styles.splashSubtitle}>Connecting to server...</Text>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.splashContainer}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <View style={styles.splashContent}>
            <Text style={styles.splashTitle}>Food Order App</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={checkHealthAndStart}>
              Tap to retry
            </Text>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 40,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
