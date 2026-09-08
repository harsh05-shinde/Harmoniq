from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.playlist_songs import PlaylistSong
from app.models.playlists import Playlist
from app.models.songs import Song



def create_playlistsong_service(db:Session , song_id:int , playlist_id:int , current_user:User):
    db_playlist  = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()

    if not db_playlist:
        raise HTTPException(
            status_code=404,
            detail="playlist not found"
        )
        
    
    db_song = db.query(Song).filter(Song.id == song_id).first()
    
    if not db_song:
        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )
    
    
    db_playlistsong = db.query(PlaylistSong).filter(PlaylistSong.song_id == song_id ,
                                                    PlaylistSong.playlist_id == playlist_id).first()
    
    if db_playlistsong:
        raise HTTPException(
            status_code=409,
            detail="Song  already exist in playlist "
        )
    
    new_playlistsong = PlaylistSong(
        playlist_id = playlist_id,
        song_id = song_id
    )
    
    db.add(new_playlistsong)
    db.commit()
    db.refresh(new_playlistsong)
    
    return  new_playlistsong






def get_playlistsong_service(db:Session , playlistsong_id:int , current_user:User):
    db_playlistsong = db.query(PlaylistSong).join(Playlist).filter(Playlist.user_id == current_user.id,
                                                               PlaylistSong.id == playlistsong_id).first()
    
    if not db_playlistsong:
        raise HTTPException(
            status_code=404,
            detail="PlaylistSong not found"
        )
    return db_playlistsong
    
    
    




def get_playlistsongs_service(db:Session , current_user):
    db_playlist = db.query(PlaylistSong).join(Playlist).filter(Playlist.user_id == current_user.id).all()
    
    if not db_playlist:
        raise HTTPException(
            status_code=404,
            detail="Songs did not found"
        )
        
    return db_playlist





def delete_playlistsong_service(db:Session , playlistsong_id:int , current_user:User):
    db_playlistsong = db.query(PlaylistSong).join(Playlist).filter(PlaylistSong.id == playlistsong_id,
                                                                   Playlist.user_id == current_user.id).first()
    
    if not  db_playlistsong:
        raise HTTPException(
            status_code=404,
            detail="Song does not exist in the playlist"
        )
    
    db.delete(db_playlistsong)
    db.commit()
    
    
    return db_playlistsong
    