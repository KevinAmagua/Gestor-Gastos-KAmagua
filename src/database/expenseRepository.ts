import {SQLiteDatabase} from 'expo-sqlite';
import {Category, Expense} from '@/types/expense';


// Forma en que una fila llega desde SQLite
// No es igual a Expense porque SQLite no tiene tipo Date ni enum Category
interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

// Convierte una fila de SQLite a un objeto Expense que entiende la app
function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Category,
    date: new Date(row.date), // Texto ISO -> Date
    description: row.description || undefined,  // null -> undefined
  };
}

// Devuelve todos los gastos guardados en la base de datos SQLite del mas reciente al mas antiguo
export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
  // getAllExpenses ejecuta un SELECT y devuelve un arreglo de Expense con todas las filas
    const rows = await db.getAllAsync<ExpenseRow>(
        'SELECT id,amount,category,date,description FROM expenses ORDER BY date DESC;');

    return rows.map(rowToExpense);
}

// Inserta UN gasto. A diferencia de AsyncStorage, SQLite si sabe agregar un elemento sin borrar los demas.
export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    // Los signos ? son parametros: SQLite reemplaza cada ? con el valor correspondiente del arreglo que sigue a la sentencia SQL.   
    // Nunca se arma el SQL concatenando strings, asi se evita la inyeccion de SQL.
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?);',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(),  // date -> texto ISO
        expense.description ?? null // undefined -> null
    );
}