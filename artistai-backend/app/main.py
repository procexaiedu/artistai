from fastapi import FastAPI

app = FastAPI(title="artistAI API")

@app.get("/", tags=["Health Check"])
def read_root():
    """Endpoint para verificar se a API está online."""
    return {"message": "artistAI Backend is running!"}