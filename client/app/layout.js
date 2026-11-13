import './globals.css'
import MainNavbar from '../components/MainNavbar'
import PageNavbar from '../components/PageNavbar'

export const metadata = {
    title: 'FileHeavenn',
    description: 'store and share your files'
}

// this layout wraps every page, so both navbars show on all pages
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <MainNavbar />
                <PageNavbar />
                <main className="page-content">{children}</main>
            </body>
        </html>
    )
}
