from app.models.users import User
from app.schemas.users import UserResponse
from app.services.users import user_login_service , user_signup_service
from fastapi import APIRouter  , Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.users import UserSignup , UserLogin , TokenResponse
from app.dependecnies.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    prefix="/user", 
    tags=["User"]
)

@router.post("/signup" , response_model=UserResponse)
def user_signup(user_data:UserSignup , db:Session = Depends(get_db)):
    return(user_signup_service(user_data=user_data , db=db))


@router.post("/login", response_model=TokenResponse)
def user_login(user_data:OAuth2PasswordRequestForm = Depends() , db:Session = Depends(get_db)):
    return(user_login_service(user_data=user_data , db=db))


@router.get("/getuser" , response_model=UserResponse)
def get_user(current_user:User = Depends(get_current_user)):
    return current_user
    
