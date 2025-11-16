---
tags:
- embedding
- onnx
- gemma
- semantic-search
- sentence-similarity
language:
- en
license: mit
---

# embeddinggemma-300m-onnx

## Model Overview

**embeddinggemma-300m-onnx** is an efficient ONNX-exported version of Google's Gemma embedding model consisting of approximately 300 million parameters.  
It generates high-quality semantic embeddings for text, suitable for a wide variety of NLP tasks including sentence similarity, text clustering, classification, and retrieval.

Converting the original Gemma embedding model to ONNX allows hardware-agnostic, optimized inference across CPUs and GPUs using ONNX Runtime.

## Original Model Reference

This model is based on the Google Gemma embedding architecture known for its efficiency and multilingual capabilities.  
Refer to the original Hugging Face repository and documentation here:  
[google/embeddinggemma-300m](https://huggingface.co/google/embeddinggemma-300m)  
Please cite the original papers when using this model in research or production.

## Intended Use Cases

- Semantic similarity scoring  
- Embedding generation for search and recommendation systems  
- Text classification and clustering  
- Scalable, low-latency inference setups requiring ONNX-compatible models

## Repository Files

| Filename                 | Description                             |
|--------------------------|---------------------------------------|
| `model.onnx`             | ONNX model file containing network weights and graph |
| `config.json`            | Model configuration file used by transformers |
| `tokenizer.json`         | Tokenizer vocabulary and merges       |
| `tokenizer_config.json`  | Tokenizer config                       |
| `special_tokens_map.json`| Map of special tokens used during tokenization |

## Installation

```
pip install onnxruntime transformers huggingface_hub
```

## Usage

### 1. Using the model locally after cloning or downloading files

```
import onnxruntime as ort
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained(".")
session = ort.InferenceSession("./model.onnx")

text = "Example input text"
inputs = tokenizer(text, return_tensors="np")
outputs = session.run(None, dict(inputs))
embeddings = outputs
print(embeddings)
```

### 2. Using the model directly from Hugging Face Hub (no manual download)

```
from huggingface_hub import hf_hub_download
import onnxruntime as ort
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("be1newinner/embeddinggemma-300m-onnx")
onnx_model_path = hf_hub_download(
    repo_id="be1newinner/embeddinggemma-300m-onnx",
    filename="model.onnx"
)
session = ort.InferenceSession(onnx_model_path)

text = "Example input text"
inputs = tokenizer(text, return_tensors="np")
outputs = session.run(None, dict(inputs))
embeddings = outputs
print(embeddings)
```

## Citation

If you use this model in your work, please cite:  
- The original Google Gemma embedding model papers (links on original repo).  
- This repository and Hugging Face hosting if applicable.

---

Feel free to contribute improvements or report issues via this repository’s GitHub page.

---

*Last updated: November 2025*  
*Maintainer: be1newinner*
