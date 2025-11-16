import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from huggingface_hub import hf_hub_download


class GemmaEmbedder:
    """
    A class to generate embeddings using a Gemma model in ONNX format.
    """

    def __init__(self, model_repo="be1newinner/embeddinggemma-300m-onnx"):
        """
        Initializes the GemmaEmbedder by loading the tokenizer and ONNX model.

        Args:
            model_repo (str): The repository ID of the ONNX model on Hugging Face Hub.
        """
        # Load the tokenizer from the Hugging Face Hub
        self.tokenizer = AutoTokenizer.from_pretrained(model_repo)

        # Download and load the ONNX model
        onnx_model_path = hf_hub_download(repo_id=model_repo, filename="model.onnx")
        self.session = ort.InferenceSession(onnx_model_path)

    def generate(self, text: str):
        """
        Generates a fixed-size embedding for the input text.

        Args:
            text (str): The input text to embed.

        Returns:
            np.ndarray: The generated embedding as a NumPy array.
        """
        # Tokenize the input text, padding and truncating to a consistent length
        inputs = self.tokenizer(
            text, return_tensors="np", padding=True, truncation=True
        )

        # Run the ONNX model to get the last hidden states
        outputs = self.session.run(None, dict(inputs))

        # Perform mean pooling to get a fixed-size embedding
        last_hidden_states = outputs[0]
        input_mask_expanded = np.expand_dims(inputs["attention_mask"], -1).astype(float)
        sum_embeddings = np.sum(last_hidden_states * input_mask_expanded, 1)
        sum_mask = np.clip(input_mask_expanded.sum(1), a_min=1e-9, a_max=None)

        pooled_embeddings = sum_embeddings / sum_mask
        return pooled_embeddings


# Create a global instance of the embedder to avoid reloading the model
embedder = GemmaEmbedder()


def generate(text: str):
    """
    A convenience function to generate embeddings using the global embedder instance.

    Args:
        text (str): The input text to embed.

    Returns:
        np.ndarray: The generated embedding.
    """
    return embedder.generate(text)


if __name__ == "__main__":
    # Example usage of the generate function
    embeddings = generate("Example input text")
    print(embeddings)
    print(f"Embedding shape: {embeddings.shape}")
