from pydantic import BaseModel , ConfigDict 
from datetime import datetime
from app.schemas.artists import ArtistResponse


class CreateSong(BaseModel):
    title:str
    artist_id:int
    album_id:int
    duration:int
    audio_url:str
    cover_image_url:str


class UpdateSong(BaseModel):
    title:str | None = None
    artist_id:int | None = None
    album_id:int |None = None
    duration:int | None = None
    audio_url:str | None = None
    cover_image_url:str |None  = None
    
    
class SongResponse(BaseModel):
    id:int
    title:str
    artist_id:int
    album_id:int
    duration:int
    audio_url:str
    cover_image_url:str
    artists:ArtistResponse
   
    
    model_config = ConfigDict(from_attributes=True)
    
    
    