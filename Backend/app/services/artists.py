from app.models.artists import Artist
from sqlalchemy.orm import Session
from app.schemas.artists import CreateArtist , UpdateArtist
from fastapi import HTTPException


def create_artist_service(db:Session , artist_data:CreateArtist):
    artist_name = artist_data.name.strip()
    db_artist = db.query(Artist).filter(Artist.name == artist_name).first()
    
    
    if db_artist:
        raise HTTPException(
            status_code=400,
            detail="Artist already exist"
        )
    
    new_artist = Artist(
        name = artist_name,
        bio = artist_data.bio,
        image_url = artist_data.image_url
    )
    
    db.add(new_artist)
    db.commit()
    db.refresh(new_artist)
    
    return new_artist
    
    
    

def update_artist_service(artist_data:UpdateArtist, artist_id:int,db:Session):
    db_artist = db.query(Artist).filter(Artist.id == artist_id).first()
    
    if db_artist is None:
        raise HTTPException(
            status_code=404,
            detail= "Artist does not exist"
        )
        
    update_data = artist_data.model_dump(exclude_unset=True)
    
    
    for field, value in update_data.items():
        setattr(db_artist , field , value)
        
    
    db.commit()
    db.refresh(db_artist)
    
    return db_artist




def get_artist_service(artist_id:int , db:Session):
    db_artist = db.query(Artist).filter(Artist.id == artist_id).first()
    
    if not db_artist:
        raise HTTPException(
            status_code=404,
            detail="Artist does not exist"
        )
    
    return db_artist
    
    





# def delete_artist_service(artist_id , db:Session):
#     db_artist = db.query(Artist).filter(Artist.id == artist_id).first()
    
#     if not db_artist:
#         raise HTTPException(
#             status_code=404,
#             detail="Artist does not exist"
#         )
    
#     db.delete(db_artist)
#     db.commit()
    
#     return db_artist