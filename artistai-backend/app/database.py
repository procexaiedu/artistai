import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
# Especifica o caminho absoluto para o arquivo .env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("A variável de ambiente DATABASE_URL não foi definida.")

# Cria a engine de conexão com o banco de dados
engine = create_engine(DATABASE_URL)

# Cria uma fábrica de sessões para interagir com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para as classes de modelo declarativas do SQLAlchemy
Base = declarative_base()


def get_db():
    """
    Função geradora que cria uma sessão do banco de dados,
    a disponibiliza para a requisição e garante que seja fechada ao final.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()