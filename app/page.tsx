import { About } from '@/components/sections/About'
import { CTA } from '@/components/sections/CTA'
import { Cases } from '@/components/sections/Cases'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Lineup } from '@/components/sections/Lineup'
import { PhotoSection } from '@/components/sections/PhotoSection'
import { ScrollAssemble } from '@/components/sections/ScrollAssemble'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <About />
      <ScrollAssemble />
      <PhotoSection />
      <Cases />
      <Lineup />
      <CTA />
      <Footer />
    </main>
  )
}
