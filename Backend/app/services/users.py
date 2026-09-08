from app.models.users import User
from app.schemas.users import UserLogin , UserSignup
from fastapi import HTTPException 
from sqlalchemy.orm import Session
from app.utils.security import verify_password , hash_password
from app.dependecnies.auth import create_access_token
from fastapi.security import OAuth2PasswordRequestForm


def user_signup_service(db:Session , user_data:UserSignup):
    
    user_db = db.query(User).filter(User.email == user_data.email).first()
    
    if user_db:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user_data.password)
    
    
    new_user = User(
        email = user_data.email,
        hashed_password = hashed_password,    
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
 
    
    return new_user
        
    


def user_login_service(db:Session , user_data:OAuth2PasswordRequestForm):
    
    user_db = db.query(User).filter(User.email == user_data.username).first()
    if user_db is None:
        raise HTTPException(
            status_code=401,
            detail="Wrong Email/Password"
        )
    
    password = verify_password(user_data.password , user_db.hashed_password)
    
    if not password:
        raise HTTPException(
            status_code=401,
            detail="Wrong Email/Password"
        )
        
    
    access_token = create_access_token(data = {"sub":user_db.email})
    
    return{
        "access_token":access_token,
        "token_type":"bearer"
        
    }

        
        
    



