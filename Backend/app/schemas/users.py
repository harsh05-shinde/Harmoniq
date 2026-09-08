from pydantic import BaseModel , EmailStr , ConfigDict 
from datetime import datetime


class UserSignup(BaseModel):
    email:EmailStr
    password:str

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str
    
class UserResponse(BaseModel):
    id:int
    email:EmailStr
    signup_date:datetime
    last_login_time:datetime |None = None
    
    model_config = ConfigDict(from_attributes=True)