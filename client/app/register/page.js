'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerUser } from './api'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    async function handleRegister(event) {
        event.preventDefault()

        const data = await registerUser(username, email, password)

        if (!data.accessToken) {
            setMessage(data.message)
            return
        }

        // backend sends token on register too, so user is logged in directly
        localStorage.setItem('accessToken', data.accessToken)

        window.location.href = '/'
    }

    return (
        <div className="form-box">
            <h2>Register</h2>

            <form onSubmit={handleRegister}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                />
                <button type="submit">Register</button>
            </form>

            {message && <p className="message">{message}</p>}

            <p>Already have an account? <Link href="/login">Login here</Link></p>
        </div>
    )
}
