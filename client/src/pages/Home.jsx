import Navbar from "../components/layout/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Cards from "../components/Cards";
// import NotifyForm from "../components/NotifyForm";
import BusinessCTA from "../components/BusinessCTA";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main>
        {/* Hero */}
        <Hero />

        {/* Floating category/location marquee */}
        <section
          aria-label="KonnectG highlights"
          className="relative z-20 -mt-20"
        >
          <Marquee />
        </section>

        {/* Featured categories */}
        <section aria-labelledby="featured-categories">
          <h2 id="featured-categories" className="sr-only">
            Featured Categories
          </h2>
          <Cards />
        </section>

        {/* Get notified when KonnectG launches
        <section aria-labelledby="notification-signup">
          <h2 id="notification-signup" className="sr-only">
            Get notified about KonnectG
          </h2>
          <NotifyForm />
        </section> */}

        {/* For local businesses */}
        <section aria-labelledby="business-cta">
          <h2 id="business-cta" className="sr-only">
            List your business on KonnectG
          </h2>
          <BusinessCTA />
        </section>
      </main>
      <SEO
        title="KonnectG | Discover Local Businesses & Services"
        description="Discover trusted local businesses, services, offers, and community providers near you with KonnectG."
        path="/"
      />
      <Footer />
    </div>
  );
}
