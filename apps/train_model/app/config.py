import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Qdrant credentials from environment variables
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Set embedding size
EMBEDDING_SIZE = 768
