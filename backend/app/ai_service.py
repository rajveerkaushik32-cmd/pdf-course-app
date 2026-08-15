import json
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_course(text: str):
    prompt = f"""
You are an expert educational course creator.

IMPORTANT:
Return ONLY valid JSON.
Do NOT use markdown.
Do NOT wrap the response inside ```json.
Do NOT add explanations.
Do NOT generate HTML.
Return plain text only.

Return this EXACT JSON structure:

{{
  "title": "",
  "description": "",
  "difficulty": "",
  "estimated_time": "",
  "learning_objectives": [],
  "prerequisites": [],
  "chapters": [
    {{
      "title": "",
      "lessons": [
        {{
          "title": "",
          "content": "",
          "key_takeaways": []
        }}
      ],
      "quiz": [
        {{
          "question": "",
          "question_type": "mcq",
          "options": [],
          "correct_answer": "",
          "explanation": ""
        }}
      ]
    }}
  ]
}}

RULES

Course:
- Create EXACTLY 4 chapters.
- Each chapter must contain EXACTLY 3 lessons.
- Lesson content must be plain text only.
- Lesson content should be about 150-200 words.
- Every lesson must include:
  - title
  - content
  - key_takeaways
- key_takeaways must contain 3-5 short bullet points.

Quiz:
- Every chapter must contain EXACTLY 3 questions.
- Mix MCQ and True/False.

MCQ:
- question_type = "mcq"
- Exactly 4 options.

True/False:
- question_type = "true_false"
- options = ["True","False"]

Each question must contain:
- question
- question_type
- options
- correct_answer
- explanation

Generate the course ONLY from the PDF.

Return ONLY valid JSON.

PDF Content:

{text[:6000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.3,
        max_completion_tokens=6000,
    )

    content = response.choices[0].message.content.strip()

    # Remove markdown if returned
    if content.startswith("```json"):
        content = content.replace("```json", "", 1)

    if content.startswith("```"):
        content = content.replace("```", "", 1)

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        return json.loads(content)

    except json.JSONDecodeError:
        print("========== INVALID JSON ==========")
        print(content)
        print("==================================")
        raise