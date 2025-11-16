import os
import uuid
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from app.gen_gemma_embedding import generate

# Load environment variables from .env file
load_dotenv()

# Get Qdrant credentials from environment variables
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

print(QDRANT_URL)
print(QDRANT_API_KEY)

# Set embedding size
EMBEDDING_SIZE = 768

# Create a namespace for generating deterministic UUIDs
NAMESPACE_UUID = uuid.uuid5(uuid.NAMESPACE_DNS, "ask-guruji.shipsar.in")


def process_pdfs(pdf_path):
    """
    Processes a single PDF file or all PDF files in a directory,
    splits them into chunks, generates embeddings, and stores them
    in a Qdrant collection.
    """
    # Initialize Qdrant client with URL and API key
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    collection_name = COLLECTION_NAME

    # Check if collection exists and create it if it doesn't
    collection_exists = False
    try:
        client.get_collection(collection_name=collection_name)
        collection_exists = True
    except Exception:
        pass

    if not collection_exists:
        client.create_collection(
            collection_name=collection_name,
            vectors_config={"size": EMBEDDING_SIZE, "distance": "Cosine"},
        )

    pdf_files = []
    if os.path.isdir(pdf_path):
        for filename in os.listdir(pdf_path):
            if filename.endswith(".pdf"):
                pdf_files.append(os.path.join(pdf_path, filename))
    elif os.path.isfile(pdf_path) and pdf_path.endswith(".pdf"):
        pdf_files.append(pdf_path)

    # Process each PDF file
    for filepath in pdf_files:
        filename = os.path.basename(filepath)
        # Load and split the PDF
        loader = PyPDFLoader(filepath)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)
        # Generate and store embeddings for each chunk
        for i, chunk in enumerate(chunks):
            text = chunk.page_content
            embeddings = generate(text)
            # Verify embedding dimensions
            if embeddings.shape[1] == EMBEDDING_SIZE:
                client.upsert(
                    collection_name=collection_name,
                    points=[
                        {
                            "id": str(uuid.uuid5(NAMESPACE_UUID, f"{filename}-{i}")),
                            "vector": embeddings[0].tolist(),
                            "payload": {"text": text},
                        }
                    ],
                )
            else:
                print(
                    "Skipping chunk with unexpected embedding dimension: "
                    f"{embeddings.shape[1]}"
                )


if __name__ == "__main__":
    # Get the pdfs directory or file path from the user
    pdf_path = input("Enter the path to the PDF file or directory: ")
    process_pdfs(pdf_path)
