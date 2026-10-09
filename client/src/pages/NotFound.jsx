import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main
      className="
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        gap-4
        bg-paper
        px-6
        text-center
      "
    >
      <span
        className="
          font-display
          text-6xl
          font-extrabold
          text-purple-700
        "
      >
        404
      </span>

      <h1
        className="
          max-w-md
          font-display
          text-xl
          font-semibold
          text-ink
        "
      >
        This street doesn&apos;t exist on our map yet.
      </h1>

      <p className="max-w-md text-sm text-ink-soft">
        The page you&apos;re looking for may have been moved, removed, or
        doesn&apos;t exist yet.
      </p>

      <Link
        to="/"
        className="
          mt-2
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
  );
}
