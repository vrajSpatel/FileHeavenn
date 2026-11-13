const API_URL = process.env.BACKEND_URL

export async function registerUser(username, email, password) {
    const res = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, email: email, password: password })
    })

    return res.json()
}
