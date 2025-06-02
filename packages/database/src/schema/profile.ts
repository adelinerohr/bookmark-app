import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { Users } from "./auth";

export const Profile = pgTable("profile", {
  // Matches id from auth.users table in Supabase
  id: uuid("id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image"),
  email: text("email").notNull(),
});
