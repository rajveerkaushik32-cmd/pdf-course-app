from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import traceback

from app.ai_service import generate_course
from app.pdf_service import extract_text_from_pdf

app = FastAPI(
    title="PDF Course AI Backend",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "PDF Course AI Backend Running 🚀"}

@app.post("/generate-course")
async def generate_course_api(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()

        print("Step 1: Reading PDF...")

        extracted_text = extract_text_from_pdf(pdf_bytes)

        print("Step 2: PDF extracted successfully")
        print(extracted_text[:300])

        course = generate_course(extracted_text)

        print("Step 3: AI generation successful")

        return course

    except Exception as e:
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "type": type(e).__name__,
            },
        )