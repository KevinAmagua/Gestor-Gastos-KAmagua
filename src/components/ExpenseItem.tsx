import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number; // sirve para que cada fila entre un poquito despues de la anterior
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
}

// Una fila de la lista de gastos
export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
}) => {
  // Queda algo como "miércoles, 15 oct"
  const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  // Queda algo como "$15.50"
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar gasto',
      '¿Seguro que quieres eliminar este gasto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void onDelete(expense.id).catch((error: unknown) => {
              console.error('Error al eliminar el gasto', error);
              Alert.alert('Error', 'No se pudo eliminar el gasto. Intenta de nuevo.');
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.container}
    >
      <GlassCard>
        <View>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
                </LinearGradient>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.category}>{expense.category}</Text>
                {expense.description && (
                  <Text style={styles.description} numberOfLines={1}>
                    {expense.description}
                  </Text>
                )}
                {expense.receiptUri && (
                  <Text style={styles.receiptLabel}>🧾 Comprobante adjunto</Text>
                )}
              </View>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.amount}>{formattedAmount}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(expense)}
              accessibilityRole="button"
              accessibilityLabel={`Editar gasto de ${formattedAmount}`}
            >
              <Text style={styles.editAction}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar gasto de ${formattedAmount}`}
            >
              <Text style={styles.deleteAction}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  receiptLabel: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: LiquidGlassColors.glassBorder,
    paddingTop: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  editAction: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteAction: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
});
