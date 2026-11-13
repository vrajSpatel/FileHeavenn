const API_URL = process.env.BACKEND_URL

export async function loginUser(email, password) {
    const res = await fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })

    return res.json()
}
