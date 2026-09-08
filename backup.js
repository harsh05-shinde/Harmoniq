// ======================================================
// CONFIGURATION & GLOBAL VARIABLES
// ======================================================

const API_URL = "http://127.0.0.1:8000";

let allSongs = [];

let allPlaylists = [];

// ======================================================
// PLAYLIST SONGS REQUEST CONTROL
// ======================================================

// Prevent an older GET /playlistsong/ response from
// overwriting a newer playlist state.

let activePlaylistId = null;

let activePlaylistName = null;

let playlistSongsLoadVersion = 0;

// Prevent multiple remove requests at the same time.

let playlistRemoveInProgress = false;

// ======================================================
// LIKED SONGS GLOBAL VARIABLES
// ======================================================

let likedSongs = [];

let likedSongMap = new Map();

let currentSong = null;

// ======================================================
// LIKED SONGS REQUEST CONTROL
// ======================================================

// Prevent an older GET /likedsong/ response from
// overwriting a newer response.

let likedSongsLoadVersion = 0;

// Prevent multiple like/unlike requests at the same time.

let likeActionInProgress = false;

// ======================================================
// SEARCH GLOBAL VARIABLES
// ======================================================

let searchTimeout = null;

// Prevent an older search response from
// overwriting a newer search response.

let searchRequestVersion = 0;

// ======================================================
// DOM REFERENCES
// ======================================================

const audioPlayer = document.getElementById("audio-player");

const playPauseBtn = document.getElementById("play-pause-btn");

const playPauseIcon = document.getElementById("play-pause-icon");

const progressBar = document.getElementById("progress-bar");

const currentTimeEl = document.getElementById("current-time");

const totalTimeEl = document.getElementById("total-time");

const volumeControl = document.getElementById("volume-control");

const muteButton = document.getElementById("mute-button");

const muteIcon = document.getElementById("mute-icon");

// ======================================================
// LIKED SONG HEART BUTTON
// ======================================================

const likeSongBtn =
    document.getElementById("like-song-btn");

// ======================================================
// HELPER: GET AUTH HEADERS
// ======================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    return {

        "Content-Type": "application/json",

        ...(token
            ? {
                "Authorization": `Bearer ${token}`
            }
            : {})

    };
}

// ======================================================
// HELPER: BUILD MEDIA URL
// ======================================================

function buildMediaURL(path, fallback = "") {

    if (!path) {

        return fallback;

    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;

    }

    return `${API_URL}/${path.replace(/^\/+/, "")}`;

}

// ======================================================
// TIME FORMATTER
// ======================================================

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {

        return "0:00";

    }

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;

}

// ======================================================
// AUDIO EVENT LISTENERS & CONTROLS
// ======================================================

function initPlayerControls() {

    if (!audioPlayer) return;

    // Play / Pause

    if (playPauseBtn) {

        playPauseBtn.addEventListener("click", () => {

            if (!audioPlayer.src) return;

            if (audioPlayer.paused) {

                audioPlayer.play();

            } else {

                audioPlayer.pause();

            }

        });

    }

    // Playing

    audioPlayer.addEventListener("play", () => {

        if (playPauseIcon) {

            playPauseIcon.classList.remove("fa-play");

            playPauseIcon.classList.add("fa-pause");

        }

    });

    // Paused

    audioPlayer.addEventListener("pause", () => {

        if (playPauseIcon) {

            playPauseIcon.classList.remove("fa-pause");

            playPauseIcon.classList.add("fa-play");

        }

    });

    // Metadata loaded

    audioPlayer.addEventListener("loadedmetadata", () => {

        if (totalTimeEl) {

            totalTimeEl.textContent =
                formatTime(audioPlayer.duration);

        }

        if (progressBar) {

            progressBar.max =
                Math.floor(audioPlayer.duration) || 100;

        }

    });

    // Progress

    audioPlayer.addEventListener("timeupdate", () => {

        if (
            progressBar &&
            !isNaN(audioPlayer.currentTime)
        ) {

            progressBar.value =
                Math.floor(audioPlayer.currentTime);

        }

        if (currentTimeEl) {

            currentTimeEl.textContent =
                formatTime(audioPlayer.currentTime);

        }

    });

    // Seek

    if (progressBar) {

        progressBar.addEventListener("input", () => {

            audioPlayer.currentTime =
                progressBar.value;

        });

    }

    // Volume

    if (volumeControl) {

        volumeControl.addEventListener("input", (e) => {

            audioPlayer.volume =
                Number(e.target.value);

            if (muteIcon) {

                muteIcon.className =
                    audioPlayer.volume === 0
                        ? "fa-solid fa-volume-xmark"
                        : "fa-solid fa-volume-high";

            }

        });

    }

    // Mute

    if (muteButton) {

        muteButton.addEventListener("click", () => {

            audioPlayer.muted =
                !audioPlayer.muted;

            if (muteIcon) {

                muteIcon.className =
                    audioPlayer.muted
                        ? "fa-solid fa-volume-xmark"
                        : "fa-solid fa-volume-high";

            }

        });

    }

    // Song ended

    audioPlayer.addEventListener("ended", () => {

        if (playPauseIcon) {

            playPauseIcon.classList.remove("fa-pause");

            playPauseIcon.classList.add("fa-play");

        }

        if (progressBar) {

            progressBar.value = 0;

        }

        if (currentTimeEl) {

            currentTimeEl.textContent = "0:00";

        }

    });

}

// ======================================================
// PLAY SONG
// ======================================================

