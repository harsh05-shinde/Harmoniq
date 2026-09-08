from sqlalchemy import String , Integer , Column , DateTime
from app.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer , primary_key=True)
    email = Column(String(200) , unique=True , index=True , nullable=False)
    hashed_password = Column(String(100) , nullable=False)
    signup_date = Column(DateTime , default=datetime.now)
    last_login_time = Column(DateTime , default=datetime.now)
    
    playlists = relationship("Playlist" , back_populates="users")
    likedsongs = relationship("LikedSong" , back_populates="users")