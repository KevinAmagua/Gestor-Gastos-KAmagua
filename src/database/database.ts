import {SQLiteDatabase} from 'expo-sqlite';

// Nombre del archivo base de datos que se crea dentro del telefono
export const DATABASE_NAME = 'gastos.db';

// Se ejecuta una vez cada vez que se abre la app, (Lo llama SQLiteProvider)
// Aqui se crean las tablas si no existen y se hacen migraciones si es necesario.
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
 // execAsync permite ejecutar varias sentencias SQL en una sola transaccion.
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL, 
            description TEXT
        );
    `);

}