function playSong(song) {

    if (!audioPlayer) return;

    // ==================================================
    // STORE CURRENT SONG
    // ==================================================

    currentSong = song;

    updateLikeButton();

    let audioSrc =
        song.audio_url || song.url;

    if (!audioSrc) {

        console.error(
            "No audio URL found for song:",
            song
        );

        return;

    }

    audioSrc =
        buildMediaURL(audioSrc);

    console.log(
        "Playing:",
        audioSrc
    );

    audioPlayer.src = audioSrc;

    audioPlayer.load();

    audioPlayer.play()
        .then(() => {

            updatePlayerInfo(song);

        })
        .catch(err => {

            console.error(
                "Playback failed:",
                err
            );

        });

}

// ======================================================
// UPDATE PLAYER INFORMATION
// ======================================================

function updatePlayerInfo(song) {

    const titleElement =
        document.querySelector(".heading-a");

    const artistElement =
        document.querySelector(".desc-a");

    const albumImage =
        document.querySelector(".alb-img");

    if (titleElement) {

        titleElement.textContent =
            song.title || "Unknown Song";

    }

    if (artistElement) {

        artistElement.textContent =
            `Artist ID: ${
                song.artist_id ||
                song.artist ||
                "Unknown"
            }`;

    }

    const coverURL =
        song.cover_image_url ||
        song.cover_url ||
        "";

    if (albumImage && coverURL) {

        albumImage.src =
            buildMediaURL(coverURL);

    }

}

// ======================================================
// UPDATE LIKE BUTTON
// ======================================================

function updateLikeButton() {

    if (!likeSongBtn || !currentSong) {

        return;

    }

    const isLiked =
        likedSongMap.has(
            String(currentSong.id)
        );

    if (isLiked) {

        likeSongBtn.classList.remove(
            "fa-regular"
        );

        likeSongBtn.classList.add(
            "fa-solid"
        );

    } else {

        likeSongBtn.classList.remove(
            "fa-solid"
        );

        likeSongBtn.classList.add(
            "fa-regular"
        );

    }

}

// ======================================================
// DISPLAY SONGS
// ======================================================

function displaySongs(songs) {

    const container =
        document.getElementById(
            "songs-container"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!songs || songs.length === 0) {

        container.innerHTML =
            "<p style='color: #a7a7a7;'>No songs found.</p>";

        return;

    }

    songs.forEach((song) => {

        const coverURL =
            buildMediaURL(
                song.cover_image_url ||
                song.cover_url,
                "card1img.jpeg"
            );

        // Playlist dropdown

        let playlistOptions =
            `<option value="">+ Add to Playlist</option>`;

        if (
            allPlaylists &&
            allPlaylists.length > 0
        ) {

            playlistOptions +=
                allPlaylists
                    .map(
                        p =>
                            `<option value="${p.id}">
                                ${p.name}
                            </option>`
                    )
                    .join("");

        }

        const card =
            document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `

            <img
                src="${coverURL}"
                class="card-img"
                alt="${song.title || "Song"}"
            >

            <p class="card-title">
                ${song.title || "Untitled Song"}
            </p>

            <p class="card-info">
                Artist ID:
                ${song.artist_id || song.artist || "Unknown"}
            </p>

            <div
                class="card-actions"
                onclick="event.stopPropagation()"
            >

                <select class="playlist-select">

                    ${playlistOptions}

                </select>

            </div>

        `;

        // Click card = play

        card.addEventListener("click", () => {

            playSong(song);

        });

        // Add to playlist

        const selectEl =
            card.querySelector(
                ".playlist-select"
            );

        if (selectEl) {

            selectEl.addEventListener(
                "change",
                (e) => {

                    const playlistId =
                        e.target.value;

                    if (playlistId) {

                        addSongToPlaylist(
                            playlistId,
                            song.id
                        );

                        e.target.value = "";

                    }

                }
            );

        }

        container.appendChild(card);

    });

}

// ======================================================
// FETCH SONGS
// ======================================================

async function loadSongs() {

    try {

        const response =
            await fetch(
                `${API_URL}/song/`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.href =
                "login.html";

            return;

        }

        if (!response.ok) {

            throw new Error(
                `Fetch failed: ${response.status}`
            );

        }

        allSongs =
            await response.json();

        console.log(
            "SONGS FROM BACKEND:",
            allSongs
        );

        displaySongs(allSongs);

    } catch (error) {

        console.error(
            "Error loading songs:",
            error
        );

    }

}

// ======================================================
// SEARCH SONGS
// ======================================================

