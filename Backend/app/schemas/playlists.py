from pydantic import BaseModel , ConfigDict
from datetime import datetime


class CreatePlaylist(BaseModel):
    name:str


class UpdatePlaylist(BaseModel):
    name:str | None = None
    

class ResponsePlaylist(BaseModel):
    id:int
    name:str
    user_id:int
    cover_image_url:str
    created_at:datetime
    updated_at:datetime
    
    
    model_config = ConfigDict(from_attributes=True)
    
    