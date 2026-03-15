import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = `${process.env.DATABASE_URL}`
export const db = drizzle(connectionString);
console.log(`Database Connected`);

// export async function connectDB() {
//   try {
//     const db = drizzle(connectionString);
//     console.log(`Database Connected`);
//     return db;
//   } catch (error) {
//     console.error(`Error: ${error instanceof Error ? error.message : error}`);
//     process.exit(1);
//   }
// }