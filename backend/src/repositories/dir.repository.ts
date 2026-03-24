import { eq, and, sql } from "drizzle-orm";
import { db } from "../configs/drizzle.js";
import { directoriesTable, filesTable } from "../db/schema.js";

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
          eq(directoriesTable.parentDirId, parentDirId),
        ),
      );
  }

  async update(dirId: string, userId: string, data: Partial<NewDirectory>) {
    const [updatedDir] = await db
      .update(directoriesTable)
      .set(data)
      .where(
        and(
          eq(directoriesTable.id, dirId),
          eq(directoriesTable.userId, userId),
        ),
      )
      .returning();

    return updatedDir;
  }

  async deleteDirectoryAndGetFiles(dirId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const filesResult = await tx.execute(sql`
        WITH RECURSIVE dir_tree AS (
          SELECT id FROM ${directoriesTable} 
          WHERE id = ${dirId} AND user_id = ${userId}
          
          UNION ALL
          
          SELECT d.id FROM ${directoriesTable} d
          INNER JOIN dir_tree t ON d.parent_dir_id = t.id
        )
        SELECT id, ext FROM ${filesTable} 
        WHERE parent_dir_id IN (SELECT id FROM dir_tree)
      `);

      // Construct the filenames: e.g., "123e4567-e89b-12d3.pdf"
      const fileNames = filesResult.rows.map(
        (file: any) => `${file.id}${file.ext}`,
      );

      // This single query deletes the folder, all sub-folders,
      // and all files inside them automatically!
      const [deletedDir] = await db
        .delete(directoriesTable)
        .where(
          and(
            eq(directoriesTable.id, dirId),
            eq(directoriesTable.userId, userId),
          ),
        )
        .returning();

      return { deletedDir, fileNames };
    });
  }

  async getDirectoryContents(directoryId: string, userId: string) {
    const [directory] = await db
      .select()
      .from(directoriesTable)
      .where(
        and(
          eq(directoriesTable.id, directoryId),
          eq(directoriesTable.userId, userId),
        ),
      );
    if (!directory) {
      return null;
    }

    const [children, files] = await Promise.all([
      db
        .select()
        .from(directoriesTable)
        .where(eq(directoriesTable.parentDirId, directoryId)),

      db
        .select()
        .from(filesTable)
        .where(eq(filesTable.parentDirId, directoryId)),
    ]);

    return {
      ...directory,
      children,
      files,
    };
  }
}