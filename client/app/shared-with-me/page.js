'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSharedWithMe, renameFile, removeShare, downloadFile, viewFile } from './api'

export default function SharedWithMePage() {
    const [shares, setShares] = useState([])
    const [message, setMessage] = useState('')

    async function loadShares() {
        const data = await getSharedWithMe()

        if (data.success) {
            setShares(data.shares)
        } else {
            setMessage(data.message)
        }
    }

    useEffect(() => {
        loadShares()
    }, [])

    async function handleRenameFile(file) {
        const newName = prompt('New file name', file.name)

        if (!newName) {
            return
        }

        const data = await renameFile(file._id, newName)
        setMessage(data.message)
        loadShares()
    }

    async function handleRemoveShare(share) {
        if (!confirm('Remove "' + share.item.name + '" from your shared list?')) {
            return
        }

        const data = await removeShare(share._id)
        setMessage(data.message)
        loadShares()
    }

    return (
        <div>
            <h2>Shared With Me</h2>

            {message && <p className="message">{message}</p>}
            {shares.length === 0 && <p className="empty-text">nothing is shared with you yet</p>}

            {shares.map((share) => (
                <div key={share._id} className="item-row">
                    <div>
                        <p className="item-name">{share.item.name} ({share.itemModel})</p>
                        <p className="small-text">
                            from {share.owner.username}, you are {share.permission}, note: {share.note}
                        </p>
                    </div>

                    <div className="item-actions">
                        {share.itemModel === 'Folder' && (
                            <Link href={'/shared-folder/' + share.item._id}>Open</Link>
                        )}

                        {share.itemModel === 'File' && (
                            <button onClick={() => viewFile(share.item._id)}>View</button>
                        )}

                        {share.itemModel === 'File' && (
                            <button onClick={() => downloadFile(share.item._id, share.item.name)}>Download</button>
                        )}

                        {share.itemModel === 'File' && share.permission === 'editor' && (
                            <button onClick={() => handleRenameFile(share.item)}>Rename</button>
                        )}

                        <button onClick={() => handleRemoveShare(share)}>Remove</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
