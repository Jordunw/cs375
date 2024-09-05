// oauth.js
//const redirectUrl = "https://beatbeacon.fly.dev/login";
const redirectUrl = "http://localhost:3000/login"; // replace above with this for local testing
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope =
  "user-read-private \
  user-read-email \
  playlist-read-private \
  playlist-modify-public \
  user-follow-read \
  user-read-playback-state \
  user-modify-playback-state \
  user-read-recently-played \
  user-read-playback-position";

// This is just for testing
const env = {
  client_id: "0f40a9293ac342be84ccc2c592f98e94",
  client_secret: "3a6b15b8dd57485eba8950c9ae22e0a3",
};

const currentToken = {
  get access_token() {
    return localStorage.getItem("access_token") || null;
  },
  get refresh_token() {
    return localStorage.getItem("refresh_token") || null;
  },
  get expires_in() {
    return localStorage.getItem("expires_in") || null;
  },
  get expires() {
    return localStorage.getItem("expires") || null;
  },

  save: (response) => {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + expires_in * 1000);
    localStorage.setItem("expires", expiry);
  },
};

class OAuth {
  static async openPopupAndAuthenticate() {
    const code_verifier = OAuth.generateCodeVerifier();
    const code_challenge = await OAuth.generateCodeChallenge(code_verifier);

    window.localStorage.setItem("code_verifier", code_verifier);

    const authUrl = new URL(authorizationEndpoint);
    const params = {
      response_type: "code",
      client_id: env.client_id,
      scope: scope,
      code_challenge_method: "S256",
      code_challenge: code_challenge,
      redirect_uri: redirectUrl,
    };

    authUrl.search = new URLSearchParams(params).toString();

    const width = 500, height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const popup = window.open(
      authUrl.toString(),
      "Spotify Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      return new Promise((resolve, reject) => {
        const pollTimer = window.setInterval(async () => {
          try {
            if (popup.closed) {
              window.clearInterval(pollTimer);
              if (OAuth.loggedIn()) {
                resolve({ status: "success", message: "User logged in successfully" });
              } else {
                reject(new Error("Login popup closed without completing authentication"));
              }
            } else if (popup.location.href.startsWith(redirectUrl)) {
              window.clearInterval(pollTimer);
              const url = new URL(popup.location.href);
              const code = url.searchParams.get("code");
              const error = url.searchParams.get("error");

              if (code) {
                try {
                  const token = await OAuth.getToken(code);
                  currentToken.save(token);
                  popup.close();
                  resolve({ status: "success", message: "Authentication successful" });
                } catch (tokenError) {
                  reject(new Error(`Failed to get token: ${tokenError.message}`));
                }
              } else if (error) {
                reject(new Error(`Authorization error: ${error}`));
              } else {
                reject(new Error("No authorization code or error found in the redirect URI"));
              }
            }
          } catch (e) {
            // Ignore DOMException: Blocked a frame with origin "null" from accessing a cross-origin frame.
          }
        }, 100);
      });
    } else {
      throw new Error("Failed to open login popup");
    }
  }

  static generateCodeVerifier() {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    return randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  static async generateCodeChallenge(code_verifier) {
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  static async getToken(code) {
    const code_verifier = localStorage.getItem("code_verifier");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.client_id,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUrl,
        code_verifier: code_verifier,
      }),
    });

    return await response.json();
  }

  static getCurrentToken() {
    return currentToken;
  }

  static loggedIn() {
    return currentToken.access_token != null;
  }

  static logout() {
    localStorage.clear();
  }
}

export default OAuth;
export { currentToken };
