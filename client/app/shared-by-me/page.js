'use client'

import { useEffect, useState } from 'react'
import { getSharedByMe, changePermission, stopSharing } from './api'

export default function SharedByMePage() {
    const [shares, setShares] = useState([])
    const [message, setMessage] = useState('')

    async function loadShares() {
        const data = await getSharedByMe()

        if (data.success) {
            setShares(data.shares)
        } else {
            setMessage(data.message)
        }
    }

    useEffect(() => {
        loadShares()
    }, [])

    async function handleChangePermission(share, newPermission) {
        const data = await changePermission(share._id, newPermission)
        setMessage(data.message)
        loadShares()
    }

    async function handleStopSharing(share) {
        if (!confirm('Stop sharing "' + share.item.name + '" with ' + share.sharedWith.username + '?')) {
            return
        }

        const data = await stopSharing(share._id)
        setMessage(data.message)
        loadShares()
    }

    return (
        <div>
            <h2>Shared By Me</h2>

            {message && <p className="message">{message}</p>}
            {shares.length === 0 && <p className="empty-text">you have not shared anything yet</p>}

            {shares.map((share) => (
                <div key={share._id} className="item-row">
                    <div>
                        <p className="item-name">{share.item.name} ({share.itemModel})</p>
                        <p className="small-text">
                            shared with {share.sharedWith.username} ({share.sharedWith.email}), note: {share.note}
                        </p>
                    </div>

                    <div className="item-actions">
                        <select
                            value={share.permission}
                            onChange={(event) => handleChangePermission(share, event.target.value)}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>

                        <button onClick={() => handleStopSharing(share)}>Stop Sharing</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
