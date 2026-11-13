'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { shareItem } from './api'

// url is /share/file/<id> or /share/folder/<id>
export default function SharePage() {
    const { type, id } = useParams()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [permission, setPermission] = useState('viewer')
    const [note, setNote] = useState('')
    const [message, setMessage] = useState('')

    async function handleShare(event) {
        event.preventDefault()

        const data = await shareItem(id, type, email, permission, note)
        setMessage(data.message)

        if (data.success) {
            setEmail('')
            setNote('')
        }
    }

    return (
        <div className="form-box">
            <h2>Share {type}</h2>

            <form onSubmit={handleShare}>
                <input
                    type="email"
                    placeholder="Email of the user"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <select value={permission} onChange={(event) => setPermission(event.target.value)}>
                    <option value="viewer">Viewer (can see and download)</option>
                    <option value="editor">Editor (can also rename)</option>
                </select>

                <textarea
                    placeholder="Note for the user"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={500}
                    required
                />

                <button type="submit">Share</button>
            </form>

            {message && <p className="message">{message}</p>}

            <button onClick={() => router.back()}>Back</button>
        </div>
    )
}
