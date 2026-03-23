import { eq, and } from "drizzle-orm";
import { db } from "../configs/drizzle.js";
import { directoriesTable } from "../db/schema.js";

export type NewDirectory = typeof directoriesTable.$inferInsert;

export class DirectoryRepository {
  
  async create(data: NewDirectory) {
    const [dir] = await db.insert(directoriesTable).values(data).returning();
    return dir;
  }

  async findAllByUserId(userId: string) {
    return await db
      .select()
      .from(directoriesTable)
      .where(eq(directoriesTable.userId, userId));
  }

  async findById(dirId: string) {
    const [dir] = await db
      .select()
      .from(directoriesTable)
      .where(eq(directoriesTable.id, dirId));
      
    return dir || null;
  }

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

  async update(dirId: string, data: Partial<NewDirectory>) {
    const [updatedDir] = await db
      .update(directoriesTable)
      .set(data)
      .where(eq(directoriesTable.id, dirId))
      .returning();
      
    return updatedDir || null;
  }
}