from sqlalchemy  import String , Integer  , Column , ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Song(Base):
    __tablename__ = "song"
    id = Column(Integer , primary_key=True)
    title = Column(String(100), nullable=False)
    artist_id = Column(Integer , ForeignKey("artist.id"))
    album_id = Column(Integer , ForeignKey("album.id"))
    duration = Column(Integer , nullable=False)
    audio_url = Column(String(300)  , nullable=False , unique=True)
    cover_image_url = Column(String(300) , nullable=False)
    
    artists = relationship("Artist" , back_populates="songs")
    albums = relationship("Album" , back_populates="songs")
    playlistsongs = relationship("PlaylistSong" , back_populates= "songs")
    likedsongs = relationship("LikedSong" , back_populates="songs")
    
