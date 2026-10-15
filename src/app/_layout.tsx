import { Stack } from 'expo-router';
import {SQLiteProvider} from 'expo-sqlite';


import { ExpenseProvider } from '@/context/ExpenseContext';
import {DATABASE_NAME, initDatabase} from '@/database/database';


// SQLiteProvider se encarga de abrir la base de datos y pasarla a los componentes que la necesiten.
// Va por fuera de ExpenseProvider porque este necesita la base de datos para leer y guardar los gastos.
// onInit corre antes de motrar los hijos, asi la tabla ya existe cuando se usa

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <ExpenseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ExpenseProvider>
    </SQLiteProvider>
  );
}


