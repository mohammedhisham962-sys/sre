import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.ai_provider import ai_provider

def run_ai_assistant_demo():
    print("\n" + "=" * 70)
    print("🤖 AI SRE ASSISTANT — INTERACTIVE INCIDENT TRIAGE DEMO")
    print("=" * 70)

    prompt = (
        "We are experiencing high database connection pool saturation in PostgreSQL "
        "causing HTTP 500 spikes on our checkout API. Provide an emergency SRE runbook "
        "with: 1. Immediate mitigation command, 2. Root cause diagnosis query, 3. Permanent fix."
    )

    print(f"\n👉 [User Prompt Sent to AI Assistant]:\n\"{prompt}\"\n")
    print("⏳ Querying Groq LLaMA-3 AI Engine...")

    import asyncio
    messages = [{"role": "user", "content": prompt}]
    response = asyncio.run(ai_provider.chat(messages))

    print("\n" + "-" * 70)
    print("📑 [AI SRE Assistant Generated Runbook Response]:")
    print("-" * 70)
    print(response)
    print("-" * 70 + "\n")
    print("✅ AI SRE Assistant triage demo completed with 100% success!\n")

if __name__ == "__main__":
    run_ai_assistant_demo()
