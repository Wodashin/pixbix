import type { Metadata } from "next"
import { AdminUsersPage } from "@/components/admin-users-page"

export const metadata: Metadata = {
  title: "Administración de Usuarios | Nobux Gaming",
  description: "Panel de administración para gestionar roles de usuarios",
}

export default function AdminUsersPageRoute() {
  return <AdminUsersPage />
}