async function searchSongs(searchText) {

    const searchValue =
        searchText.trim();

    // ==================================================
    // CREATE REQUEST VERSION
    // ==================================================

    const currentSearchVersion =
        ++searchRequestVersion;

    // ==================================================
    // IF SEARCH IS EMPTY
    // HIDE SEARCH DROPDOWN
    // ==================================================

    if (!searchValue) {

        hideSearchDropdown();

        return;

    }

    try {

        console.log(
            "SEARCHING FOR:",
            searchValue
        );

        // ==================================================
        // FASTAPI:
        //
        // GET /song/search?search_text=value
        // ==================================================

        const searchURL =
            `${API_URL}/song/search?search_text=${encodeURIComponent(searchValue)}`;

        console.log(
            "SEARCH URL:",
            searchURL
        );

        const response =
            await fetch(
                searchURL,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.href =
                "login.html";

            return;

        }

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "SEARCH API ERROR:",
                errorText
            );

            throw new Error(
                `Search failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "SEARCH RESULTS FROM BACKEND:",
            data
        );

        // ==================================================
        // IGNORE OLD SEARCH RESPONSE
        // ==================================================

        if (
            currentSearchVersion !==
            searchRequestVersion
        ) {

            console.log(
                "Ignoring outdated search response."
            );

            return;

        }

        // ==================================================
        // HANDLE DIFFERENT RESPONSE FORMATS
        // ==================================================

        let searchResults = [];

        if (Array.isArray(data)) {

            // Backend:
            // [song1, song2, song3]

            searchResults = data;

        } else if (
            data &&
            Array.isArray(data.songs)
        ) {

            // Backend:
            // { songs: [...] }

            searchResults =
                data.songs;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            // Backend:
            // { data: [...] }

            searchResults =
                data.data;

        } else if (
            data &&
            Array.isArray(data.results)
        ) {

            // Backend:
            // { results: [...] }

            searchResults =
                data.results;

        } else if (
            data &&
            data.song
        ) {

            // Backend:
            // { song: {...} }

            searchResults = [
                data.song
            ];

        }

        console.log(
            "FINAL SEARCH RESULTS:",
            searchResults
        );

        // ==================================================
        // IMPORTANT:
        //
        // DO NOT CALL displaySongs() HERE.
        //
        // displaySongs() replaces the Trending Songs.
        //
        // Instead, show results in the search dropdown.
        // ==================================================

        displaySearchDropdown(searchResults);

    } catch (error) {

        console.error(
            "Error searching songs:",
            error
        );

        // Do NOT modify songs-container.
        // Trending Songs must remain visible.

        displaySearchDropdown([]);

    }

}

// ======================================================
// SEARCH DROPDOWN
// ======================================================

function createSearchDropdown() {

    let dropdown =
        document.getElementById(
            "search-results-dropdown"
        );

    if (dropdown) {

        return dropdown;

    }

    const searchInput =
        document.getElementById(
            "search-input"
        );

    if (!searchInput) {

        return null;

    }

    // ==================================================
    // CREATE DROPDOWN
    // ==================================================

    dropdown =
        document.createElement("div");

    dropdown.id =
        "search-results-dropdown";

    dropdown.style.position =
        "absolute";

    dropdown.style.top =
        "100%";

    dropdown.style.left =
        "0";

    dropdown.style.right =
        "0";

    dropdown.style.background =
        "#181818";

    dropdown.style.border =
        "1px solid #333";

    dropdown.style.borderRadius =
        "8px";

    dropdown.style.padding =
        "6px 0";

    dropdown.style.marginTop =
        "6px";

    dropdown.style.zIndex =
        "9999";

    dropdown.style.maxHeight =
        "350px";

    dropdown.style.overflowY =
        "auto";

    dropdown.style.display =
        "none";

    dropdown.style.boxShadow =
        "0 8px 20px rgba(0, 0, 0, 0.5)";

    // ==================================================
    // MAKE SURE DROPDOWN IS POSITIONED
    // RELATIVE TO SEARCH BAR
    // ==================================================

    const searchParent =
        searchInput.parentElement;

    if (searchParent) {

        const parentPosition =
            window.getComputedStyle(
                searchParent
            ).position;

        if (
            parentPosition === "static"
        ) {

            searchParent.style.position =
                "relative";

        }

        searchParent.appendChild(
            dropdown
        );

    } else {

        searchInput.insertAdjacentElement(
            "afterend",
            dropdown
        );

    }

    return dropdown;

}

// ======================================================
// DISPLAY SEARCH RESULTS IN DROPDOWN
// ======================================================

function displaySearchDropdown(
    searchResults
) {

    const dropdown =
        createSearchDropdown();

    if (!dropdown) {

        console.warn(
            "Could not create search dropdown."
        );

        return;

    }

    dropdown.innerHTML = "";

    // ==================================================
    // NO RESULTS
    // ==================================================

    if (
        !searchResults ||
        searchResults.length === 0
    ) {

        dropdown.innerHTML = `

            <div
                style="
                    padding: 12px 15px;
                    color: #a7a7a7;
                    font-size: 14px;
                "
            >
                No songs found.
            </div>

        `;

        dropdown.style.display =
            "block";

        return;

    }

    // ==================================================
    // DISPLAY SEARCH RESULTS
    // ==================================================

    searchResults.forEach((song) => {

        if (!song) return;

        const resultItem =
            document.createElement("div");

        resultItem.classList.add(
            "search-result-item"
        );

        resultItem.style.display =
            "flex";

        resultItem.style.alignItems =
            "center";

        resultItem.style.gap =
            "12px";

        resultItem.style.padding =
            "8px 12px";

        resultItem.style.cursor =
            "pointer";

        resultItem.style.transition =
            "background 0.2s";

        const coverURL =
            buildMediaURL(
                song.cover_image_url ||
                song.cover_url,
                "card1img.jpeg"
            );

        const artistName =
            song.artist ||
            song.artist_name ||
            (
                song.artist_id
                    ? `Artist ID: ${song.artist_id}`
                    : "Unknown Artist"
            );

        resultItem.innerHTML = `

            <img
                src="${coverURL}"
                alt="${song.title || "Song"}"
                style="
                    width: 45px;
                    height: 45px;
                    border-radius: 4px;
                    object-fit: cover;
                    flex-shrink: 0;
                "
            >

            <div
                style="
                    min-width: 0;
                    flex: 1;
                "
            >

                <div
                    style="
                        color: white;
                        font-size: 14px;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    "
                >
                    ${song.title || "Untitled Song"}
                </div>

                <div
                    style="
                        color: #a7a7a7;
                        font-size: 12px;
                        margin-top: 3px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    "
                >
                    ${artistName}
                </div>

            </div>

            <i
                class="fa-solid fa-play"
                style="
                    color: #ffffff;
                    font-size: 13px;
                    flex-shrink: 0;
                "
            ></i>

        `;

        // ==================================================
        // HOVER EFFECT
        // ==================================================

        resultItem.addEventListener(
            "mouseenter",
            () => {

                resultItem.style.background =
                    "#282828";

            }
        );

        resultItem.addEventListener(
            "mouseleave",
            () => {

                resultItem.style.background =
                    "transparent";

            }
        );

        // ==================================================
        // CLICK SEARCH RESULT = PLAY SONG
        // ==================================================

        resultItem.addEventListener(
            "click",
            () => {

                console.log(
                    "SEARCH RESULT SELECTED:",
                    song
                );

                playSong(song);

                // Hide dropdown after selecting song.

                hideSearchDropdown();

            }
        );

        dropdown.appendChild(
            resultItem
        );

    });

    dropdown.style.display =
        "block";

}

// ======================================================
// HIDE SEARCH DROPDOWN
// ======================================================

function hideSearchDropdown() {

    const dropdown =
        document.getElementById(
            "search-results-dropdown"
        );

    if (dropdown) {

        dropdown.style.display =
            "none";

        dropdown.innerHTML = "";

    }

}

// ======================================================
// SEARCH BAR UI
// ======================================================

function initSearch() {

    const searchInput =
        document.getElementById(
            "search-input"
        );

    if (!searchInput) {

        console.warn(
            "Search input was not found in HTML."
        );

        return;

    }

    console.log(
        "Search input found:",
        searchInput
    );

    // ==================================================
    // CREATE SEARCH DROPDOWN
    // ==================================================

    createSearchDropdown();

    // ==================================================
    // SEARCH WHEN USER TYPES
    // ==================================================

    searchInput.addEventListener(
        "input",
        () => {

            const searchValue =
                searchInput.value.trim();

            // Clear previous timer.

            clearTimeout(
                searchTimeout
            );

            // ==================================================
            // EMPTY SEARCH
            // ==================================================

            if (!searchValue) {

                // Invalidate previous requests.

                searchRequestVersion++;

                // Hide dropdown.

                hideSearchDropdown();

                // IMPORTANT:
                //
                // We DO NOT call displaySongs(allSongs).
                //
                // Trending Songs were never changed.

                return;

            }

            // ==================================================
            // WAIT 400ms BEFORE SENDING REQUEST
            // ==================================================

            searchTimeout =
                setTimeout(() => {

                    searchSongs(
                        searchValue
                    );

                }, 400);

        }
    );

    // ==================================================
    // SEARCH WHEN USER PRESSES ENTER
    // ==================================================

    searchInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                clearTimeout(
                    searchTimeout
                );

                searchSongs(
                    searchInput.value
                );

            }

            // ==================================================
            // ESCAPE = HIDE SEARCH DROPDOWN
            // ==================================================

            if (event.key === "Escape") {

                hideSearchDropdown();

            }

        }
    );

    // ==================================================
    // HIDE DROPDOWN WHEN CLICKING OUTSIDE
    // ==================================================

    document.addEventListener(
        "click",
        (event) => {

            if (
                !searchInput.contains(event.target) &&
                !document
                    .getElementById(
                        "search-results-dropdown"
                    )
                    ?.contains(event.target)
            ) {

                hideSearchDropdown();

            }

        }
    );

}

// ======================================================
// FETCH PLAYLISTS
// ======================================================

async function loadPlaylists() {

    try {

        const response =
            await fetch(
                `${API_URL}/playlist/`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "PLAYLISTS FROM BACKEND:",
            data
        );

        // Make sure allPlaylists is always an array

        if (Array.isArray(data)) {

            allPlaylists = data;

        } else if (
            data &&
            Array.isArray(data.playlists)
        ) {

            allPlaylists =
                data.playlists;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            allPlaylists =
                data.data;

        } else {

            allPlaylists = [];

        }

        displayPlaylists(
            allPlaylists
        );

    } catch (error) {

        console.error(
            "Error loading playlists:",
            error
        );

    }

}

// ======================================================
// DISPLAY PLAYLISTS
// ======================================================

function displayPlaylists(playlists) {

    const container =
        document.getElementById(
            "playlists-container"
        );

    if (!container) return;

    container.innerHTML = "";

    if (
        !playlists ||
        playlists.length === 0
    ) {

        container.innerHTML =
            "<p style='color: #a7a7a7; font-size: 14px;'>No playlists created yet.</p>";

        return;

    }

    playlists.forEach((playlist) => {

        const div =
            document.createElement("div");

        div.classList.add(
            "playlist-item"
        );

        div.style.cursor = "pointer";

        div.innerHTML = `

            <span class="playlist-name">
                ${playlist.name}
            </span>

            <button
                class="delete-playlist-btn"
                title="Delete Playlist"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        `;

        // Open playlist

        div.addEventListener(
            "click",
            () => {

                loadPlaylistSongs(
                    playlist.id,
                    playlist.name
                );

            }
        );

        // Delete playlist

        const deleteBtn =
            div.querySelector(
                ".delete-playlist-btn"
            );

        if (deleteBtn) {

            deleteBtn.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    deletePlaylist(
                        playlist.id
                    );

                }
            );

        }

        container.appendChild(div);

    });

}

// ======================================================
// LOAD SONGS FROM PLAYLIST
// ======================================================

async function loadPlaylistSongs(
    playlistId,
    playlistName
) {

    // ==================================================
    // PLAYLIST REQUEST CONTROL
    // ==================================================

    const currentLoadVersion =
        ++playlistSongsLoadVersion;

    activePlaylistId = playlistId;

    activePlaylistName = playlistName;

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "LOADING PLAYLIST:",
            playlistId,
            playlistName
        );

        // ==================================================
        // IMPORTANT:
        //
        // DO NOT GET /playlist/{playlistId}
        //
        // That endpoint returns only ResponsePlaylist.
        //
        // We must use:
        //
        // GET /playlistsong/
        // ==================================================

        const response =
            await fetch(
                `${API_URL}/playlistsong/`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                `Playlist songs fetch failed: ${response.status}`
            );

        }

        const rawData =
            await response.json();

        // ==================================================
        // IGNORE OLD RESPONSE
        // ==================================================

        if (
            currentLoadVersion !==
            playlistSongsLoadVersion
        ) {

            console.log(
                "Ignoring outdated playlist songs response."
            );

            return;

        }

        console.log(
            "ALL PLAYLIST-SONG RECORDS FROM BACKEND:",
            rawData
        );

        // ==================================================
        // GET UI ELEMENTS
        // ==================================================

        const section =
            document.getElementById(
                "playlist-songs-section"
            );

        const titleEl =
            document.getElementById(
                "selected-playlist-name"
            );

        const container =
            document.getElementById(
                "playlist-songs-container"
            );

        if (!section || !container) {

            return;

        }

        section.style.display = "block";

        if (titleEl) {

            titleEl.textContent =
                playlistName;

        }

        container.innerHTML = "";

        // ==================================================
        // FILTER SONGS FOR CURRENT PLAYLIST
        // ==================================================

        let playlistSongsList = [];

        if (Array.isArray(rawData)) {

            playlistSongsList =
                rawData.filter(
                    item =>
                        String(item.playlist_id) ===
                        String(playlistId)
                );

        } else if (
            rawData &&
            Array.isArray(
                rawData.playlist_songs
            )
        ) {

            playlistSongsList =
                rawData.playlist_songs.filter(
                    item =>
                        String(item.playlist_id) ===
                        String(playlistId)
                );

        } else if (
            rawData &&
            Array.isArray(rawData.data)
        ) {

            playlistSongsList =
                rawData.data.filter(
                    item =>
                        String(item.playlist_id) ===
                        String(playlistId)
                );

        }

        console.log(
            "PLAYLIST SONGS FOR CURRENT PLAYLIST:",
            playlistSongsList
        );

        // ==================================================
        // NO SONGS
        // ==================================================

        if (
            playlistSongsList.length === 0
        ) {

            container.innerHTML =
                "<p style='color: #a7a7a7;'>This playlist has no songs yet.</p>";

            section.scrollIntoView({
                behavior: "smooth"
            });

            return;

        }

        // ==================================================
        // FIND ACTUAL SONGS
        // ==================================================

        const songsToDisplay = [];

        playlistSongsList.forEach(
            (playlistSong) => {

                if (!playlistSong) {

                    return;

                }

                // playlistSong.id
                // = PlaylistSong ID

                const playlistSongId =
                    playlistSong.id;

                // playlistSong.song_id
                // = Actual Song ID

                const songId =
                    playlistSong.song_id;

                console.log(
                    "PlaylistSong:",
                    playlistSong
                );

                console.log(
                    "PlaylistSong ID:",
                    playlistSongId
                );

                console.log(
                    "Actual Song ID:",
                    songId
                );

                // Find actual song inside allSongs

                const actualSong =
                    allSongs.find(
                        song =>
                            String(song.id) ===
                            String(songId)
                    );

                if (!actualSong) {

                    console.warn(
                        "Could not find song in allSongs:",
                        songId
                    );

                    return;

                }

                songsToDisplay.push({

                    song: actualSong,

                    playlistSongId:
                        playlistSongId

                });

            }
        );

        console.log(
            "FINAL SONGS TO DISPLAY:",
            songsToDisplay
        );

        // ==================================================
        // COULD NOT MATCH SONGS
        // ==================================================

        if (
            songsToDisplay.length === 0
        ) {

            container.innerHTML =
                "<p style='color: #a7a7a7;'>Playlist contains song records, but the song details could not be matched.</p>";

            console.error(
                "PlaylistSong records exist, but matching songs were not found.",
                {
                    playlistSongsList,
                    allSongs
                }
            );

            section.scrollIntoView({
                behavior: "smooth"
            });

            return;

        }

        // ==================================================
        // RENDER PLAYLIST SONGS
        // ==================================================

        songsToDisplay.forEach(
            ({ song, playlistSongId }) => {

                const coverURL =
                    buildMediaURL(
                        song.cover_image_url ||
                        song.cover_url,
                        "card1img.jpeg"
                    );

                const card =
                    document.createElement("div");

                card.classList.add(
                    "card"
                );

                // Store PlaylistSong ID directly on the card.

                card.dataset.playlistSongId =
                    String(playlistSongId);

                card.innerHTML = `

                    <img
                        src="${coverURL}"
                        class="card-img"
                        alt="${song.title || "Song"}"
                    >

                    <p class="card-title">
                        ${song.title || "Untitled Song"}
                    </p>

                    <p class="card-info">
                        Artist ID:
                        ${song.artist_id || song.artist || "Unknown"}
                    </p>

                    <div
                        class="card-actions"
                        onclick="event.stopPropagation()"
                    >

                        <button
                            class="remove-song-btn"
                            style="
                                background: none;
                                border: none;
                                color: #ff5555;
                                cursor: pointer;
                                padding: 4px;
                                font-size: 12px;
                            "
                        >

                            <i class="fa-solid fa-minus"></i>
                            Remove

                        </button>

                    </div>

                `;

                // Play song

                card.addEventListener(
                    "click",
                    () => {

                        if (
                            song.audio_url ||
                            song.url
                        ) {

                            playSong(song);

                        }

                    }
                );

                // Remove song

                const removeBtn =
                    card.querySelector(
                        ".remove-song-btn"
                    );

                if (removeBtn) {

                    removeBtn.addEventListener(
                        "click",
                        (e) => {

                            e.stopPropagation();

                            removeSongFromPlaylist(
                                playlistSongId,
                                playlistId,
                                playlistName
                            );

                        }
                    );

                }

                container.appendChild(card);

            }
        );

        section.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Error loading playlist songs:",
            error
        );

    }

}

// ======================================================
// CREATE PLAYLIST
// ======================================================

async function createPlaylist(name) {

    if (!name.trim()) return;

    try {

        const response =
            await fetch(
                `${API_URL}/playlist/`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),

                    body: JSON.stringify({
                        name: name.trim()
                    })

                }
            );

        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(() => ({}));

            throw new Error(
                errorData.detail ||
                `Failed to create playlist: ${response.status}`
            );

        }

        const newPlaylist =
            await response.json();

        console.log(
            "Playlist created:",
            newPlaylist
        );

        await loadPlaylists();

        displaySongs(allSongs);

    } catch (error) {

        console.error(
            "Error creating playlist:",
            error
        );

        alert(
            error.message ||
            "Could not create playlist."
        );

    }

}

// ======================================================
// ADD SONG TO PLAYLIST
// ======================================================

async function addSongToPlaylist(
    playlistId,
    songId
) {

    try {

        console.log(
            `Adding song ${songId} to playlist ${playlistId}`
        );

        const response =
            await fetch(
                `${API_URL}/playlistsong/${playlistId}/${songId}`,
                {
                    method: "POST",
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {

            const errData =
                await response
                    .json()
                    .catch(() => ({}));

            throw new Error(
                errData.detail ||
                `Failed to add song: ${response.status}`
            );

        }

        const data =
            await response
                .json()
                .catch(() => null);

        console.log(
            "SONG ADDED TO PLAYLIST:",
            data
        );

        alert(
            "Song added to playlist successfully!"
        );

        // If this playlist is currently open,
        // reload it.

        const activePlaylist =
            allPlaylists.find(
                p =>
                    String(p.id) ===
                    String(playlistId)
            );

        if (activePlaylist) {

            await loadPlaylistSongs(
                playlistId,
                activePlaylist.name
            );

        }

    } catch (error) {

        console.error(
            "Error adding song to playlist:",
            error
        );

        alert(
            error.message ||
            "Could not add song to playlist."
        );

    }

}

// ======================================================
// REMOVE SONG FROM PLAYLIST
// ======================================================

async function removeSongFromPlaylist(
    playlistSongId,
    playlistId,
    playlistName
) {

    if (
        playlistSongId === undefined ||
        playlistSongId === null
    ) {

        console.error(
            "Invalid playlist-song ID."
        );

        return;

    }

    // Prevent multiple remove requests at the same time.

    if (playlistRemoveInProgress) {

        console.log(
            "Playlist remove action already in progress."
        );

        return;

    }

    playlistRemoveInProgress = true;

    try {

        console.log(
            "Removing playlist-song:",
            playlistSongId
        );

        const response =
            await fetch(
                `${API_URL}/playlistsong/${playlistSongId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Failed to remove song: ${response.status}`
            );

        }

        console.log(
            "SONG REMOVED FROM PLAYLIST:",
            data
        );

        // ==================================================
        // IMMEDIATELY REMOVE THE CORRECT CARD
        // ==================================================

        const playlistContainer =
            document.getElementById(
                "playlist-songs-container"
            );

        if (playlistContainer) {

            const card =
                playlistContainer.querySelector(
                    `[data-playlist-song-id="${playlistSongId}"]`
                );

            if (card) {

                card.remove();

            }

            if (
                playlistContainer.querySelectorAll(
                    ".card"
                ).length === 0
            ) {

                playlistContainer.innerHTML =
                    "<p style='color: #a7a7a7;'>This playlist has no songs yet.</p>";

            }

        }

        // ==================================================
        // INVALIDATE OLD PLAYLIST REQUEST
        // ==================================================

        playlistSongsLoadVersion++;

        // ==================================================
        // SYNC FRONTEND WITH BACKEND
        // ==================================================

        await loadPlaylistSongs(
            playlistId,
            playlistName
        );

    } catch (error) {

        console.error(
            "Error removing song from playlist:",
            error
        );

        alert(
            error.message ||
            "Could not remove song from playlist."
        );

    } finally {

        playlistRemoveInProgress = false;

    }

}

// ======================================================
// DELETE PLAYLIST
// ======================================================

async function deletePlaylist(
    playlistId
) {

    if (
        !confirm(
            "Are you sure you want to delete this playlist?"
        )
    ) {

        return;

    }

    try {

        const response =
            await fetch(
                `${API_URL}/playlist/${playlistId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

        if (
            response.status === 204 ||
            response.ok
        ) {

            const section =
                document.getElementById(
                    "playlist-songs-section"
                );

            if (section) {

                section.style.display =
                    "none";

            }

            await loadPlaylists();

            displaySongs(allSongs);

        } else {

            const errData =
                await response
                    .json()
                    .catch(() => ({}));

            alert(
                errData.detail ||
                "Failed to delete playlist."
            );

        }

    } catch (error) {

        console.error(
            "Error deleting playlist:",
            error
        );

    }

}

// ======================================================
// PLAYLIST MODAL UI
// ======================================================

function initPlaylistUI() {

    const createBtn =
        document.getElementById(
            "create-playlist-btn"
        );

    const createBtn2 =
        document.getElementById(
            "create-playlist-btn-2"
        );

    const modal =
        document.getElementById(
            "playlist-modal"
        );

    const saveBtn =
        document.getElementById(
            "save-playlist-btn"
        );

    const closeBtn =
        document.getElementById(
            "close-modal-btn"
        );

    const input =
        document.getElementById(
            "playlist-name-input"
        );

    const openModal = () => {

        if (modal) {

            modal.style.display =
                "flex";

        }

    };

    if (createBtn) {

        createBtn.addEventListener(
            "click",
            openModal
        );

    }

    if (createBtn2) {

        createBtn2.addEventListener(
            "click",
            openModal
        );

    }

    if (closeBtn && modal) {

        closeBtn.addEventListener(
            "click",
            () => {

                modal.style.display =
                    "none";

            }
        );

    }

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            async () => {

                if (
                    input &&
                    input.value.trim()
                ) {

                    await createPlaylist(
                        input.value
                    );

                    input.value = "";

                    if (modal) {

                        modal.style.display =
                            "none";

                    }

                }

            }
        );

    }

}

