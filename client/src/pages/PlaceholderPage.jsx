import { Link } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main
        className="
          flex
          flex-1
          flex-col
          items-center
          justify-center
          px-6
          py-24
          text-center
        "
      >
        <h1
          className="
            font-display
            text-3xl
            font-bold
            text-ink
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-3
            max-w-md
            text-ink-soft
          "
        >
          {description}
        </p>

        <Link
          to="/"
          className="
            mt-7
            rounded-full
            bg-purple-700
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-purple-600
            focus:outline-none
            focus:ring-2
            focus:ring-purple-400
            focus:ring-offset-2
          "
        >
          Back to Home
        </Link>
      </main>

      <Footer />
    </div>
  );
}
