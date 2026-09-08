from app.schemas.playlists import CreatePlaylist , UpdatePlaylist
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.playlists import Playlist
from app.models.users import User



def create_playlist_service(db:Session,current_user:User ,playlist_data:CreatePlaylist):
    
    new_playlist = Playlist(
        name = playlist_data.name,
        user_id =  current_user.id
    )
    
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    
    return new_playlist
    



def update_playlist_service(playlist_id:int , current_user:User,db:Session ,playlist_data:UpdatePlaylist):
    db_playlist = db.query(Playlist).filter(Playlist.id == playlist_id ,
                                            Playlist.user_id == current_user.id).first()
    
    if not db_playlist:
        raise HTTPException(
            status_code = 404,
            detail="Playlist does not exist"
        )
        
    
    update_playlist = playlist_data.model_dump(exclude_unset=True)
    
    for field , value  in update_playlist.items():
        setattr(db_playlist , field , value)
        
    
    db.commit()
    db.refresh(db_playlist)
    
    return db_playlist






def get_playlist_service(db:Session ,  current_user:User,playlist_id:int ):
    db_playlist = db.query(Playlist).filter(Playlist.id == playlist_id,
                                            Playlist.user_id == current_user.id).first()
    
    if db_playlist is None:
        raise HTTPException(
            status_code=404,
            detail = "Playlist does not exist"
        )
    
    return db_playlist



def delete_playlist_service(db:Session , playlist_id:int , current_user:User):
    db_playlist = db.query(Playlist).filter(Playlist.id == playlist_id,
                                            Playlist.user_id == current_user.id).first()
    
    if not db_playlist:
        raise HTTPException(
            status_code=404,
            detail="Playlist not found"
        )
    
    db.delete(db_playlist)
    db.commit()
    
    return {"Message":"Deleted sucessfully"}
    