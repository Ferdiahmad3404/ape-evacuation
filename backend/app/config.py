import os


class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "ape_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "junior221")
    DB_PASSWORD_VALUE = DB_PASSWORD or ""

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        (
            f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD_VALUE}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        ),
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "ape-evacuation-secret-key")
