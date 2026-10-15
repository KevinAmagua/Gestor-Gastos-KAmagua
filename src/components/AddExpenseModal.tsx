import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { Category, CATEGORIES, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense } from '@/types/expense';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

// Modal que sube desde abajo para registrar un gasto.
// Para poder agregarlo hacen falta el monto y la categoria; la descripcion es opcional.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expense,
}) => {
  const { addExpense, updateExpense } = useExpenses();
  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setAmount(expense ? expense.amount.toFixed(2) : '');
    setCategory(expense?.category ?? null);
    setDescription(expense?.description ?? '');
    setReceiptUri(expense?.receiptUri ?? null);
  }, [visible, expense]);

  const handlePickReceipt = async (source: 'camera' | 'library') => {
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          source === 'camera'
            ? 'Permite el acceso a la cámara para tomar una foto del comprobante.'
            : 'Permite el acceso a las fotos para elegir un comprobante.'
        );
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });

      if (!result.canceled) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar el comprobante', error);
      Alert.alert('Error', 'No se pudo seleccionar el comprobante.');
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.,]/g, '');
    const separatorIndex = cleaned.search(/[.,]/);

    if (separatorIndex === -1) {
      setAmount(cleaned);
      return;
    }

    const integerPart = cleaned.slice(0, separatorIndex) || '0';
    const decimalPart = cleaned
      .slice(separatorIndex + 1)
      .replace(/[.,]/g, '')
      .slice(0, 2);

    setAmount(`${integerPart}.${decimalPart}`);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text.replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 400));
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert(
        'Categoría requerida',
        'Selecciona una categoría antes de guardar el gasto.'
      );
      return;
    }

    const normalizedAmount = amount.replace(',', '.');

    if (!/^\d+\.\d{2}$/.test(normalizedAmount)) {
      Alert.alert(
        'Monto inválido',
        'Ingresa un monto con exactamente dos decimales, por ejemplo 12.50.'
      );
      return;
    }

    try {
      const amountValue = Number(normalizedAmount);
      if (!Number.isFinite(amountValue) || amountValue <= 0) {
        Alert.alert('Monto inválido', 'Ingresa un monto mayor que cero.');
        return;
      }

      const updatedFields = {
        amount: amountValue,
        category,
        date: expense?.date ?? new Date(),
        description: description.trim() || undefined,
        receiptUri: receiptUri ?? undefined,
      };
      if (expense) {
        await updateExpense({ ...updatedFields, id: expense.id });
      } else {
        await addExpense(updatedFields);
      }
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
      return;
    }
 
    // Reset form
    setAmount('');
    setCategory(null);
    setDescription('');
    setReceiptUri(null);
    onClose();
  };


  // Igual que al guardar, se limpia el formulario para que no quede texto viejo
  const handleClose = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setReceiptUri(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>
                  {expense ? 'Editar Gasto' : 'Agregar Gasto'}
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="Ej: Almuerzo, transporte a la universidad..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    maxLength={400}
                    multiline
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura o comprobante (opcional)</Text>
                  <View style={styles.receiptButtons}>
                    <TouchableOpacity
                      style={styles.receiptButton}
                      onPress={() => handlePickReceipt('library')}
                    >
                      <Text style={styles.receiptButtonText}>Elegir de galería</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.receiptButton}
                      onPress={() => handlePickReceipt('camera')}
                    >
                      <Text style={styles.receiptButtonText}>Tomar foto</Text>
                    </TouchableOpacity>
                  </View>
                  {receiptUri && (
                    <View style={styles.receiptPreviewContainer}>
                      <Image
                        source={{ uri: receiptUri }}
                        style={styles.receiptPreview}
                        accessibilityLabel="Vista previa del comprobante"
                      />
                      <TouchableOpacity
                        onPress={() => setReceiptUri(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Quitar comprobante"
                      >
                        <Text style={styles.removeReceiptText}>Quitar imagen</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!amount || !category) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!amount || !category}
                  >
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {expense ? 'Guardar cambios' : 'Agregar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  receiptButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  receiptButtonText: {
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
    textAlign: 'center',
  },
  receiptPreviewContainer: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  receiptPreview: {
    width: 120,
    height: 120,
    borderRadius: Spacing.two,
    resizeMode: 'cover',
  },
  removeReceiptText: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
});
