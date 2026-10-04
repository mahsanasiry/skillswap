import { Cta } from "@/components/home/cta";
import { FeaturedSkills } from "@/components/home/featured-skills";
import { FeaturedUsers } from "@/components/home/featured-users";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <HowItWorks />
      <FeaturedSkills />
      <FeaturedUsers />
      <Cta />
    </main>
  );
}
