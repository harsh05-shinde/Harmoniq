from app.database import Base
from sqlalchemy import String , Integer , Column , ForeignKey , DateTime
from datetime import datetime , UTC
from sqlalchemy.orm import relationship


class Playlist(Base):
    __tablename__ = "playlist"
    
    id = Column(Integer , primary_key=True)
    name = Column(String(200) , nullable=False)
    user_id = Column(Integer , ForeignKey("user.id") , index=True , nullable=False)
    cover_image_url = Column(String(200) , nullable=False , default="http://127.0.0.1:8000/media/covers/default.jpg")
    created_at = Column(DateTime , default=datetime.now(UTC))
    updated_at = Column(DateTime ,default=datetime.now(UTC) ,  onupdate=datetime.now(UTC))
    
    users = relationship("User" , back_populates="playlists")
    playlistsongs = relationship("PlaylistSong" , back_populates="playlists")
    
    