const API_URL = process.env.BACKEND_URL

export async function getTrash() {
    const res = await fetch(API_URL + '/api/delete', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function restoreFolder(folderId) {
    const res = await fetch(API_URL + '/api/delete/folders/' + folderId + '/restore', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function restoreFile(fileId) {
    const res = await fetch(API_URL + '/api/delete/files/' + fileId + '/restore', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function deleteFolderForever(folderId) {
    const res = await fetch(API_URL + '/api/delete/folders/' + folderId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function deleteFileForever(fileId) {
    const res = await fetch(API_URL + '/api/delete/files/' + fileId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function emptyTrash() {
    const res = await fetch(API_URL + '/api/delete', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}
