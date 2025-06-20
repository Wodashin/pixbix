import Link from "next/link"
import { Gamepad2, Facebook, Twitter, Youtube, Instagram, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-cyan-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                PixBae
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plataforma líder en compañía gaming. Conecta con jugadores expertos, mejora tus habilidades y haz
              nuevos amigos mientras juegas.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400">
                <Youtube className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Navegación</h3>
            <div className="space-y-2">
              <Link href="/compañeros" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Compañeros
              </Link>
              <Link href="/noticias" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Noticias
              </Link>
              <Link href="/eventos" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Eventos
              </Link>
              <Link href="/marketplace" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Marketplace
              </Link>
              <Link href="/comunidad" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Comunidad
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Soporte</h3>
            <div className="space-y-2">
              <Link href="/ayuda" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Centro de Ayuda
              </Link>
              <a href="mailto:ilyon3d@gmail.com" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Contacto: proyectanegocioscop@gmail.com
              </a>
              <Link href="/terminos" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Términos de Servicio
              </Link>
              <Link href="/privacidad" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/seguridad" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                Política de Seguridad
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Newsletter</h3>
            <p className="text-slate-400 text-sm">Recibe las últimas noticias y ofertas exclusivas</p>
            <div className="space-y-2">
              <Input type="email" placeholder="tu@email.com" className="bg-slate-800 border-slate-700 text-slate-100" />
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Mail className="mr-2 h-4 w-4" />
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© 2024 PixBae. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/sitemap" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Mapa del Sitio
            </Link>
            <Link href="/accesibilidad" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Accesibilidad
            </Link>
            <Link href="/desarrolladores" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">
              Desarrolladores
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
