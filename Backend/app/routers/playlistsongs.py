from sqlalchemy.orm import Session
from fastapi import Depends , APIRouter
from app.database import get_db
from app.dependecnies.auth import get_current_user
from app.models.users import User
from app.schemas.playlistsongs import PlaylistSongResponse
from app.services.playlistsongs import create_playlistsong_service , get_playlistsong_service , get_playlistsongs_service , delete_playlistsong_service


router = APIRouter(
    prefix=("/playlistsong"),
    tags=["PlaylistSong"]
)




@router.post("/{playlist_id}/{song_id}" , response_model=PlaylistSongResponse)
def create_playlistsong(song_id:int , playlist_id:int,db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return create_playlistsong_service(song_id=song_id , playlist_id=playlist_id , db=db , current_user=current_user)





@router.get("/" , response_model= list[PlaylistSongResponse])
def get_playlistsongs(db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return get_playlistsongs_service(db=db , current_user=current_user)





@router.get("/{playlistsong_id}" , response_model=PlaylistSongResponse)
def get_playlistsong(playlistsong_id:int , db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return get_playlistsong_service(playlistsong_id=playlistsong_id , db=db , current_user=current_user)



@router.delete("/{playlistsong_id}" , response_model=PlaylistSongResponse)
def delete_playlistsong( playlistsong_id:int,db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return delete_playlistsong_service(db=db , current_user=current_user , playlistsong_id=playlistsong_id)    
    
    
    