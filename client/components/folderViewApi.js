const API_URL = process.env.BACKEND_URL

// get folder
export async function getFolders(folderId) {
    const res = await fetch(API_URL + '/api/folders?parent=' + folderId, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

// get file
export async function getFiles(folderId) {
    const res = await fetch(API_URL + '/api/files?folder=' + folderId, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

// create folder
export async function createFolder(name, parent) {
    const res = await fetch(API_URL + '/api/folders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ name: name, parent: parent })
    })

    return res.json()
}

// upload file
export async function uploadFile(file, folderId) {
    // multer in backend reads 'file', and 'folder' tells where to save it
    const formData = new FormData()
    if (folderId) {
        formData.append('folder', folderId)
    }
    formData.append('file', file)

    // no Content-Type here, browser sets it by itself for FormData
    const res = await fetch(API_URL + '/api/files/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
        body: formData
    })

    return res.json()
}

// rename folder
export async function renameFolder(folderId, name) {
    const res = await fetch(API_URL + '/api/folders/' + folderId, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ name: name })
    })

    return res.json()
}

// rename file
export async function renameFile(fileId, name) {
    const res = await fetch(API_URL + '/api/share/files/' + fileId + '/rename', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ name: name })
    })

    return res.json()
}

// move folder
export async function moveFolder(folderId, newParent) {
    const res = await fetch(API_URL + '/api/folders/' + folderId + '/move', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ newParent: newParent })
    })

    return res.json()
}

// folder null means root
export async function moveFile(fileId, folder) {
    const res = await fetch(API_URL + '/api/files/' + fileId + '/move', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ folder: folder })
    })

    return res.json()
}

// delete folder
export async function deleteFolder(folderId) {
    const res = await fetch(API_URL + '/api/folders/' + folderId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

// delete file
export async function deleteFile(fileId) {
    const res = await fetch(API_URL + '/api/files/' + fileId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

// download file
export async function downloadFile(fileId, fileName) {
    const res = await fetch(API_URL + '/api/share/files/' + fileId + '/download', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    if (!res.ok) {
        alert('could not download the file')
        return
    }

    // blob is like json but it reads files
    const fileData = await res.blob()

    // create a temp a link
    const link = document.createElement('a')

    // add data in to link, make temporary url
    link.href = URL.createObjectURL(fileData)

    // instead of opening the file it will download it
    link.download = fileName
    link.click()
}

// view file
export async function viewFile(fileId) {

    // open new tab 
    const tab = window.open()

    const res = await fetch(API_URL + '/api/share/files/' + fileId + '/download', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    if (!res.ok) {
        tab.close()
        alert('could not open the file')
        return
    }

    const fileData = await res.blob()
    tab.location.href = URL.createObjectURL(fileData)
}
