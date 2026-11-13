'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUser } from './mainNavbarApi'

export default function MainNavbar() {
    const [username, setUsername] = useState('')

    // navbar is on every page, so it also sends logged out users to login page
    useEffect(() => {
        async function loadUser() {
            const data = await getUser()

            if (data.user) {
                setUsername(data.user.username)
                return
            }

            const path = window.location.pathname

            if (path !== '/login' && path !== '/register') {
                window.location.href = '/login'
            }
        }

        loadUser()
    }, [])

    function logout() {
        localStorage.removeItem('accessToken')

        // full reload so the navbar also forgets the user
        window.location.href = '/login'
    }

    return (
        <nav className="main-navbar">
            <Link href="/" className="project-name">FileHeavenn</Link>

            {username ? (
                <div className="user-info">
                    <span>{username}</span>
                    {/* first letter of username as logo */}
                    <div className="user-logo">{username.charAt(0).toUpperCase()}</div>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <Link href="/login" className="login-link">Login</Link>
            )}
        </nav>
    )
}
