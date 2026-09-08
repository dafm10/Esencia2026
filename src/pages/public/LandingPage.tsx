
import About from "../../components/sections/About"
import ContactMap from "../../components/sections/ContactMap"
import Hero from "../../components/sections/Hero"
import RegisterForm from "../../components/sections/RegisterForm"
import Schedule from "../../components/sections/Schedule"
import Speakers from "../../components/sections/Speakers"

const LandingPage = () => {
    return (
        <>
            <Hero />
            <About />
            <Speakers />
            <Schedule />
            <ContactMap />
            <RegisterForm />
        </>
    )
}

export default LandingPage