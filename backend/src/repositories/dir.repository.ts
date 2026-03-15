import { eq, and } from "drizzle-orm";
import { db } from "../configs/drizzle.js";
import { directoriesTable } from "../db/schema.js";

export type NewDirectory = typeof directoriesTable.$inferInsert;

export class DirectoryRepository {
  
  // 1. Create a directory
  async create(data: NewDirectory) {
    const [dir] = await db.insert(directoriesTable).values(data).returning();
    return dir;
  }

  // 2. List all directories (for a specific user)
  async findAllByUserId(userId: string) {
    return await db
      .select()
      .from(directoriesTable)
      .where(eq(directoriesTable.userId, userId));
  }

  // 3. List directory by ID
  async findById(dirId: string) {
    const [dir] = await db
      .select()
      .from(directoriesTable)
      .where(eq(directoriesTable.id, dirId));
      
    return dir || null;
  }

  // Bonus: List sub-directories inside a specific parent folder
  async findChildren(userId: string, parentDirId: string) {
    return await db
      .select()
      .from(directoriesTable)
      .where(
        and(
          eq(directoriesTable.userId, userId),
          eq(directoriesTable.parentDirId, parentDirId)
        )
      );
  }

  // 4. Update directory (e.g., renaming a folder or moving it)
  async update(dirId: string, data: Partial<NewDirectory>) {
    const [updatedDir] = await db
      .update(directoriesTable)
      .set(data)
      .where(eq(directoriesTable.id, dirId))
      .returning();
      
    return updatedDir || null;
  }
}