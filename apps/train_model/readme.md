# PDF Processing and Embedding Service

This project provides a robust and scalable FastAPI service for processing PDF documents, generating high-quality embeddings using a custom ONNX-optimized Gemma model, and storing them in a Qdrant vector database. The service is designed to handle long-running ingestion tasks efficiently by using a non-blocking, asynchronous architecture with background tasks and job status polling.

## Key Features

-   **Asynchronous PDF Ingestion**: Upload PDF files through a RESTful API. The ingestion process runs in the background, allowing the client to receive an immediate response with a unique `job_id`.
-   **Job Status Management**: The API provides endpoints to track the real-time progress of ingestion jobs, stop running jobs, and delete job records. This is particularly useful for managing long-running training tasks and providing a better user experience.
-   **Local ONNX-Optimized Embedding Model**: The service utilizes a custom `gemma` embedding model that has been converted to the ONNX (Open Neural Network Exchange) format. This optimization significantly improves performance and allows the model to run efficiently on local hardware or even in a browser environment. The ONNX model is hosted on Hugging Face: [embeddinggemma-300m-onnx](https://huggingface.co/be1newinner/embeddinggemma-300m-onnx).
-   **Custom Text Cleaning**: Before chunking, the text extracted from PDFs is processed through a custom cleaning and normalization pipeline, which is especially effective for text from OCR'd documents.
-   **Modular and Scalable Architecture**: The project is structured with a clear separation of concerns, making it easy to maintain, extend, and scale.

## Project Structure

The project is organized into the following directories:

-   `app/`: The main application directory.
    -   `api.py`: Defines the FastAPI routes and application logic.
    -   `config.py`: Manages configuration and environment variables.
    -   `embedding/`: Contains the logic for the ONNX-optimized Gemma embedding model.
    -   `scripts/`: Includes utility scripts, such as the ONNX model conversion script.
    -   `services/`: Houses the business logic, including PDF processing, Qdrant interaction, job management, and text splitting.

## API Endpoints

The following endpoints are available:

| Method   | Path                       | Description                                                                                              |
| -------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `POST`   | `/train`                   | Uploads a PDF file and starts the ingestion process in the background. Returns a `job_id`.               |
| `GET`    | `/train/status/{job_id}`   | Retrieves the current status and progress of a specific ingestion job.                                   |
| `POST`   | `/train/stop/{job_id}`     | Stops a running ingestion job.                                                                           |
| `DELETE` | `/train/delete/{job_id}`   | Deletes the record of an ingestion job.                                                                  |

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** in the root directory and add your Qdrant credentials:
    ```
    QDRANT_URL=<your_qdrant_url>
    QDRANT_API_KEY=<your_qdrant_api_key>
    COLLECTION_NAME=<your_qdrant_collection_name>
    ```

5.  **Run the FastAPI server:**
    ```bash
    python -m app.main
    ```

## Usage Example

Once the server is running, you can start a new ingestion job by sending a `POST` request to the `/train` endpoint with a PDF file.

```bash
curl -X POST -F "file=@/path/to/your/document.pdf" http://localhost:8000/train
```

The server will respond with a `job_id`:

```json
{
  "job_id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
}
```

You can then use this `job_id` to poll the status of the job:

```bash
curl http://localhost:8000/train/status/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

The response will show the current status and progress:

```json
{
  "status": "processing",
  "progress": 50,
  "total": 100
}
```
