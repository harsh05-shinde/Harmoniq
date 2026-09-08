from sqlalchemy.orm import Session 
from fastapi import APIRouter   , Depends , HTTPException
from app.schemas.songs import SongResponse , CreateSong , UpdateSong
from app.services.songs import create_song_service , get_song_service , update_song_service , create_search_service
from app.database import get_db
from app.models.songs import Song
from app.models.users import User
from app.dependecnies.auth import get_current_user

router = APIRouter(
    prefix="/song",
    tags=["Song"]
)




@router.get("/search" )
def search_songs(search_text:str , db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return  create_search_service(search_text=search_text , db=db , current_user=current_user)
    
    




@router.post("/" , response_model=SongResponse)
def create_song( song_data:CreateSong, db:Session = Depends(get_db)):
    return create_song_service(db=db , song_data=song_data)
    
    



@router.put("/{song_id}" , response_model=SongResponse)
def update_song(song_id:int , song_data:UpdateSong , db:Session = Depends(get_db)):
    return update_song_service(song_data=song_data , db=db , song_id=song_id)




@router.get("/{song_id}" , response_model=SongResponse)
def get_song(song_id:int , db:Session = Depends(get_db)):
    return get_song_service(song_id=song_id , db=db)



@router.get("/" , response_model= list[SongResponse])
def get_songs(db:Session = Depends(get_db)):
    songs = db.query(Song).all()
    
    if not songs:
        raise HTTPException(
            status_code=404,
            detail="No song available"
        )
    return songs


