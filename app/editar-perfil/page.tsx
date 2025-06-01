import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EditProfileForm } from "@/components/edit-profile-form"

export default function EditarPerfilPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Editar Perfil</h1>
        <EditProfileForm />
      </main>
      <Footer />
    </div>
  )
}
