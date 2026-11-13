const API_URL = process.env.BACKEND_URL

export async function getSharedWithMe() {
    const res = await fetch(API_URL + '/api/share/with-me', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

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

// removes it only from my shared list, owner still has the item
export async function removeShare(shareId) {
    const res = await fetch(API_URL + '/api/share/' + shareId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

// download needs the token too, so a normal link will not work
export async function downloadFile(fileId, fileName) {
    const res = await fetch(API_URL + '/api/share/files/' + fileId + '/download', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    if (!res.ok) {
        alert('could not download the file')
        return
    }

    // make a temporary link for the file and click it
    const fileData = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(fileData)
    link.download = fileName
    link.click()
}

// open the file in a new tab, browser can show pdf, images, text, video and audio by itself
export async function viewFile(fileId) {
    // open the tab first, browsers block new tabs that open after waiting for a fetch
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
