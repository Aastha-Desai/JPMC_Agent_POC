import os
from dotenv import load_dotenv
from groq import Groq


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY. Check your .env file.")

client = Groq(api_key=GROQ_API_KEY)


def load_prompt(prompt_path: str) -> str:
    with open(prompt_path, "r", encoding="utf-8") as file:
        return file.read()


def call_groq(system_prompt: str, user_input: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content