// ======================================================
// FETCH LIKED SONGS
// ======================================================

async function loadLikedSongs() {

    // Create a unique version number for this request.

    const currentLoadVersion =
        ++likedSongsLoadVersion;

    try {

        const response =
            await fetch(
                `${API_URL}/likedsong/`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.href =
                "login.html";

            return;

        }

        if (!response.ok) {

            throw new Error(
                `Liked songs fetch failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        // ==================================================
        // IGNORE OLD RESPONSE
        // ==================================================

        if (
            currentLoadVersion !==
            likedSongsLoadVersion
        ) {

            console.log(
                "Ignoring outdated liked songs response."
            );

            return;

        }

        // Make sure likedSongs is always an array.

        if (Array.isArray(data)) {

            likedSongs = data;

        } else if (
            data &&
            Array.isArray(data.liked_songs)
        ) {

            likedSongs =
                data.liked_songs;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            likedSongs =
                data.data;

        } else {

            likedSongs = [];

        }

        console.log(
            "LIKED SONGS FROM BACKEND:",
            likedSongs
        );

        // Rebuild map completely.

        likedSongMap.clear();

        likedSongs.forEach(
            likedSong => {

                if (
                    likedSong &&
                    likedSong.song_id !== undefined &&
                    likedSong.id !== undefined
                ) {

                    likedSongMap.set(
                        String(likedSong.song_id),
                        likedSong.id
                    );

                }

            }
        );

        displayLikedSongs(
            likedSongs
        );

        // Update heart for current song

        updateLikeButton();

    } catch (error) {

        console.error(
            "Error loading liked songs:",
            error
        );

    }

}

// ======================================================
// DISPLAY LIKED SONGS
// ======================================================

function displayLikedSongs(
    likedSongRecords
) {

    const container =
        document.getElementById(
            "liked-songs-container"
        );

    if (!container) {

        console.error(
            "liked-songs-container was not found in HTML."
        );

        return;

    }

    container.innerHTML = "";

    if (
        !likedSongRecords ||
        likedSongRecords.length === 0
    ) {

        container.innerHTML =
            "<p style='color: #a7a7a7;'>You haven't liked any songs yet.</p>";

        return;

    }

    likedSongRecords.forEach(
        (likedSong) => {

            if (!likedSong) return;

            // Get actual Song using song_id

            const song =
                allSongs.find(
                    item =>
                        String(item.id) ===
                        String(likedSong.song_id)
                );

            // If song no longer exists

            if (!song) {

                console.warn(
                    "Could not find liked song in allSongs:",
                    likedSong.song_id
                );

                return;

            }

            const coverURL =
                buildMediaURL(
                    song.cover_image_url ||
                    song.cover_url,
                    "card1img.jpeg"
                );

            const card =
                document.createElement("div");

            card.classList.add("card");

            // Store the liked-song ID on the card.

            card.dataset.likedSongId =
                String(likedSong.id);

            card.dataset.songId =
                String(likedSong.song_id);

            card.innerHTML = `

                <img
                    src="${coverURL}"
                    class="card-img"
                    alt="${song.title || "Song"}"
                >

                <p class="card-title">
                    ${song.title || "Untitled Song"}
                </p>

                <p class="card-info">
                    Artist ID:
                    ${song.artist_id || song.artist || "Unknown"}
                </p>

                <div
                    class="card-actions"
                    onclick="event.stopPropagation()"
                >

                    <button
                        class="unlike-song-btn"
                        style="
                            background: none;
                            border: none;
                            color: #ff5555;
                            cursor: pointer;
                            padding: 4px;
                            font-size: 12px;
                        "
                    >

                        <i class="fa-solid fa-heart-crack"></i>
                        Unlike

                    </button>

                </div>

            `;

            // Click card = play song

            card.addEventListener(
                "click",
                () => {

                    playSong(song);

                }
            );

            // Unlike button

            const unlikeBtn =
                card.querySelector(
                    ".unlike-song-btn"
                );

            if (unlikeBtn) {

                unlikeBtn.addEventListener(
                    "click",
                    async (e) => {

                        e.stopPropagation();

                        if (likeActionInProgress) {

                            return;

                        }

                        await unlikeSong(
                            likedSong.id,
                            likedSong.song_id
                        );

                    }
                );

            }

            container.appendChild(card);

        }
    );

}

// ======================================================
// LIKE SONG
// ======================================================

async function likeSong(song) {

    if (!song || !song.id) {

        console.error(
            "Invalid song:",
            song
        );

        return;

    }

    // Prevent multiple like/unlike requests.

    if (likeActionInProgress) {

        console.log(
            "Like/unlike action already in progress."
        );

        return;

    }

    likeActionInProgress = true;

    try {

        const response =
            await fetch(
                `${API_URL}/likedsong/`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),

                    body: JSON.stringify({
                        song_id: song.id
                    })

                }
            );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Failed to like song: ${response.status}`
            );

        }

        console.log(
            "SONG LIKED:",
            data
        );

        // ==================================================
        // UPDATE FRONTEND STATE IMMEDIATELY
        // ==================================================

        if (
            data &&
            data.id !== undefined &&
            data.song_id !== undefined
        ) {

            likedSongs =
                likedSongs.filter(
                    item =>
                        String(item.song_id) !==
                        String(data.song_id)
                );

            likedSongs.push(data);

            likedSongMap.set(
                String(data.song_id),
                data.id
            );

        }

        // Immediately update the UI.

        displayLikedSongs(
            likedSongs
        );

        updateLikeButton();

        // ==================================================
        // SYNC WITH BACKEND
        // ==================================================

        await loadLikedSongs();

    } catch (error) {

        console.error(
            "Error liking song:",
            error
        );

        alert(
            error.message ||
            "Could not like song."
        );

    } finally {

        likeActionInProgress = false;

    }

}

