const spotifyApiUrl = `https://api.spotify.com/v1`;

const postAuth = async (urlLoc, accessToken, queryParams) => {
    const response = await fetch(spotifyApiUrl + urlLoc, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': accessToken,
        },
        body: queryParams
    });
    return await response.json();
}

export const followedArtistsQuery = async (accessToken) => {
    if(!accessToken) return undefined;
    return await postAuth('/me/following', accessToken, new URLSearchParams({
        type: 'artist'
        })
    );
}