"""WE DO NOT NEED THE SCHEMAS FOR THE PLAYLIST BECAUSE THE REQUIRED DATA WILL COME FROM THE FRONTEND , USER , PLAYLIST_ID  , SONG_ID ETC.
AND IT WILL RECEIVE TO THE BACKEND BY PATH PARAMETERES AND PATH PARAMETERES WILL GET THAT FROM THE JWT TOKENS"""





from pydantic import BaseModel
from datetime import datetime


class PlaylistSongResponse(BaseModel):
    id:int
    playlist_id:int
    song_id:int
    added_at:datetime