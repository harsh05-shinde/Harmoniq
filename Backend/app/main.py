from app.models.users import User
from app.models.songs import Song
from app.models.artists import Artist
from app.models.albums import Album
from app.models.playlists import Playlist
from app.models.playlist_songs import PlaylistSong
from app.models.playlist_songs import PlaylistSong
from app.models.likedsongs import LikedSong
from app.database import Base , engine
from fastapi import FastAPI
from app.routers.playlists import router as playlist_router
from app.routers.users import router as user_router
from app.routers.songs import router as song_router
from app.routers.artists import router as artist_router
from app.routers.albums import router as album_router
from app.routers.likedsongs import router as likedsong_router
from app.routers.playlistsongs import router as playlistsong_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()


app.mount(
    "/media",
    StaticFiles(directory="media"),
    name="media"
)


Base.metadata.create_all(bind = engine)
app.include_router(user_router)
app.include_router(song_router)
app.include_router(artist_router)
app.include_router(album_router)
app.include_router(playlist_router)
app.include_router(playlistsong_router)
app.include_router(likedsong_router)



app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],
    allow_credentials= True,
    allow_headers = ["*"],
    allow_methods= ["*"]  
)


@app.get("/")
def home():
    return{
        "message":"Running successfully"
    }
