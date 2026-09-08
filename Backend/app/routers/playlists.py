from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import   APIRouter , Depends , HTTPException
from app.schemas.playlists import ResponsePlaylist , CreatePlaylist , UpdatePlaylist
from app.dependecnies.auth import get_current_user
from app.models.users import User
from app.models.playlists import Playlist
from app.services.playlists import create_playlist_service , update_playlist_service , get_playlist_service , delete_playlist_service


router = APIRouter(
    prefix=("/playlist"),
    tags=["Playlist"]
)


@router.post("/",response_model= ResponsePlaylist)
def create_playlist( playlist_data:CreatePlaylist, db:Session = Depends(get_db) ,current_user:User = Depends(get_current_user)):
    return create_playlist_service(db=db , current_user=current_user , playlist_data=playlist_data)




@router.put("/{playlist_id}" , response_model=ResponsePlaylist)
def update_playlist(playlist_data:UpdatePlaylist ,  playlist_id:int,db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return update_playlist_service(db = db ,  playlist_id=playlist_id, playlist_data=playlist_data , current_user=current_user)




@router.get("/{playlist_id}" , response_model = ResponsePlaylist)
def get_playlist(playlist_id:int , db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return  get_playlist_service(db = db , playlist_id=playlist_id ,current_user=current_user)




@router.get("/" , response_model=list[ResponsePlaylist])
def get_playlists(db:Session  = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return db.query(Playlist).filter(Playlist.user_id == current_user.id).all()
    
    
    


@router.delete("/{playlist_id}" , status_code=204)
def delete_playlist(playlist_id:int , db:Session = Depends(get_db), current_user:User = Depends(get_current_user)):
    delete_playlist_service(playlist_id=playlist_id , db = db , current_user=current_user)

