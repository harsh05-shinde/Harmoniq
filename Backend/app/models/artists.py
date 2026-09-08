from sqlalchemy import String , Column , Integer
from app.database import Base
from sqlalchemy.orm import relationship



class Artist(Base):
    __tablename__ = "artist"
    
    id = Column(Integer , primary_key= True)
    name = Column(String(100) , nullable=False , index= True)
    bio = Column(String(300) , nullable=False)
    image_url = Column(String(300) , nullable=False)
    
    songs = relationship("Song" , back_populates="artists")
    albums = relationship("Album" , back_populates="artists")

    
    