'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    getFolders,
    getFiles,
    createFolder,
    uploadFile,
    renameFolder,
    renameFile,
    moveFolder,
    moveFile,
    deleteFolder,
    deleteFile,
    downloadFile,
    viewFile
} from './folderViewApi'

// shows folders and files of one folder, folderId is null for the root (my miles page)
export default function FolderView({ folderId }) {
    const router = useRouter()

    const [folders, setFolders] = useState([])
    const [files, setFiles] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [fileToUpload, setFileToUpload] = useState(null)
    const [message, setMessage] = useState('')

    // empty value means root folder according to server
    const folderQuery = folderId ? folderId : ''

    async function loadItems() {
        const folderData = await getFolders(folderQuery)
        const fileData = await getFiles(folderQuery)

        if (folderData.success) {
            setFolders(folderData.folders)
        } else {
            setMessage(folderData.message)
        }

        if (fileData.success) {
            setFiles(fileData.files)
        }
    }

    // runs again when user opens another folder
    useEffect(() => {
        setMessage('')
        loadItems()
    }, [folderId])

    async function handleCreateFolder(event) {
        event.preventDefault() // helps to not reload the page

        const data = await createFolder(newFolderName, folderId)
        setMessage(data.message)

        if (data.success) {
            setNewFolderName('')
            loadItems()
        }
    }

    async function handleUpload(event) {
        event.preventDefault()

        if (!fileToUpload) {
            setMessage('choose a file first')
            return
        }

        const data = await uploadFile(fileToUpload, folderId)
        setMessage(data.message)

        if (data.success) {
            setFileToUpload(null)
            event.target.reset()
            loadItems()
        }
    }

    async function handleRenameFolder(folder) {
        // prompt will open a small window
        const newName = prompt('New folder name', folder.name)

        if (!newName) {
            return
        }

        const data = await renameFolder(folder._id, newName)
        setMessage(data.message)
        loadItems()
    }

    async function handleRenameFile(file) {
        const newName = prompt('New file name', file.name)

        if (!newName) {
            return
        }

        const data = await renameFile(file._id, newName)
        setMessage(data.message)
        loadItems()
    }

    // target is 'root' or id of a folder from the current list
    async function handleMoveFolder(folder, target) {
        const newParent = target === 'root' ? null : target

        const data = await moveFolder(folder._id, newParent)
        setMessage(data.message)
        loadItems()
    }

    async function handleMoveFile(file, target) {
        const newFolder = target === 'root' ? null : target

        const data = await moveFile(file._id, newFolder)
        setMessage(data.message)
        loadItems()
    }

    // this only moves to trash, items can be restored from the Trash page
    async function handleDeleteFolder(folder) {
        if (!confirm('Move "' + folder.name + '" and everything inside it to trash?')) {
            return
        }

        const data = await deleteFolder(folder._id)
        setMessage(data.message)
        loadItems()
    }

    async function handleDeleteFile(file) {
        if (!confirm('Move "' + file.name + '" to trash?')) {
            return
        }

        const data = await deleteFile(file._id)
        setMessage(data.message)
        loadItems()
    }

    return (
        <div>
            <div className="title-row">
                <h2>{folderId ? 'Folder' : 'My Files'}</h2>
                {folderId && <button onClick={() => router.back()}>Back</button>}
            </div>

            <form onSubmit={handleCreateFolder} className="inline-form">
                <input
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    required
                />
                <button type="submit">Create Folder</button>
            </form>

            <form onSubmit={handleUpload} className="inline-form">
                <input type="file" onChange={(event) => setFileToUpload(event.target.files[0])} />
                <button type="submit">Upload</button>
            </form>

            {message && <p className="message">{message}</p>}

            <h3>Folders</h3>
            {folders.length === 0 && <p className="empty-text">no folders here</p>}

            {folders.map((folder) => (
                <div key={folder._id} className="item-row">
                    <Link href={'/folder/' + folder._id} className="item-name">{folder.name}</Link>

                    <div className="item-actions">
                        <button onClick={() => handleRenameFolder(folder)}>Rename</button>

                        <select defaultValue="" onChange={(event) => handleMoveFolder(folder, event.target.value)}>
                            <option value="" disabled>Move to...</option>
                            <option value="root">My Files (root)</option>
                            {folders
                                .filter((otherFolder) => otherFolder._id !== folder._id)
                                .map((otherFolder) => (
                                    <option key={otherFolder._id} value={otherFolder._id}>{otherFolder.name}</option>
                                ))}
                        </select>

                        <Link href={'/share/folder/' + folder._id}>Share</Link>
                        <button onClick={() => handleDeleteFolder(folder)}>Delete</button>
                    </div>
                </div>
            ))}

            <h3>Files</h3>
            {files.length === 0 && <p className="empty-text">no files here</p>}

            {files.map((file) => (
                <div key={file._id} className="item-row">
                    <span className="item-name">{file.name} ({Math.ceil(file.size / 1024)} KB)</span>

                    <div className="item-actions">
                        <button onClick={() => downloadFile(file._id, file.name)}>Download</button>
                        <button onClick={() => handleRenameFile(file)}>Rename</button>

                        <select defaultValue="" onChange={(event) => handleMoveFile(file, event.target.value)}>
                            <option value="" disabled>Move to...</option>
                            <option value="root">My Files (root)</option>
                            {folders.map((folder) => (
                                <option key={folder._id} value={folder._id}>{folder.name}</option>
                            ))}
                        </select>

                        <Link href={'/share/file/' + file._id}>Share</Link>
                        <button onClick={() => viewFile(file._id)}>View</button>
                        <button onClick={() => handleDeleteFile(file)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    )
}
