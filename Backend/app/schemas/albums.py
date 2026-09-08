from app.database import get_db
from pydantic import BaseModel
from datetime import date


class CreateAlbum(BaseModel):
    name:str
    artist_id:int
    cover_image_url:str
    release_date:date
    

class UpdateAlbum(BaseModel):
    name:str | None = None
    artist_id:int| None = None
    cover_image_url:str | None = None
    release_date:date | None = None
   
    
class AlbumResponse(BaseModel):
    id:int
    name:str
    artist_id:int
    cover_image_url:str
    release_date:date