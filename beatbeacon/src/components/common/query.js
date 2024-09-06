const spotifyApiUrl = `https://api.spotify.com/v1`;

const fetchAuth = async (urlLoc, accessToken) => {
    const response = await fetch(spotifyApiUrl + urlLoc, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    return await response.json();
}

const postAuth = async (urlLoc, accessToken, data) => {
    const response = await fetch(spotifyApiUrl + urlLoc, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
        type: 'POST',
        data: data
    });
    return await response.json();
}

export const followedArtists = async (accessToken) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/me/following?' + new URLSearchParams({type: 'artist'}), accessToken);
}

export const currentListening = async (accessToken) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/me/player/currently-playing', accessToken);
}

export const lastListenedTo = async (accessToken) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/me/player/recently-played' + new URLSearchParams({limit: 1}), accessToken);
}

// not finished, dont use yet
export const createPlaylist = async (accessToken, userId, songIds) => {
    if(!accessToken) return undefined;
    return await postAuth(`/users/${userId}/playlists`, accessToken, songIds);
}

// TODO: Error handling
export const getUserId = async (accessToken) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/me', accessToken).id;
}

// defaults to limit of 1 - if you need to find more options, provide a limit value
export const searchSongByTitle = async (accessToken, title, limit = 1) => {
    if(!accessToken) return undefined;
    const queryParams = new URLSearchParams({
        q: `track:${title}`,
        type: 'track',
        limit: limit
    });

    return await fetchAuth(`/search?${queryParams.toString()}`, accessToken);
}

// defaults to limit of 1 - if you need to find more options, provide a limit value
export const searchSongByTitleAndArtist = async (accessToken, title, artist, limit = 1) => {
    if(!accessToken) return undefined;
    return await fetchAuth('/search', + new URLSearchParams({q: `track:${title}%2520artist:${artist}`, limit: limit}), accessToken);
}