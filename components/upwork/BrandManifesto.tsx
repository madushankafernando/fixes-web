export function BrandManifesto() {
  return (
    <section className="py-12 lg:py-20 px-4 lg:px-6">
      <div
        className="relative max-w-7xl mx-auto rounded-2xl lg:rounded-3xl overflow-hidden"
        style={{ background: "#0f2d0a" }}
      >
        <div
          className="absolute -top-20 -left-20 w-64 h-64 lg:w-80 lg:h-80 rounded-full pointer-events-none"
          style={{ background: "rgba(26, 74, 16, 0.5)" }}
        />
        <div
          className="absolute -bottom-24 -right-16 w-56 h-56 lg:w-72 lg:h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(26, 74, 16, 0.4)" }}
        />

        <div className="relative z-10 px-6 py-16 sm:px-10 md:px-16 lg:px-24 lg:py-24">
          <div className="max-w-xl mx-auto text-center">
            <p
              className="text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase mb-5 lg:mb-6"
              style={{ color: "#97C459" }}
            >
              Our purpose
            </p>

            <h2
              className="text-xl sm:text-2xl md:text-[26px] font-medium leading-snug sm:leading-relaxed mb-8 lg:mb-10"
              style={{ color: "#EAF3DE" }}
            >
              We reimagine the way Australians and Kiwis get things fixed.
            </h2>

            <div
              className="w-10 h-0.5 mx-auto mb-8 lg:mb-10 rounded-full"
              style={{ background: "#639922" }}
            />

            <div
              className="text-sm sm:text-[15px] leading-loose sm:leading-[1.9] space-y-6 sm:space-y-7 mb-8 lg:mb-10"
              style={{ color: "#9FE1CB" }}
            >
              <p>
                Getting things fixed is what we power. It&rsquo;s our lifeblood.
                It runs through every job posted, every tradie matched, every
                handshake at the front door.
              </p>

              <p>
                It&rsquo;s what gets us out of bed each morning. It pushes us to
                constantly reimagine how we can connect people better
                &mdash;{" "}
                <span className="font-medium" style={{ color: "#EAF3DE" }}>
                  for you
                </span>
                . For every leaking tap, every rewire, every renovation. For
                every tradie who deserves steady work. For every homeowner who
                just needs it done right.
              </p>

              <p>
                Across{" "}
                <span className="font-medium" style={{ color: "#EAF3DE" }}>
                  Australia and New Zealand
                </span>
                . In your suburb. At the incredible speed of now.
              </p>
            </div>

            <p
              className="text-sm sm:text-base font-medium"
              style={{ color: "#97C459" }}
            >
              fixesau.com &mdash; work worth doing, done.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
