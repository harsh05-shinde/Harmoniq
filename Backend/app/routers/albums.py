from app.schemas.albums import AlbumResponse , CreateAlbum , UpdateAlbum
from app.database import get_db
from fastapi import Depends  , APIRouter , HTTPException
from sqlalchemy.orm import Session
from app.services.albums import create_album_service , update_album_service , get_album_service
from app.models.albums import Album


router = APIRouter(
    prefix="/album",
    tags=["Album"]
)


@router.post("/" , response_model = AlbumResponse)
def create_album(album_data: CreateAlbum, db:Session = Depends(get_db)):
    return create_album_service(db = db , album_data=album_data)


@router.put("/{album_id}" , response_model = AlbumResponse)
def udpate_album(album_id:int , album_data:UpdateAlbum , db:Session = Depends(get_db)):
    return update_album_service(db = db , album_data=album_data , album_id=album_id)


@router.get("/{album_id}" , response_model=AlbumResponse)
def get_album(album_id:int , db:Session = Depends(get_db)):
    return get_album_service(db = db , album_id=album_id)



@router.get("/" , response_model=list[AlbumResponse])
def get_albums(db:Session = Depends(get_db)):
    db_albums = db.query(Album).all()
    
    
    if db_albums is None:
        raise  HTTPException(
            status_code=404,
            detail="No albums exists"
        )
    return db_albums
    