import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedGames } from "@/components/featured-games"
import { FeaturedCompanions } from "@/components/featured-companions"
import { LatestNews } from "@/components/latest-news"
import { UpcomingEvents } from "@/components/upcoming-events"
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <HeroSection />
        <FeaturedGames />
        <FeaturedCompanions />
        <LatestNews />
        <UpcomingEvents />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  )
}
