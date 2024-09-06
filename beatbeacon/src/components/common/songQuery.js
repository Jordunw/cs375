import * as Query from "./query";
import OAuth from "../home/oauth";

// gets top 3 matches for a song by name (queries spotify api)
// returns undefined if no results found
/* Format:
{
  id: song_id,
  song: "song_name",
  artist: "artist_name"
  img: "song_img_link",
}
 */
export async function searchSpotifySong(token, song) {
    let songArr = [];
    let results = await Query.searchSongByTitle(token, song, 3);

    if(!results || !results.items)
        return undefined;

    results.items.forEach((item) => {
        songArr.push({
            id: item.id,
            song: item.name,
            artist: item.artists[0].name, // just pulling the first artist name for simplicity
            img: item.album.images[0].url,
        });
    });

    return songArr;
}

export async function getBeaconSongs({ beacon_id }) {
  let results = undefined;
  return results;
}