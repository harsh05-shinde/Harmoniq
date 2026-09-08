from app.schemas.songs import CreateSong , UpdateSong 
from app.models.songs import Song
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.users import User

# Delete songs and get all song will be done in the rouers 

def create_song_service(db:Session , song_data:CreateSong):
    db_song = db.query(Song).filter(Song.title == song_data.title ,
                                    Song.album_id == song_data.album_id ,
                                    Song.artist_id == song_data.artist_id).first()
    
    if db_song:
        raise HTTPException(
            status_code=400,
            detail="Song Already exist"
        )
    
    
    new_song = Song(
        title = song_data.title,
        artist_id = song_data.artist_id,
        album_id = song_data.album_id,
        duration = song_data.duration,
        audio_url = song_data.audio_url,
        cover_image_url = song_data.cover_image_url
    )
    
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    
    return new_song





def update_song_service(song_id:int , db:Session , song_data:UpdateSong):
    db_song = db.query(Song).filter(Song.id == song_id).first()
    
    if db_song is None:
        raise HTTPException(
            status_code=404,
            detail="Song does not exist"
        )
    update_data =  song_data.model_dump(exclude_unset=True)
    
    for field , value in update_data.items():
        setattr(db_song,field,value)
    
    db.commit()
    db.refresh(db_song)
    
    return db_song
        
        
        

def get_song_service(db:Session , song_id:int):
    db_song = db.query(Song).filter(Song.id == song_id).first()
    
    
    if not db_song:
        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )
    
    return db_song 
    




def create_search_service(search_text:str , db:Session , current_user:User):
    if not search_text:
        return {
            "message":"Please enter a song name"
        }       

    searched_song = db.query(Song).filter(Song.title.ilike(f"%{search_text}%")).all()
    
    
    if not searched_song:
        return {
            "message":"No song found"
        }
    
    return searched_song
    
    