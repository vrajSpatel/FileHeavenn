'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getSharedFolder, renameFile, downloadFile, viewFile } from './api'

// opens a folder that someone shared with me, works for its sub folders too
export default function SharedFolderPage() {
    const { id } = useParams()
    const router = useRouter()

    const [folderName, setFolderName] = useState('')
    const [role, setRole] = useState('')
    const [subFolders, setSubFolders] = useState([])
    const [files, setFiles] = useState([])
    const [message, setMessage] = useState('')

    async function loadFolder() {
        const data = await getSharedFolder(id)

        if (!data.success) {
            setMessage(data.message)
            return
        }

        setFolderName(data.folder.name)
        setRole(data.role)
        setSubFolders(data.subFolders)
        setFiles(data.files)
    }

    // runs again when user opens a sub folder
    useEffect(() => {
        setMessage('')
        loadFolder()
    }, [id])

    async function handleRenameFile(file) {
        const newName = prompt('New file name', file.name)

        if (!newName) {
            return
        }

        const data = await renameFile(file._id, newName)
        setMessage(data.message)
        loadFolder()
    }

    // viewer can only download, editor and owner can rename too
    const canRename = role === 'editor' || role === 'owner'

    return (
        <div>
            <div className="title-row">
                <h2>{folderName}</h2>
                <button onClick={() => router.back()}>Back</button>
            </div>

            {role && <p className="small-text">your permission: {role}</p>}
            {message && <p className="message">{message}</p>}

            <h3>Folders</h3>
            {subFolders.length === 0 && <p className="empty-text">no folders here</p>}

            {subFolders.map((folder) => (
                <div key={folder._id} className="item-row">
                    <Link href={'/shared-folder/' + folder._id} className="item-name">{folder.name}</Link>
                </div>
            ))}

            <h3>Files</h3>
            {files.length === 0 && <p className="empty-text">no files here</p>}

            {files.map((file) => (
                <div key={file._id} className="item-row">
                    <span className="item-name">{file.name} ({Math.ceil(file.size / 1024)} KB)</span>

                    <div className="item-actions">
                        <button onClick={() => viewFile(file._id)}>View</button>
                        <button onClick={() => downloadFile(file._id, file.name)}>Download</button>
                        {canRename && <button onClick={() => handleRenameFile(file)}>Rename</button>}
                    </div>
                </div>
            ))}
        </div>
    )
}
