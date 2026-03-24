import { and, eq, isNull } from "drizzle-orm";
import { db } from "../configs/drizzle.js";
import { directoriesTable, usersTable } from "../db/schema.js";

export type newUser = typeof usersTable.$inferInsert;

export class UserRepository {
  async cretaeUser(data: newUser){
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(usersTable).values(data).returning()
      
      await tx.insert(directoriesTable).values({
        name: `root-${user?.email}`,
        userId: user?.id!,
        parentDirId: null
      });

      return user;
    });
  };

  async findUserById(userId: string){
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    return user || null;
  };

  async findUserByEmail(email:string){
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    return user || null;
  };

  async getUserWithRootDirId(userId: string){
    const result = await db
      .select({
        user: usersTable,
        rootDirectoryId: directoriesTable.id,
      })
      .from(usersTable)
      .leftJoin(
        directoriesTable,
        and(
          eq(directoriesTable.userId, usersTable.id),
          isNull(directoriesTable.parentDirId)
        )
      )
      .where(eq(usersTable.id, userId));

    return result[0];
  }
}