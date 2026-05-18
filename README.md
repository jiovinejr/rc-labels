# Food Prep Labeling System

A web app built for a restaurant kitchen that needed a faster, more reliable way to label prepped food items — with the right expiration dates every time, no mental math required.

Kitchen staff search for an item, enter their initials, and instantly see a preview of exactly what the label will look like before it prints. The label database lives in the app and can be updated by anyone on the team without touching a spreadsheet.

---

## The Problem

The kitchen was using a Zebra label printer with a basic setup that required staff to manually calculate expiration dates in their heads and type everything by hand. Wrong dates, inconsistent formatting, and wasted label stock were a regular occurrence.

The existing tool was a Google Apps Script app embedded in a Google Site — which worked, but couldn't be version controlled, couldn't be containerized, and couldn't be shared as a portfolio piece. It also meant every future improvement had to happen inside Google's editor with no local dev workflow.

---

## What It Does

- Staff search for a prepped item by name using an autocomplete field
- A label preview modal renders a to-scale 2×2 inch label with the item name, print date, expiration date, and initials — calculated automatically from the item's stored shelf life
- Custom labels let staff manually pick an expiration date for one-off items not in the database
- Items can be added to the database directly from the app — name, category, shelf life, and unit
- Existing items can be edited in place without touching the database directly
- The label database seeds itself automatically on startup so the app is always demo-ready

---

## Tech Stack

**Frontend**
- Vanilla HTML, CSS, JavaScript
- Jinja2 templating (Flask's built-in)
- Awesomplete for lightweight autocomplete (no jQuery, no heavy dependencies)

**Backend**
- Python / Flask
- Raw `sqlite3` — no ORM, single table, straightforward

**Infrastructure**
- Docker
- Google Cloud Run

---

## Why It's Built This Way

The original version was a Google Apps Script app connected to a Google Sheet as the database. It worked well in production — Zebra's `SendFileToPrinter` API handled label output, and the Sheet gave the kitchen a familiar interface for managing items.

This version is a rebuild for portability. GAS projects can't be pushed to GitHub, can't be containerized, and don't translate well to a portfolio. Flask was the natural replacement — clean Python backend, proper routing, and a local dev workflow that actually makes sense.

SQLite was chosen over Postgres or a managed database intentionally. The app has one table with six columns. An ORM or a cloud database would be overkill, and raw `sqlite3` is part of Python's standard library — no extra dependencies, nothing to configure.

The database seeds itself from a hardcoded list of real kitchen items on every cold start. Since Cloud Run containers are stateless, this keeps the app fully functional for anyone viewing the live demo without needing persistent external storage. In a real production deployment, the SQLite file would be replaced with Cloud SQL or Firestore.

The label preview replaces what was a direct Zebra API call in the original. In production, the app sends ZPL (Zebra Programming Language) to a specific printer serial number — with support for multiple printers by location. That detail is intentionally omitted from this version since it requires physical hardware, but the ZPL generation logic and printer routing are documented in the code.

---

## Running It Locally

```bash
pip install -r requirements.txt
python app.py
```

Open `http://localhost:8080` — the database seeds automatically on first run.

**With Docker:**

```bash
docker build -t rc-labels .
docker run -p 8080:8080 rc-labels
```