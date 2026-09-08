from app.database import Base
from sqlalchemy import Column , Integer  , ForeignKey , DateTime 
from  sqlalchemy.orm import relationship
from datetime import datetime , UTC



class LikedSong(Base):
    __tablename__ = "likedsong"
    
    id  = Column(Integer , primary_key=True)
    song_id = Column(Integer  , ForeignKey("song.id"))
    user_id  = Column(Integer , ForeignKey("user.id"))
    liked_at = Column(DateTime , default=datetime.now(UTC))
    
    
    songs = relationship("Song" , back_populates="likedsongs")
    users = relationship("User" , back_populates="likedsongs")
    


    
    
    
    
    
    
    
    