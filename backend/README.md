# Flask MVC Example

Contoh struktur backend Flask dengan pemisahan:

- Model: `app/models/`
- Service: `app/services/`
- Route: `app/routes/`

## Database

Default koneksi PostgreSQL:

- host: `localhost`
- port: `5432`
- database: `ape_db`
- user: `postgre`
- password: ``

## Menjalankan

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Endpoint

- `GET /api/users`
- `GET /api/users/<id>`
- `POST /api/users`
