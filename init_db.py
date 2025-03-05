
from main import app
from models import db
import os

# Remove existing database if it exists
db_path = 'instance/bot.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Removed existing database: {db_path}")

# Create new database with all tables
with app.app_context():
    db.create_all()
    print("Database initialized successfully with all current models")
