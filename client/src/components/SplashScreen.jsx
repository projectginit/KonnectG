export default function SplashScreen() {
  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        gap-5
        bg-gradient-to-br
        from-purple-900
        via-purple-700
        to-purple-600
        px-6
        text-center
      "
      role="status"
      aria-label="Loading KonnectG"
    >
      {/* Logo */}

      <div
        className="
          flex
          h-20
          w-20
          shrink-0
          animate-floatY
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-3xl
          font-display
          font-extrabold
          text-purple-700
          shadow-2xl
        "
      >
        K
      </div>

      {/* Brand */}

      <h1
        className="
          font-display
          text-3xl
          font-extrabold
          tracking-tight
          text-white
        "
      >
        Konnect
        <span className="text-gold">G</span>
      </h1>

      {/* Description */}

      <p
        className="
          max-w-xs
          font-body
          text-sm
          leading-relaxed
          text-purple-100
        "
      >
        Connecting Siliguri, one neighbourhood at a time.
      </p>

      {/* Loading indicator */}

      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        <span
          className="
            h-2
            w-2
            animate-bounce
            rounded-full
            bg-gold
            [animation-delay:-0.3s]
          "
        />

        <span
          className="
            h-2
            w-2
            animate-bounce
            rounded-full
            bg-gold
            [animation-delay:-0.15s]
          "
        />

        <span
          className="
            h-2
            w-2
            animate-bounce
            rounded-full
            bg-gold
          "
        />
      </div>
    </div>
  );
}
