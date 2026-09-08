from sqlalchemy import Column , Integer , ForeignKey , DateTime
from sqlalchemy.orm import relationship
from app.database import  Base 
from datetime import datetime , UTC


class PlaylistSong(Base):
    __tablename__ = "playlistsong"
    
    id = Column(Integer , primary_key=True)
    playlist_id = Column(Integer , ForeignKey("playlist.id") , nullable=False)
    song_id = Column(Integer , ForeignKey("song.id") , nullable=False)
    added_at = Column(DateTime , default=datetime.now(UTC))
    
    playlists = relationship("Playlist" , back_populates="playlistsongs")
    songs = relationship("Song" , back_populates="playlistsongs")
    