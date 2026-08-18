"use server";

import {
    revalidatePath,
} from "next/cache";
import {
    redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } =
        await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

    if (
        profile?.is_admin !==
        true
    ) {
        redirect(
            "/dashboard"
        );
    }

    return user;
}

export async function updateTicketStatus(
    ticketId: string,
    status: string
) {
    await requireAdmin();

    const allowed = [
        "new",
        "in_progress",
        "resolved",
        "closed",
    ];

    if (
        !allowed.includes(
            status
        )
    ) {
        return {
            success: false,
        };
    }

    const admin =
        createAdminClient();

    const { error } =
        await admin
            .from(
                "support_tickets"
            )
            .update({
                status,
                resolved_at:
                    status ===
                        "resolved" ||
                    status ===
                        "closed"
                        ? new Date().toISOString()
                        : null,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", ticketId);

    if (error) {
        console.error(
            "updateTicketStatus:",
            error
        );

        return {
            success: false,
        };
    }

    revalidatePath(
        "/admin"
    );
    revalidatePath(
        "/admin/tickets"
    );

    return {
        success: true,
    };
}

export async function updateTicketPriority(
    ticketId: string,
    priority: string
) {
    await requireAdmin();

    const allowed = [
        "low",
        "normal",
        "high",
        "critical",
    ];

    if (
        !allowed.includes(
            priority
        )
    ) {
        return {
            success: false,
        };
    }

    const admin =
        createAdminClient();

    const { error } =
        await admin
            .from(
                "support_tickets"
            )
            .update({
                priority,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", ticketId);

    if (error) {
        console.error(
            "updateTicketPriority:",
            error
        );

        return {
            success: false,
        };
    }

    revalidatePath(
        "/admin"
    );
    revalidatePath(
        "/admin/tickets"
    );

    return {
        success: true,
    };
}
