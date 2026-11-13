'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// all pages of the app, if I add a new page I just add it here
const pages = [
    { name: 'My Files', path: '/' },
    { name: 'Shared With Me', path: '/shared-with-me' },
    { name: 'Shared By Me', path: '/shared-by-me' },
    { name: 'Trash', path: '/trash' }
]

export default function PageNavbar() {
    // current url path, used to show which page is open
    const currentPath = usePathname()

    return (
        <nav className="page-navbar">
            {pages.map((page) => (
                <Link
                    key={page.path}
                    href={page.path}
                    className={currentPath === page.path ? 'page-link active' : 'page-link'}
                >
                    {page.name}
                </Link>
            ))}
        </nav>
    )
}
