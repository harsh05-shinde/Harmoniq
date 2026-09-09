from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import DATABASE_URL , SSL_CA


connect_args  = {}

if SSL_CA:
    connect_args = {
        "ssl_ca":SSL_CA,
        "ssl_verify_cert":True,
        "ssl_verify_identity":True
    }

engine = create_engine(DATABASE_URL ,
                       connect_args=connect_args,
                       pool_pre_ping=True)

Sessionlocal = sessionmaker(bind=engine)

Base = declarative_base()


def get_db():
    db = Sessionlocal()
    
    try:
        yield db
    
    finally:
        db.close()
        
