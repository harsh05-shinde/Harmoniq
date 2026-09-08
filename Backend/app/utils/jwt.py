from fastapi import HTTPException
from jose import jwt , JWTError
from datetime import timedelta , timezone  , datetime

from app.config import ACCESS_TOKEN_EXPIRE_TIME , ALGORITHM , SECRET_KEY


def create_access_token(data:dict):
    to_encode = data.copy()
    expire_time =  datetime.now(timezone.utc) + timedelta(ACCESS_TOKEN_EXPIRE_TIME)
    
    to_encode.update({
        "exp":expire_time
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        ALGORITHM
        
    )
    
    return encoded_jwt


def verify_access_token(token:str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        
        email = payload.get("sub")
        
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Could not validate the credentials"
                
            )
        return email
    
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate the credetials"
        )
        
        
    
    