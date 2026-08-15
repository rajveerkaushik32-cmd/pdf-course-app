from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def save_course(course_data, user_id, pdf_filename, raw_text):
    response = supabase.table("courses").insert({
        "user_id": user_id,
        "title": course_data["title"],
        "description": course_data["description"],
        "estimated_time": course_data["estimated_time"],
        "learning_objectives": course_data["learning_objectives"],
        "prerequisites": course_data["prerequisites"],
        "difficulty_level": course_data["difficulty"],
        "pdf_filename": pdf_filename,
        "raw_text": raw_text,
        "status": "completed"
    }).execute()

    return response.data[0]