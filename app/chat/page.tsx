import { GlobalChat } from "@/components/global-chat"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Chat Global Gaming</h1>
          <p className="text-slate-400">Conecta con gamers de todo el mundo en tiempo real</p>
        </div>

        <GlobalChat />
      </div>
    </div>
  )
}
