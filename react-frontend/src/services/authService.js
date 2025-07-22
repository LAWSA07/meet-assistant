const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            const data = await response.json();
            this.setAuth(data.access_token, data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('Server error: Unable to parse response');
            }

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            this.setAuth(data.access_token, data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async githubAuth(code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/github`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'GitHub authentication failed');
            }

            const data = await response.json();
            this.setAuth(data.access_token, data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async googleAuth(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Google authentication failed');
            }

            const data = await response.json();
            this.setAuth(data.access_token, data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to get user info');
            }

            const user = await response.json();
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getGitHubAuthUrl() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/github-url`);
            const data = await response.json();
            return data.url;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.clearAuth();
    }
}

const authService = new AuthService();
export default authService; 