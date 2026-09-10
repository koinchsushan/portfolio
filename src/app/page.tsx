import { Hero } from '@/components/sections/Hero'
import { Position } from '@/components/sections/Position'
import { Work } from '@/components/sections/Work'
import { Research } from '@/components/sections/Research'
import { Stack } from '@/components/sections/Stack'
import { Trajectory } from '@/components/sections/Trajectory'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <Position />
      <Work />
      <Research />
      <Stack />
      <Trajectory />
      <About />
      <Contact />
    </>
  )
}
