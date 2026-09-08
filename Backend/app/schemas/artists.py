from pydantic import BaseModel , ConfigDict


class CreateArtist(BaseModel):
    name:str
    bio:str
    image_url:str
    
class UpdateArtist(BaseModel):
    name:str | None = None
    bio:str | None = None
    image_url:str | None = None
    
class ArtistResponse(BaseModel):
    id:int
    name:str
    bio:str
    image_url:str
    
    model_config = ConfigDict(from_attributes=True)
    
    
    