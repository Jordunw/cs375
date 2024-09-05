import OAuth from "./OAuth";

const AuthService = {
    isLoggedIn: () => OAuth.loggedIn(),
    
    login: () => {
        return new Promise((resolve) => {
            OAuth.openPopupAndAuthenticate();
            const checkLoginStatus = setInterval(() => {
                if (OAuth.loggedIn()) {
                    clearInterval(checkLoginStatus);
                    resolve();
                }
            }, 1000);
        });
    },
    
    logout: () => OAuth.logout()
};

export default AuthService;