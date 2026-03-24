import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

const auditFields = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 25 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile: text("profile"),
  isPremium: boolean("is_premium").default(false),
  ...auditFields
});

export const userStorageTable = pgTable("users_storage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => usersTable.id, {onDelete: 'cascade'}),
  totalStorageLimit: integer("total_storage_limit").notNull(),
  fileUploadLimit: integer("file_upload_limit").notNull(),
  ...auditFields
});

export const directoriesTable = pgTable("directories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  parentDirId: uuid("parent_dir_id")
    .references((): any => directoriesTable.id, { onDelete: "cascade" }),
  size: integer("size").default(0),
  ...auditFields
}, (table) => [
  index("dir_parent_idx").on(table.parentDirId),
  index("dir_user_idx").on(table.userId),
]);

export const filesTable = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ext: text("ext").notNull(),
  mimetype: text("mimetype"),
  size: integer("size").notNull(),
  path: text("path"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  parentDirId: uuid("parent_dir_id")
    .notNull()
    .references(() => directoriesTable.id, { onDelete: "cascade" }),
  ...auditFields
}, (table) => [
  index("file_parent_idx").on(table.parentDirId),
  index("file_user_idx").on(table.userId),
]);

export const relation = defineRelations({ usersTable, directoriesTable, filesTable, userStorageTable }, (r) => ({
  usersTable: {
    directories: r.many.directoriesTable({
      from: r.usersTable.id,           
      to: r.directoriesTable.userId    
    }),
    files: r.many.filesTable({
      from: r.usersTable.id,           
      to: r.filesTable.userId          
    }),
    storage: r.one.userStorageTable({
      from: r.usersTable.id,           
      to: r.userStorageTable.userId    
    })
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
    }),
    files: r.many.filesTable({
      from: r.directoriesTable.id,     
      to: r.filesTable.parentDirId
    })
  },
  filesTable: {
    directory: r.one.directoriesTable({
      from: r.filesTable.parentDirId,
      to: r.directoriesTable.id
    }),
    owner: r.one.usersTable({
      from: r.filesTable.userId,
      to: r.usersTable.id
    }),
  },
  userStorageTable:{
    owner: r.one.usersTable({
      from: r.userStorageTable.userId,
      to: r.usersTable.id
    })
  }
}));

export type User = typeof usersTable.$inferSelect;