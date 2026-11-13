const API_URL = process.env.BACKEND_URL

export async function getUser() {
    const res = await fetch(API_URL + '/api/auth/me', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
    })

    return res.json()
}
