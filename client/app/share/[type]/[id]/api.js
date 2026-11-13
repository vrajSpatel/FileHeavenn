const API_URL = process.env.BACKEND_URL

// itemType is 'file' or 'folder', permission is 'viewer' or 'editor'
export async function shareItem(itemId, itemType, email, permission, note) {
    const res = await fetch(API_URL + '/api/share', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('accessToken')
        },
        body: JSON.stringify({
            itemId: itemId,
            itemType: itemType,
            email: email,
            permission: permission,
            note: note
        })
    })

    return res.json()
}
