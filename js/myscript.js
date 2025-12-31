let currentSong = new Audio();
let songs;
let playLists;
let currFolder = "Combined";
let songsConfig; // Store the config data

async function loadConfig() {
    let data = await fetch("/songs-config.json");
    songsConfig = await data.json();
}

async function getPlayLists() {
    playLists = songsConfig.playlists.map(p => p.folder);
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = ""; // Clear existing content

    for (const playlist of songsConfig.playlists) {
        cardContainer.innerHTML = cardContainer.innerHTML +
            `<div data-folder="${playlist.folder}" class="card">
            <div class="song-container">
            <img src="songs/${playlist.folder}/cover.jpg" alt="song">
            <div class="play">
            <img src="img/play.svg" alt="play button">
            </div>
            </div>
            <h3>${playlist.title}</h3>
            <p>${playlist.description}</p>
            </div>`;
    }

    Array.from(document.querySelectorAll(".card-container .card")).forEach((card) => {
        card.addEventListener("click", async (event) => {
            currFolder = card.dataset.folder;
            await getSongs(currFolder);
        })
    })
}

async function getSongs(folder) {
    // Find the playlist in config
    const playlist = songsConfig.playlists.find(p => p.folder === folder);

    if (!playlist) {
        console.error("Playlist not found:", folder);
        return;
    }

    songs = playlist.songs;

    const songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML +
            `<li>
        <div class="music-card">
        <img class="music invert" src="img/music.svg" alt="music">
        <div class="song-info">
        <div title="${song}">${song}</div>
        <div>${folder}</div>
        </div>
        <div>
        <span>Play now</span>
        </div>
        
        <div class="playbtn-container">
        <img class="play-btn invert" src="img/play.svg" alt="play">
        </div>
        </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".song-list li")).forEach((el) => {
        el.addEventListener("click", (element) => {
            playMusic(el.querySelector(".song-info div").title);
        })
    })
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `songs/${currFolder}/` + track + ".mp3";
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".song-name").innerHTML = track;
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function main() {
    // Load config first!
    await loadConfig();

    await getPlayLists();
    await getSongs(currFolder);
    playMusic(songs[0], true);

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".seekbar-fill").style.width = percent + "%";
    })

    document.querySelector(".seek-bar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].slice(0, -4).replaceAll("%20", " "))
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    })

    forward.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].slice(0, -4).replaceAll("%20", " "))
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    })

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("mouseover", () => {
            card.querySelector(".play").style.bottom = "15px";
            card.querySelector(".play").style.opacity = "1";
            card.querySelector(".play").style.zIndex = "1";
        })
    })

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("mouseout", () => {
            card.querySelector(".play").style.bottom = "0px";
            card.querySelector(".play").style.opacity = "0";
            card.querySelector(".play").style.zIndex = "0";
        })
    })

    const slider = document.querySelector(".volume input");
    const volumeImg = document.querySelector(".volume img");

    slider.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (e.target.value == 0) {
            volumeImg.src = volumeImg.src.replaceAll("volume.svg", "mute.svg");
        }
        else {
            volumeImg.src = volumeImg.src.replaceAll("mute.svg", "volume.svg");
        }
    })

    volumeImg.addEventListener("click", (event) => {
        if (event.target.src.includes("volume.svg")) {
            event.target.src = event.target.src.replaceAll("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume input").value = 0;
        }
        else {
            event.target.src = event.target.src.replaceAll("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".volume input").value = 100;
        }
    })
}

main();