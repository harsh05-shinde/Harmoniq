from app.schemas.likedsongs import CreateLikedSong 
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.likedsongs import LikedSong 
from app.models.songs import Song
from app.models.users import User


def create_likedsong_service(db:Session ,current_user:User, likedsong_data:CreateLikedSong):
    db_song = db.query(Song).filter(Song.id == likedsong_data.song_id).first()
    
    
    if not db_song:
        raise HTTPException(
            status_code=404,
            detail="Song not found"
        )
    
    db_likedsong = db.query(LikedSong).filter(LikedSong.song_id == likedsong_data.song_id,
                                              LikedSong.user_id == current_user.id).first()
    
    if db_likedsong:
        raise HTTPException(
            status_code=400,
            detail= "Song is already liked by you"
        )
        
    
    new_likedsong = LikedSong(
        song_id = likedsong_data.song_id,
        user_id = current_user.id
    )
    
    db.add(new_likedsong)
    db.commit()
    db.refresh(new_likedsong)
    
    return new_likedsong
        





def get_likedsong_service(likedsong_id:int , db:Session , current_user:User):
    db_likedsong = db.query(LikedSong).filter(LikedSong.id == likedsong_id ,
                                              LikedSong.user_id == current_user.id).first()
    
    if not db_likedsong:
        raise HTTPException(
            status_code=404,
            detail = "Liked song not found for this user"
        )
    
    return db_likedsong







def get_likedsongs_service(db:Session , current_user:User):
    db_likedsong = db.query(LikedSong).filter(LikedSong.user_id == current_user.id).all()
    
    if not db_likedsong:
        raise HTTPException(
            status_code=404,
            detail="Liked song not found for this user"
        )
    
    return db_likedsong
    
        
    
    
    

def delete_likedsong_service(db:Session , likedsong_id:int , current_user:User):
    db_likedsong = db.query(LikedSong).filter(LikedSong.id == likedsong_id,
                                              LikedSong.user_id == current_user.id).first()
    
    if not db_likedsong:
        raise HTTPException(
            status_code=404,
            detail="Liked song not found for this user"
        )
        
    db.delete(db_likedsong)
    db.commit()
    
    return db_likedsong
    
    
    