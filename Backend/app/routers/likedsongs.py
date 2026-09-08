from fastapi import APIRouter , Depends
from sqlalchemy.orm import Session
from app.services.likedsongs import get_likedsong_service , create_likedsong_service , delete_likedsong_service , get_likedsongs_service
from app.schemas.likedsongs import LikedSongResponse , CreateLikedSong
from app.database import get_db
from app.models.users import User
from app.dependecnies.auth import get_current_user



router = APIRouter(
    prefix="/likedsong",
    tags=["LikedSong"]
)


@router.post("/" , response_model=LikedSongResponse)
def create_likedsong( likedsong_data:CreateLikedSong,db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return create_likedsong_service(db = db , current_user=current_user ,likedsong_data=likedsong_data)




@router.get("/{likedsong_id}" , response_model=LikedSongResponse)
def get_likedsong(likedsong_id:int , db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return  get_likedsong_service(likedsong_id=likedsong_id , db = db , current_user=current_user)




@router.get("/" , response_model=list[LikedSongResponse])
def get_likedsongs(db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return get_likedsongs_service(db=db , current_user=current_user)




@router.delete("/{likedsong_id}" , response_model=LikedSongResponse)
def delete_likedsong(likedsong_id:int ,db:Session = Depends(get_db) , current_user:User = Depends(get_current_user)):
    return delete_likedsong_service(likedsong_id=likedsong_id , db=db , current_user=current_user)

    