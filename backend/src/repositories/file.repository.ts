import { eq, and, sql } from "drizzle-orm";
import { db } from "../configs/drizzle.js";
import { filesTable, directoriesTable } from "../db/schema.js";


export type NewFile = typeof filesTable.$inferInsert;

export class FileRepository {
  async create(data: NewFile) {
    return await db.transaction(async (tx) => {
      const [newFile] = await tx.insert(filesTable).values(data).returning();

      if (!newFile) {
        throw new Error("File creation failed");
      }
      await tx.update(directoriesTable)
        .set({
          size: sql`${directoriesTable.size} + ${newFile.size}` 
        })
        .where(eq(directoriesTable.id, newFile.parentDirId));

      return newFile;
    });
  }

  async findAllByDirectoryId(userId: string, parentDirId: string) {
    return await db
      .select()
      .from(filesTable)
      .where(
        and(
          eq(filesTable.userId, userId),
          eq(filesTable.parentDirId, parentDirId)
        )
      );
  }

  async findById(fileId: string) {
    const [file] = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.id, fileId));
      
    return file || null;
  }

  async update(fileId: string, data: Partial<NewFile>) {
    const [updatedFile] = await db
      .update(filesTable)
      .set(data)
      .where(eq(filesTable.id, fileId))
      .returning();
      
    return updatedFile || null;
  }

  async delete(fileId: string) {
    return await db.transaction(async (tx) => {
      const [fileToDelete] = await tx.select().from(filesTable).where(eq(filesTable.id, fileId));
      
      if (!fileToDelete) {
        throw new Error("File not found");
      }

      await tx.delete(filesTable).where(eq(filesTable.id, fileId));

      await tx.update(directoriesTable)
        .set({ 
          size: sql`${directoriesTable.size} - ${fileToDelete.size}` 
        })
        .where(eq(directoriesTable.id, fileToDelete.parentDirId));

      return fileToDelete;
    });
  }
}