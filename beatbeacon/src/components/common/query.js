const spotifyApiUrl = `https://api.spotify.com/v1`;

const postAuth = async (urlLoc, accessToken) => {
    const response = await fetch(spotifyApiUrl + urlLoc, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    return await response.json();
}

export const followedArtistsQuery = async (accessToken) => {
    if(!accessToken) return undefined;
    return await postAuth('/me/following?' + new URLSearchParams({type: 'artist'}), accessToken);
}