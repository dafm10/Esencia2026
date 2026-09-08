const Hero = () => {
    return (
        <section id="inicio" className="relative w-full bg-brand-50 pt-8 lg:pt-28">
            {/* <div className="pointer-events-none absolute top-24 left-0 h-0 w-full bg-linear-to-b from-brand-50 to-transparent lg:h-16"></div> */}
            <picture className="block w-full">
                <source media="(min-width: 1024px)" srcSet="/images/banner-hero-desktop.webp" />
                <source media="(min-width: 640px)" srcSet="/images/banner-hero-tablet.webp" />
                <img src="/images/banner-hero-mobile.webp" alt="banner esencia 2026" className="w-full h-auto object-contain block" />
            </picture>
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-linear-to-t from-brand-50 to-transparent lg:h-16"></div>
        </section>
    )
}

export default Hero