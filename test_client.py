from groq_client import call_groq

response = call_groq(
    system_prompt="You are a helpful assistant. Answer in one short sentence.",
    user_input="What is an AI agent?"
)

print(response)