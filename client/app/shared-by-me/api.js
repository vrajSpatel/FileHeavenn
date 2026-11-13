const API_URL = process.env.BACKEND_URL

export async function getSharedByMe() {
    const res = await fetch(API_URL + '/api/share/by-me', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}

export async function changePermission(shareId, permission) {
    const res = await fetch(API_URL + '/api/share/' + shareId, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({ permission: permission })
    })

    return res.json()
}

export async function stopSharing(shareId) {
    const res = await fetch(API_URL + '/api/share/' + shareId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}
