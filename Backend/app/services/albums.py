from app.schemas.albums import CreateAlbum , UpdateAlbum
from fastapi import HTTPException
from app.database import get_db
from sqlalchemy.orm import Session 
from app.models.albums import Album




def create_album_service(db:Session , album_data:CreateAlbum):
    db_album = db.query(Album).filter(Album.artist_id == album_data.artist_id,
                                      Album.name == album_data.name).first()
    
    if db_album:
        raise HTTPException(
            status_code=400,
            detail="Album already exist"
        )
    
    new_album = Album(
        name = album_data.name,
        artist_id = album_data.artist_id,
        cover_image_url = album_data.cover_image_url,
        release_date = album_data.release_date
    )
    
    
    db.add(new_album)
    db.commit()
    db.refresh(new_album)
    
    return new_album




def update_album_service(album_id:int , db:Session , album_data:UpdateAlbum):
    db_album = db.query(Album).filter(Album.id == album_id).first()
    
    if not db_album:
        raise HTTPException(
            status_code=404,
            detail="Album does not exist"
        )
    
    update_album = album_data.model_dump(exclude_unset=True)
    
    for field , value in update_album.items():
        setattr(db_album , field , value)
    
    
    db.commit()
    db.refresh(db_album)
    
    return db_album





def get_album_service(album_id:int , db:Session):
    db_album = db.query(Album).filter(Album.id == album_id).first()
    
    if not db_album:
        raise HTTPException(
            status_code=404,
            detail="Album does not exist"
        )
    
    return db_album

