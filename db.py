import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", "labels.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        with open("schema.sql") as f:
            conn.executescript(f.read())


def get_all_items():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM items ORDER BY name ASC"
        ).fetchall()
    return [dict(row) for row in rows]


def add_item(name, category, use_by, time_amt, denom, initials):
    with get_connection() as conn:
        conn.execute(
            """INSERT INTO items (name, category, use_by, time_amt, denom, initials)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (name.title(), category, use_by, time_amt, denom, initials.upper())
        )
        conn.commit()


def update_item(item_id, name, category, use_by, time_amt, denom, initials):
    with get_connection() as conn:
        conn.execute(
            """UPDATE items
               SET name=?, category=?, use_by=?, time_amt=?, denom=?, initials=?
               WHERE id=?""",
            (name.title(), category, use_by, time_amt, denom, initials.upper(), item_id)
        )
        conn.commit()