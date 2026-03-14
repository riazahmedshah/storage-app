import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm"

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  username: varchar("username", { length: 25 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile: text("profile"),
  isPremium: boolean("isPremium").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const directoriesTable = pgTable("directories", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  name: text("name").notNull(),
  userId: uuid("userId").notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
  parentDirId: uuid("parentDirId").references((): any => directoriesTable.id, {onDelete: 'cascade'}),
  size: integer()
}, (table) => [
  index("parent_idx").on(table.parentDirId)
]);

export const userRelation = defineRelations({usersTable, directoriesTable}, (r) => ({
  usersTable:{
    directories: r.many.directoriesTable({
      from: r.usersTable.id,
      to: r.directoriesTable.userId
    }),
  },

  directoriesTable: {
    owner: r.one.usersTable({
      from: r.directoriesTable.userId,
      to: r.usersTable.id
    }),

    parent: r.one.directoriesTable({
      from: r.directoriesTable.parentDirId,
      to: r.directoriesTable.id
    }),

    children: r.many.directoriesTable({
      from: r.directoriesTable.id,
      to: r.directoriesTable.parentDirId
    })
  }
}))
