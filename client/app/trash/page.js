'use client'

import { useEffect, useState } from 'react'
import { getTrash, restoreFolder, restoreFile, deleteFolderForever, deleteFileForever, emptyTrash } from './api'

export default function TrashPage() {
    const [folders, setFolders] = useState([])
    const [files, setFiles] = useState([])
    const [message, setMessage] = useState('')

    async function loadTrash() {
        const data = await getTrash()

        if (data.success) {
            setFolders(data.folders)
            setFiles(data.files)
        } else {
            setMessage(data.message)
        }
    }

    useEffect(() => {
        loadTrash()
    }, [])

    async function handleRestoreFolder(folder) {
        const data = await restoreFolder(folder._id)
        setMessage(data.message)
        loadTrash()
    }

    async function handleRestoreFile(file) {
        const data = await restoreFile(file._id)
        setMessage(data.message)
        loadTrash()
    }

    async function handleDeleteFolder(folder) {
        if (!confirm('Delete "' + folder.name + '" forever? This can not be undone.')) {
            return
        }

        const data = await deleteFolderForever(folder._id)
        setMessage(data.message)
        loadTrash()
    }

    async function handleDeleteFile(file) {
        if (!confirm('Delete "' + file.name + '" forever? This can not be undone.')) {
            return
        }

        const data = await deleteFileForever(file._id)
        setMessage(data.message)
        loadTrash()
    }

    async function handleEmptyTrash() {
        if (!confirm('Delete everything in trash forever?')) {
            return
        }

        const data = await emptyTrash()
        setMessage(data.message)
        loadTrash()
    }

    const isEmpty = folders.length === 0 && files.length === 0

    return (
        <div>
            <div className="title-row">
                <h2>Trash</h2>
                {!isEmpty && <button onClick={handleEmptyTrash}>Empty Trash</button>}
            </div>

            {message && <p className="message">{message}</p>}
            {isEmpty && <p className="empty-text">trash is empty</p>}

            {folders.map((folder) => (
                <div key={folder._id} className="item-row">
                    <span className="item-name">{folder.name} (Folder)</span>

                    <div className="item-actions">
                        <button onClick={() => handleRestoreFolder(folder)}>Restore</button>
                        <button onClick={() => handleDeleteFolder(folder)}>Delete Forever</button>
                    </div>
                </div>
            ))}

            {files.map((file) => (
                <div key={file._id} className="item-row">
                    <span className="item-name">{file.name} (File)</span>

                    <div className="item-actions">
                        <button onClick={() => handleRestoreFile(file)}>Restore</button>
                        <button onClick={() => handleDeleteFile(file)}>Delete Forever</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
