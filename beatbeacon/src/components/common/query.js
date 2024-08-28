const spotifyApiUrl = `https://api.spotify.com/v1`;

const fetchAuth = async (urlLoc, accessToken) => {
    const response = await fetch(spotifyApiUrl + urlLoc, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    return await response.json();
}

export const followedArtistsQuery = async (accessToken) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/me/following?' + new URLSearchParams({type: 'artist'}), accessToken);
}