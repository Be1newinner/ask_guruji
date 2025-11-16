import onnxruntime as ort
from transformers import AutoTokenizer

model_path = "./output_dir/model.onnx"
tokenizer_path = "./output_dir"

# Load tokenizer from local directory
tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)

# Load ONNX model
session = ort.InferenceSession(model_path)

text = "Example input text"
inputs = tokenizer(text, return_tensors="np")

outputs = session.run(None, dict(inputs))
embeddings = outputs[0]
print(embeddings)
