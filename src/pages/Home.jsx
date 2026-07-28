import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import DashboardPreview from "../components/sections/DashboardPreview";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <DashboardPreview />
    </>
  );
}