// oauth.js
const redirectUrl = 'http://localhost:3000';

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-private user-read-email';

// This is just for testing
const env = {
    client_id: 'YOUR_SPOTIFY_CLIENT_ID',
    client_secret: 'YOUR_SPOTIFY_CLIENT_SECRET'
};

const currentToken = {
    get access_token() { return localStorage.getItem('access_token') || null; },
    get refresh_token() { return localStorage.getItem('refresh_token') || null; },
    get expires_in() { return localStorage.getItem('expires_in') || null; },
    get expires() { return localStorage.getItem('expires') || null; },

    save: (response) => {
        const { access_token, refresh_token, expires_in } = response;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('expires_in', expires_in);

        const now = new Date();
        const expiry = new Date(now.getTime() + (expires_in * 1000));
        localStorage.setItem('expires', expiry);
    }
};

class OAuth {
    async openPopupAndAuthenticate() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomValues = crypto.getRandomValues(new Uint8Array(64));
        const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

        const code_verifier = randomString;
        const data = new TextEncoder().encode(code_verifier);
        const hashed = await crypto.subtle.digest('SHA-256', data);

        const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

        window.localStorage.setItem('code_verifier', code_verifier);

        const authUrl = new URL(authorizationEndpoint);
        const params = {
            response_type: 'code',
            client_id: env.client_id,
            scope: scope,
            code_challenge_method: 'S256',
            code_challenge: code_challenge_base64,
            redirect_uri: redirectUrl
        };

        authUrl.search = new URLSearchParams(params).toString();

        const width = 500, height = 600;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);

        const popup = window.open(authUrl.toString(), "Spotify Login", `width=${width},height=${height},top=${top},left=${left}`);

        const pollTimer = window.setInterval(() => {
            if (popup.closed) {
                window.clearInterval(pollTimer);
                this.handlePopupClose();
            }
        }, 1000);
    }

    async handlePopupClose() {
        const oauth_search_args = new URLSearchParams(window.location.search);
        const oauth_code = oauth_search_args.get('code');

        if (oauth_code) {
            const token = await this.getToken(oauth_code);
            currentToken.save(token);
            // TODO: Handle UI update after successful login
        }
    }

    async getToken(code) {
        const code_verifier = localStorage.getItem('code_verifier');

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: env.client_id,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUrl,
                code_verifier: code_verifier
            })
        });

        return await response.json();
    }
}

export default OAuth;
export { currentToken };
