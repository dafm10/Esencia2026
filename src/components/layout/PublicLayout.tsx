import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import FloatingBanner from "../ui/FloatingBanner"

const PublicLayout = () => {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <FloatingBanner />
        </>
    )
}

export default PublicLayout