from app.database import supabase

response = supabase.table("courses").select("*").limit(1).execute()

print(response)