from pydantic import BaseModel , ConfigDict
from datetime import datetime




class CreateLikedSong(BaseModel):
    song_id:int

    
    

class LikedSongResponse(BaseModel):
    id:int
    song_id:int
    user_id:int
    liked_at:datetime
    
    model_config = ConfigDict(from_attributes=True)