// ======================================================
// UNLIKE SONG
// ======================================================

async function unlikeSong(
    likedSongId,
    songId = null
) {

    if (!likedSongId) {

        console.error(
            "Invalid liked song ID"
        );

        return;

    }

    // Prevent multiple like/unlike requests.

    if (likeActionInProgress) {

        console.log(
            "Like/unlike action already in progress."
        );

        return;

    }

    likeActionInProgress = true;

    try {

        console.log(
            "UNLIKING:",
            {
                likedSongId,
                songId
            }
        );

        const response =
            await fetch(
                `${API_URL}/likedsong/${likedSongId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Failed to unlike song: ${response.status}`
            );

        }

        console.log(
            "SONG UNLIKED:",
            data
        );

        // ==================================================
        // UPDATE FRONTEND STATE IMMEDIATELY
        // ==================================================

        likedSongs =
            likedSongs.filter(
                likedSong =>
                    String(likedSong.id) !==
                    String(likedSongId)
            );

        // Remove the song from the map.

        if (songId !== null) {

            likedSongMap.delete(
                String(songId)
            );

        } else if (
            currentSong &&
            String(
                likedSongMap.get(
                    String(currentSong.id)
                )
            ) ===
            String(likedSongId)
        ) {

            likedSongMap.delete(
                String(currentSong.id)
            );

        } else {

            // Fallback

            const removedLikedSong =
                likedSongs.find(
                    likedSong =>
                        String(likedSong.id) ===
                        String(likedSongId)
                );

            if (removedLikedSong) {

                likedSongMap.delete(
                    String(
                        removedLikedSong.song_id
                    )
                );

            }

        }

        // Immediately remove the card from the UI.

        const likedContainer =
            document.getElementById(
                "liked-songs-container"
            );

        if (likedContainer) {

            const card =
                likedContainer.querySelector(
                    `[data-liked-song-id="${likedSongId}"]`
                );

            if (card) {

                card.remove();

            }

            if (
                likedSongs.length === 0
            ) {

                likedContainer.innerHTML =
                    "<p style='color: #a7a7a7;'>You haven't liked any songs yet.</p>";

            }

        }

        // Update heart immediately.

        updateLikeButton();

        // ==================================================
        // SYNC WITH BACKEND
        // ==================================================

        await loadLikedSongs();

    } catch (error) {

        console.error(
            "Error unliking song:",
            error
        );

        alert(
            error.message ||
            "Could not unlike song."
        );

    } finally {

        likeActionInProgress = false;

    }

}

// ======================================================
// LIKE BUTTON UI
// ======================================================

function initLikeButton() {

    if (!likeSongBtn) return;

    likeSongBtn.addEventListener(
        "click",
        async () => {

            if (!currentSong) {

                return;

            }

            // Prevent rapid repeated clicks.

            if (likeActionInProgress) {

                return;

            }

            const likedSongId =
                likedSongMap.get(
                    String(currentSong.id)
                );

            if (likedSongId) {

                // Already liked -> Unlike

                await unlikeSong(
                    likedSongId,
                    currentSong.id
                );

            } else {

                // Not liked -> Like

                await likeSong(
                    currentSong
                );

            }

        }
    );

}

// ======================================================
// INITIALIZE APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initPlayerControls();

        initPlaylistUI();

        initLikeButton();

        // Initialize search

        initSearch();

        // Load playlists first so the
        // dropdowns contain playlist names.

        await loadPlaylists();

        // Then load songs.

        await loadSongs();

        // Finally load liked songs.

        await loadLikedSongs();

    }
);