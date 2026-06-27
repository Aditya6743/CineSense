import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <Hero />

      <Trending />

      <Features />

      <Footer />
    </main>
  );
}