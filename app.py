from flask import Flask, jsonify, request, render_template
from db import get_all_items, add_item, update_item
from seed import seed

app = Flask(__name__)

# Run schema init + seed on startup
seed()


CATEGORIES = [
    "Bar Items", "Breads", "Cheese", "Dairy", "Dressing", "Greens",
    "Herbs", "Jam and Jelly", "Juices", "Meats and Proteins", "Misc",
    "Poultry", "Prepped Items", "Produce", "Sauces and Dressings",
    "Soups", "Starches and Grains", "Toppings", "Vegetables"
]

@app.route("/")
def index():
    return render_template("index.html", categories=CATEGORIES)


@app.route("/api/items", methods=["GET"])
def items_get():
    return jsonify(get_all_items())


@app.route("/api/items", methods=["POST"])
def items_post():
    data = request.get_json()
    try:
        add_item(
            name=data["name"],
            category=data["category"],
            use_by=data.get("use_by", "Use By:"),
            time_amt=data["time_amt"],
            denom=data["denom"],
            initials=data["initials"]
        )
        return jsonify({"status": "ok"}), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def items_put(item_id):
    data = request.get_json()
    try:
        update_item(
            item_id=item_id,
            name=data["name"],
            category=data["category"],
            use_by=data.get("use_by", "Use By:"),
            time_amt=data["time_amt"],
            denom=data["denom"],
            initials=data.get("initials", "")
        )
        return jsonify({"status": "ok"})
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)