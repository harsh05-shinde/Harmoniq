from fastapi import APIRouter , Depends , HTTPException
from sqlalchemy.orm import Session  
from app.database import get_db
from app.schemas.artists import ArtistResponse , CreateArtist , UpdateArtist
from app.services.artists import get_artist_service , update_artist_service , create_artist_service
from app.models.artists import Artist


router = APIRouter(
    prefix="/artist",
    tags=["Artist"]
)



@router.post("/" , response_model = ArtistResponse)
def create_artist(artist_data:CreateArtist , db:Session = Depends(get_db)):
    return create_artist_service(db = db , artist_data=artist_data)




@router.put("/{artist_id}" , response_model=ArtistResponse)
def update_artist(artist_data:UpdateArtist ,artist_id:int , db:Session = Depends(get_db)):
    return update_artist_service(db = db , artist_id=artist_id ,artist_data=artist_data)




@router.get("/{artist_id}" , response_model=ArtistResponse)
def get_artist(artist_id , db:Session = Depends(get_db)):
    return get_artist_service(artist_id=artist_id , db=db)




@router.get("/" , response_model= list[ArtistResponse])
def get_artists(db:Session = Depends(get_db)):
    artists = db.query(Artist).all()
    
    if not artists:
        raise HTTPException(
            status_code=404,
            detail="Artist does not found"
        )
    
    return artists