from flask import Flask
from models import db
from routes import routes  # Import the routes Blueprint
from flask_cors import CORS
from extensions import cache
app = Flask(__name__)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/questions"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["CACHE_TYPE"] = "SimpleCache"  # Use in-memory cache
app.config["CACHE_DEFAULT_TIMEOUT"] = 300  # Cache timeout in seconds
# Initialize SQLAlchemy
db.init_app(app)

CORS(app)

# Register the Blueprint
app.register_blueprint(routes)
# Configure caching
cache.init_app(app)  # Initialize the cache with the app


# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return "Database connected and routes are working!"

if __name__ == "__main__":
    app.run(debug=True)
