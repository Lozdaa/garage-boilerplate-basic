'use server'

import { requireAuth } from "@/actions/auth.actions"
import { adminDb } from "@/lib/firebase/admin"
import { idSchema } from "@/lib/validations/common"
import type { ActionResult } from "@/types"

export async function resolveSOS(pendantID:string): Promise<ActionResult> {
    // 1. Is authenticated user logged in?
    // Redirect Sign-in
    const session = await requireAuth()

    // 2. make sure all inputs from browser are safe and correct
    const parsed = idSchema.safeParse(pendantID)
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.errors[0]?.message ?? 'Invalid pendant id'
        }
    }

    // 3. Write to server with admin sdk (bypasses rules, which is why we checked auth first)
    try {
        await adminDb.collection('pendants').doc(parsed.data).update({
            sosActive: false,
            sosResolvedAt: new Date(),
            sosResolvedBy: session.uid, // recording for auditing
        })
        return { success: true }
    } catch {
        return {
            success: false,
            error: 'Could not Resolve SOS'
        }
    }
}