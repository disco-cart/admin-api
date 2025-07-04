import { relations } from "drizzle-orm"
import { pgEnum, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { UsersTable } from "../users/schema"

export const AccountsTable = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  primaryUserId: uuid('primary_user_id').notNull().references(() => UsersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const AccountRoles = pgEnum('account_roles', [
  'EDITOR',
  'VIEWER',
])

export const AccountMembershipsTable = pgTable('account_memberships', {
  accountId: uuid('account_id').notNull().references(() => AccountsTable.id),
  userId: uuid('user_id').notNull().references(() => UsersTable.id),
  role: AccountRoles('role').default('EDITOR').notNull(),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at'),
},
  (table) => [
    primaryKey({
      name: 'pk_account_memberships',
      columns: [table.accountId, table.userId],
    })
  ]
)

export const accountsRelations = relations(AccountsTable, ({ many, one }) => ({
  memberships: many(AccountMembershipsTable),
  primaryUser: one(UsersTable, {
    fields: [AccountsTable.primaryUserId],
    references: [UsersTable.id],
  }),
}))

export const accountMembershipsRelations = relations(AccountMembershipsTable, ({ one }) => ({
  account: one(AccountsTable, {
    fields: [AccountMembershipsTable.accountId],
    references: [AccountsTable.id],
  }),
  user: one(UsersTable, {
    fields: [AccountMembershipsTable.userId],
    references: [UsersTable.id],
  }),
}))