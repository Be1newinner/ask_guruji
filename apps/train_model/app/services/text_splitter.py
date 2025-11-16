import re
import unicodedata
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List


def clean_ocr_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = "".join(char for char in text if char.isprintable())
    text = re.sub(r"[|*^<>\\()\"”“ª°]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


class CleanOCRTextSplitter(RecursiveCharacterTextSplitter):
    def split_text(self, text: str) -> List[str]:
        cleaned_text = clean_ocr_text(text)
        return super().split_text(cleaned_text)
