'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loginUser } from './api'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    async function handleLogin(event) {
        event.preventDefault()

        const data = await loginUser(email, password)

        // backend sends token only when login is right
        if (!data.accessToken) {
            setMessage(data.message)
            return
        }

        localStorage.setItem('accessToken', data.accessToken)

        // full reload so the navbar shows the new user
        window.location.href = '/'
    }

    return (
        <div className="form-box">
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>

            {message && <p className="message">{message}</p>}

            <p>No account? <Link href="/register">Register here</Link></p>
        </div>
    )
}
