
# Ask Guruji - Retrieval-Augmented Generation (RAG) Project

This project is a powerful Retrieval-Augmented Generation (RAG) system designed to answer questions based on a given set of documents. It leverages cutting-edge technologies to provide accurate and contextually relevant answers.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Documentation](#api-documentation)
- [Local Training Project](#local-training-project)

## Project Overview

Ask Guruji is a sophisticated RAG project that combines the power of large language models (LLMs) with a vector database to create a question-answering system. The system can ingest PDF documents, process them into a searchable format, and then use this knowledge base to answer user queries.

This project demonstrates a deep understanding of RAG architecture, vector databases, and the integration of various AI and backend technologies.

## Features

- **Document Ingestion**: Upload PDF documents to build a knowledge base.
- **Document Retrieval**: Retrieve relevant document chunks based on a user's query.
- **Answer Generation**: Generate human-like answers to questions using the retrieved context.
- **RESTful API**: A well-defined API for interacting with the system.
- **Scalable Architecture**: The system is designed to be scalable and can handle a large number of documents.

## Architecture

The project follows a microservices-oriented architecture. The core components are:

1.  **Express.js Backend**: This is the main application server that exposes the REST API. It handles all incoming requests, orchestrates the different services, and manages the overall workflow.

2.  **Qdrant Vector Database**: Qdrant is used as the vector database to store the embeddings of the document chunks. It provides fast and efficient similarity search, which is crucial for the retrieval part of the RAG system.

3.  **Google Gemini LLM**: Google's Gemini model is used for two key tasks:
    *   **Embedding Generation**: To convert the document chunks into vector embeddings.
    *   **Answer Generation**: To generate answers based on the user's query and the retrieved context.

4.  **Elasticsearch and Kibana**: While the primary vector database is Qdrant, the project also includes a Docker setup for Elasticsearch and Kibana, which can be used for advanced logging, monitoring, and data visualization.

Here is a high-level diagram of the architecture:

```
[User] -> [Express.js API] -> [Qdrant Vector DB]
       ^              |
       |              v
       +-------- [Google Gemini LLM]
```

## Technologies Used

- **Backend**: Node.js, Express.js, TypeScript
- **Vector Database**: Qdrant
- **AI/ML**:
  - LangChain.js
  - Google Gemini
- **Containerization**: Docker
- **API Documentation**: Swagger (OpenAPI)
- **Linting and Formatting**: ESLint, Prettier

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- A Google Cloud project with the Gemini API enabled. You will need an API key.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ask_guruji.git
    cd ask_guruji/apps/backend
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the environment variables:**

    Create a `.env` file in the `apps/backend` directory and add the following variables:

    ```env
    PORT=3000
    QDRANT_URL="http://localhost:6333"
    GOOGLE_API_KEY="your-google-api-key"
    ```

4.  **Start the services:**

    This will start the Qdrant, Elasticsearch, and Kibana containers.

    ```bash
    docker-compose up -d
    ```

5.  **Run the application:**

    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:3000`.

## API Documentation

The API documentation is generated using Swagger and is available at `http://localhost:3000/docs`.

The main API endpoints are:

- `POST /documents/ingest`: Ingest a PDF document.
- `GET /documents/{id}`: Get a document by its ID.
- `DELETE /documents/{id}`: Delete a document by its ID.
- `POST /query/retrieve`: Retrieve relevant documents for a query.
- `POST /query/generate`: Generate an answer to a query.
- `GET /status`: Get the status of the server.

## Local Training Project

In addition to the main backend application, there is a separate, more efficient local training project located in the root directory with the name `train_model`. This project is designed for fine-tuning the models and experimenting with different training strategies in a local environment.
