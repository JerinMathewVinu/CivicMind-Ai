import sqlite3
import os
from contextlib import contextmanager

# Store the database file in the backend root directory
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "civicmind.db")

@contextmanager
def get_db():
    """Context manager for SQLite database connections with row support and auto-commit."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Creates database tables if they do not exist."""
    with get_db() as conn:
        # Create users table
        conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            username TEXT UNIQUE,
            password_hash TEXT,
            display_name TEXT,
            role TEXT DEFAULT 'citizen',
            photo_url TEXT,
            points INTEGER DEFAULT 0,
            badges TEXT DEFAULT '[]',
            department TEXT,
            created_at TEXT
        )
        """)
        
        # Create issues table
        conn.execute("""
        CREATE TABLE IF NOT EXISTS issues (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            category TEXT,
            status TEXT,
            severity TEXT,
            priority_score REAL,
            lat REAL,
            lng REAL,
            address TEXT,
            image_urls TEXT DEFAULT '[]',
            reporter_id TEXT,
            reporter_name TEXT,
            assigned_officer_id TEXT,
            department TEXT,
            ai TEXT,
            upvotes INTEGER DEFAULT 0,
            verifications INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT,
            resolved_at TEXT
        )
        """)
        
        # Create audit_logs table
        conn.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            request_id TEXT PRIMARY KEY,
            method TEXT,
            path TEXT,
            status INTEGER,
            duration_ms REAL,
            actor TEXT,
            created_at TEXT
        )
        """)
