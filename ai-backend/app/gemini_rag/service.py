"""
Gemini RAG Service

Provides document upload and question-answering functionality
using Google's Gemini API for RAG operations.
"""

import os
import tempfile
from typing import List, Optional
from google import genai
from google.genai import types


# Singleton instance
_gemini_service_instance: Optional["GeminiService"] = None


def get_gemini_service() -> "GeminiService":
    """
    Get the singleton GeminiService instance.

    Returns:
        GeminiService: Shared singleton instance
    """
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance


class GeminiService:
    """
    Service for interacting with Google Gemini API for RAG functionality.
    """

    def __init__(self):
        """
        Initialize the Gemini service.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set.")

        # Initialize the client
        self.client = genai.Client(api_key=api_key)

        # Get model name from environment variable, fallback to gemini-1.5-flash
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        self.uploaded_files: List = []

    async def upload_document(
        self,
        file_content: bytes,
        mime_type: str = "application/pdf"
    ) -> dict:
        """
        Upload a document to Gemini for RAG context.
        """
        temp_file_path = None
        try:
            # Create a temp file to store the upload
            suffix = self._get_suffix(mime_type)
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            # FIX: Use keyword argument 'file=' and pass 'config' for mime_type
            uploaded_file = self.client.files.upload(
                file=temp_file_path,
                config=types.UploadFileConfig(
                    mime_type=mime_type,
                    display_name="Uploaded Document"
                )
            )

            # Store reference
            self.uploaded_files.append(uploaded_file)

            # Clean up local temp file
            os.unlink(temp_file_path)

            return {
                "filename": uploaded_file.name,
                "uri": uploaded_file.uri
            }

        except Exception as e:
            # Clean up if validation failed
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            raise Exception(f"Failed to upload document: {str(e)}")

    async def ask_question(self, query: str) -> str:
        """
        Ask a question using the uploaded documents as context.
        """
        if not self.uploaded_files:
            raise Exception(
                "No documents uploaded. Please upload a document first.")

        try:
            # Gemini 1.0+ SDK syntax: passing files directly in contents
            # We explicitly tell it to use the file URIs we just got

            # Create content list starting with the user query
            # (In some SDK versions, files go into 'contents' alongside text)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[query] + self.uploaded_files
            )

            return response.text

        except Exception as e:
            raise Exception(f"Failed to generate response: {str(e)}")

    def _get_suffix(self, mime_type: str) -> str:
        mime_to_suffix = {
            "application/pdf": ".pdf",
            "text/plain": ".txt",
            "text/html": ".html",
            "application/json": ".json",
            "text/markdown": ".md",
            "text/csv": ".csv",
        }
        return mime_to_suffix.get(mime_type, ".bin")

    def clear_documents(self):
        self.uploaded_files = []
