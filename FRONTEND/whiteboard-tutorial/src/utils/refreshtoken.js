export const refreshTokenMethod = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3030';
    const res = await fetch(`${apiBase}/users/refreshToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, refreshToken })
        // credentials: 'include' // enable when using httpOnly cookie for refresh token
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 401) {
        // Refresh invalid -> clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return 401;
        }
        throw new Error(data.error || 'Token refresh failed');
    }

    console.log('Refreshed tokens received:', data);
    // Store new tokens
    await localStorage.setItem('token', data.token);
    if (data.refreshToken) await localStorage.setItem('refreshToken', data.refreshToken);
}