import { and, eq, sql } from "drizzle-orm";

import type { Database } from "./client";
import { invites } from "./schema";

export type InviteRow = typeof invites.$inferSelect;

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Pure check: unused capacity and not past expiry. */
export function isInviteRedeemable(
  invite: Pick<InviteRow, "maxUses" | "useCount" | "expiresAt">,
  now: Date = new Date(),
): boolean {
  if (invite.useCount >= invite.maxUses) return false;
  if (invite.expiresAt !== null && invite.expiresAt.getTime() <= now.getTime()) return false;
  return true;
}

export async function findInviteByCode(db: Database, code: string): Promise<InviteRow | null> {
  const normalized = normalizeInviteCode(code);
  const rows = await db.select().from(invites).where(eq(invites.code, normalized)).limit(1);
  return rows[0] ?? null;
}

export async function findValidInvite(db: Database, code: string): Promise<InviteRow | null> {
  const invite = await findInviteByCode(db, code);
  if (!invite || !isInviteRedeemable(invite)) return null;
  return invite;
}

/** Atomically increments use_count when capacity remains. Returns false if spent. */
export async function consumeInvite(db: Database, code: string): Promise<boolean> {
  const normalized = normalizeInviteCode(code);
  const updated = await db
    .update(invites)
    .set({ useCount: sql`${invites.useCount} + 1` })
    .where(
      and(
        eq(invites.code, normalized),
        sql`${invites.useCount} < ${invites.maxUses}`,
        sql`(${invites.expiresAt} IS NULL OR ${invites.expiresAt} > now())`,
      ),
    )
    .returning({ id: invites.id });
  return updated.length > 0;
}
