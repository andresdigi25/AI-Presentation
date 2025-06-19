from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
import logging
import json
import base64
from typing import Optional
from ollama import chat

app = FastAPI()

# Setup Logging
logger = logging.getLogger(__name__)
logging.basicConfig(filename="response.log", level=logging.INFO)

class QABaseSchema(BaseModel):
    question: str
    answer: str

class QAAnalyticsSchema(QABaseSchema):
    thoughts: str
    topic: str

def log_response(response_data: QAAnalyticsSchema):
    logger.info(f"Question = {response_data.question}")
    logger.info(f"Answer = {response_data.answer}")
    logger.info(f"Thoughts = {response_data.thoughts}")
    logger.info(f"Topic = {response_data.topic}")

def ollama_llm_response(question: str, encoded_image: str):
    qa_analytics_json_schema = {
        "type": "object",
        "properties": {
            "question": {"type": "string"},
            "answer": {"type": "string"},
            "thoughts": {"type": "string"},
            "topic": {"type": "string"}
        },
        "required": ["question", "answer", "thoughts", "topic"]
    }
    return chat(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Answer this question: {question}", "images": [encoded_image]},
        ],
        model="gemma3:latest",
        format=qa_analytics_json_schema, 
    )

@app.post("/api/question", response_model=QABaseSchema)
async def api_question(question: str = Form(...), file: UploadFile = File(...)):
    try:
        # Read and encode the image file
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read and encode image: {str(e)}")

    # Call the LLM response method
    response = ollama_llm_response(question, encoded_image)

    # Retrieve the content from the response
    response_content = response.get("message", {}).get("content", {})

    # If response_content is a string, attempt to parse it as JSON.
    if isinstance(response_content, str):
        try:
            response_content = json.loads(response_content)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse LLM response as JSON: {str(e)}")

    # Load the response using the analytics schema
    try:
        qa_instance = QAAnalyticsSchema(**response_content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    log_response(qa_instance)

    return QABaseSchema(question=qa_instance.question, answer=qa_instance.answer)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888, log_level="info")