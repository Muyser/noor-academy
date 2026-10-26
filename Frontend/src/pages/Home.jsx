import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Languages from '@/components/home/Languages';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import Instructors from '@/components/home/Instructors';
import Experience from '@/components/home/Experience';
import FAQ from '@/components/home/FAQ';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Languages />
      <FeaturedCourses />
      <Instructors />
      <Experience />
      <FAQ />
      <FinalCTA />
    </>
  );
}