import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { Expense } from '@/types/expense';
import { useExpenses } from '@/context/ExpenseContext';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

// Pantalla principal: total del mes, lista de gastos y el boton + para agregar
export default function HomeScreen() {
  const { getCurrentMonthExpenses, isLoading, deleteExpense } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortByAmount, setSortByAmount] = useState(false);
  const currentExpenses = getCurrentMonthExpenses();
  const expenses = sortByAmount
    ? [...currentExpenses].sort((first, second) => second.amount - first.amount)
    : currentExpenses;

  const openAddExpense = () => {
    setSelectedExpense(null);
    setModalVisible(true);
  };

  const openEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const closeExpenseModal = () => {
    setModalVisible(false);
    setSelectedExpense(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={styles.gradient}
      >
        {/* Circulos de color detras: dan algo que desenfocar a las tarjetas */}
        <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbOrange]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

            <MonthlyHeader />

            {expenses.length > 0 && (
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setSortByAmount((current) => !current)}
                accessibilityRole="button"
                accessibilityLabel={
                  sortByAmount
                    ? 'Ordenar gastos por fecha'
                    : 'Ordenar gastos de mayor a menor monto'
                }
              >
                <Text style={styles.sortButtonText}>
                  {sortByAmount ? 'Orden: mayor monto ↓' : 'Ordenar por mayor monto'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Si no hay gastos este mes mostramos un mensaje en vez de la lista */}
            {/* Mientras se leen los datos guardados se muestra un indicador;
            sin esto se veria un instante el mensaje de "no hay gastos" */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
              </View>
            ) : expenses.length === 0 ? (
              /* Si no hay gastos este mes mostramos un mensaje en vez de la lista */
              <View style={styles.emptyState}>

                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para agregar tu primer gasto
                </Text>
              </View>
            ) : (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ExpenseItem
                    expense={item}
                    index={index}
                    onEdit={openEditExpense}
                    onDelete={deleteExpense}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Boton + de la esquina */}
          <TouchableOpacity
            style={styles.fab}
            onPress={openAddExpense}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <AddExpenseModal
            visible={modalVisible}
            onClose={closeExpenseModal}
            expense={selectedExpense}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPink: {
    width: 220,
    height: 220,
    top: 60,
    left: -60,
    backgroundColor: 'rgba(255, 107, 157, 0.55)',
  },
  orbOrange: {
    width: 180,
    height: 180,
    top: 260,
    right: -50,
    backgroundColor: 'rgba(255, 159, 94, 0.5)',
  },
  orbPurple: {
    width: 200,
    height: 200,
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(168, 120, 220, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  sortButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  sortButtonText: {
    color: LiquidGlassColors.glassText,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
  },
});
