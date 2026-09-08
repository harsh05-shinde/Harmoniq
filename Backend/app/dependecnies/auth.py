from  app.utils.jwt import create_access_token  , verify_access_token
from fastapi.security import OAuth2PasswordBearer
from app.models.users import User
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import HTTPException , Depends

Oauth_schema = OAuth2PasswordBearer(tokenUrl="/user/login")
 
def get_current_user(token:str = Depends(Oauth_schema), db:Session = Depends(get_db)):
    
    email = verify_access_token(token)
    
    current_user = db.query(User).filter(User.email == email).first()
    
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail= "Could not validate the credentials"
        )
        
    return current_user
    
    
    

