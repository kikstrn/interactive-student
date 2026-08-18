import { requireTeacherAccess } from "@/lib/auth/require-teacher-access";

export default async function TeacherAreaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireTeacherAccess();

    return children;
}
