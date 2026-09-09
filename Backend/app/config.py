from dotenv import load_dotenv
import os
load_dotenv()

DATABASE_URL =  os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_TIME = int(os.getenv("ACCESS_TOKEN_EXPIRE_TIME"))
SSL_CA =  os.getenv("SSL_CA")


if SSL_CA:
    if not os.path.isabs(SSL_CA):
        SSL_CA = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            SSL_CA
        )








