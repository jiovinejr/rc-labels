"""
Seed the database with default food prep items.
Runs automatically on container startup via app.py.
"""

from db import get_connection, init_db

SEED_ITEMS = [
    ("Cream Cheese",        "Dairy",                "Use By:", 1,  "Weeks",  "BF"),
    ("House Vinaigrette",   "Sauces and Dressings", "Use By:", 5,  "Days",   "BF"),
    ("Roasted Chicken",     "Poultry",              "Use By:", 3,  "Days",   "BF"),
    ("Beef Short Rib",      "Meats and Proteins",   "Use By:", 4,  "Days",   "BF"),
    ("Lobster Bisque",      "Soups",                "Use By:", 3,  "Days",   "BF"),
    ("Brioche",             "Breads",               "Use By:", 2,  "Days",   "BF"),
    ("Clarified Butter",    "Dairy",                "Use By:", 2,  "Weeks",  "BF"),
    ("Herb Oil",            "Sauces and Dressings", "Use By:", 1,  "Weeks",  "BF"),
    ("Pickled Red Onion",   "Toppings",             "Use By:", 2,  "Weeks",  "BF"),
    ("Arugula Salad Mix",   "Greens",               "Use By:", 3,  "Days",   "BF"),
    ("Lemon Curd",          "Misc",                 "Use By:", 1,  "Weeks",  "BF"),
    ("Hollandaise",         "Sauces and Dressings", "Use By:", 1,  "Days",   "BF"),
    ("Duck Confit",         "Poultry",              "Use By:", 5,  "Days",   "BF"),
    ("Risotto Base",        "Starches and Grains",  "Use By:", 3,  "Days",   "BF"),
    ("Fresh Mozzarella",    "Cheese",               "Use By:", 5,  "Days",   "BF"),
    ("Tomato Confit",       "Vegetables",           "Use By:", 1,  "Weeks",  "BF"),
    ("House Sangria",       "Bar Items",            "Use By:", 3,  "Days",   "BF"),
    ("Tarragon Aioli",      "Sauces and Dressings", "Use By:", 5,  "Days",   "BF"),
    ("Candied Walnuts",     "Toppings",             "Use By:", 1,  "Months", "BF"),
    ("Orange Juice",        "Juices",               "Use By:", 2,  "Days",   "BF"),
]


def seed():
    init_db()
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
        if count == 0:
            conn.executemany(
                """INSERT INTO items (name, category, use_by, time_amt, denom, initials)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                SEED_ITEMS
            )
            conn.commit()
            print(f"[seed] Inserted {len(SEED_ITEMS)} items.")
        else:
            print(f"[seed] DB already has {count} items — skipping seed.")


if __name__ == "__main__":
    seed()