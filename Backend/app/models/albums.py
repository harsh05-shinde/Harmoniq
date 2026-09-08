from sqlalchemy.orm import relationship 
from sqlalchemy import Column ,String , Integer , ForeignKey , Date
from app.database import Base


class Album(Base):
    __tablename__ = "album"
    
    id = Column(Integer , primary_key=True)
    name = Column(String(100), nullable=False)
    artist_id = Column(Integer ,ForeignKey("artist.id") , nullable=False)
    cover_image_url = Column(String(200) , nullable=False)
    release_date = Column(Date)
    
    songs = relationship("Song" , back_populates="albums")
    artists = relationship("Artist" , back_populates="albums")
    
    
