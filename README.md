# AI Press Release Workflow Prototype

## Overview
This project is a POC that demonstrates an AI-Powered press release authoring and publishing workflow.
The prototype simulates how Agents, MCP Servers, and AEM could work together to automate the creation and publishing of press release.
Since this is a prototype, the MCP servers currently act as **stubs** that stimulate interactions with AEM by creating default and published HTML pages locally.

---

# Features
- Upload a Word (.docx) document containing press release content
- Optional prompt to provide additional authroing instructions
- AI Intake/Orchestrator Agent
    - Determines workflow intent
    - Validates request
    - Routes requested to Author or Publish workflow
- AI Author Agent
    - Uses Groq LLM
    - Generates professional press release content
    - Populates a predefined JPMC style HTML template
- MCP Author Server (Stub)
    - Simulates creating an AEM draft page
    - Stores workflow request information
- Approval Workflow
    - Requestor Review
    - Peer Review
    - Manage Review
- AI Publish Agent
    - Validates readiness for publishing
- MCP Publish Server (Stub)
    - Simulates publishing to AEM
    - Creates a published HTML page
- Workflow Reporting Dashboard
    - Tracks request status
    - Tracks approval stage
    - Displays overall workflow statistics

---

# Project Structure

```
app.py

agents/
    agent1_router.py
    agent2_author.py
    agent3_publish.py

mcp/
    author_server.py
    publish_server.py
    request_store.py

prompts/
    agent1_intake_prompt.txt
    agent2_author_prompt.txt
    agent3_publish_prompt.txt

templates/
    index.html
    press_release.html

static/
    style.css

output/
    draft/
    published/
    request_store.json

uploads/

groq_client.py
```
---

# Requirement 

Python 3.11+

Required packages:

```
Flask
python-docx
groq
python-dotenv
```

Install:
```bash
pip install flask python-docx groq python-dotenv
```

---

# Enviroment Variables
Create a `.env` file.

Example:
```text
GROQ_API_KEY = your_groq_api_key_here
```

---

# Running the Prototype
From the project root:
```bash
python3 app.py
```

Open:
```
http://127.0.0.1:5000
```
---

# Workflow
## Step 1

Upload a Word document containing press release content.

(Optional)
Provide additional authoring instructions.

Click
```
Generate Draft
```

___

## Step 2
The workflow executes:

```
User
↓
AI Intake Agent
↓
AI Author Agent
↓
MCP Author Server
↓
Draft HTML Generated
```
A preview link will be available after the draft is generated.
---

## Step 3
Approve the workflow

``` 
Requester Approve
↓
Peer Approve
↓
Manager Approve
```

The workflow status updates after each approval.
---

## Stage 4
Once the request reaches:
```
READY_FOR_PUBLISH
```

The publish button becomes available.

Click:
```
Publish Current Draft
```
Workflow:

```
AI Publish Agent
↓
MCP Publish Server
↓
Published HTML Created
```

---

# Workflow Report
The Workflow Report displays:
- Total Requests
- Draft Created
- Requester Review
- Peer Review
- Manager Review
- Published

This simulates monitoring multiple requests moving through the workflow.

---

# MCP Server Stubs
This prototype does **not** connect to AEM.
Instead:
Author MCP Server
    - Simulates AEM Authoring
    - Creates local draft HTML pages
    - Records workflow metadata

Publish MCP Server
    - Simulates AEM Publishing
    - Copies approved drafts to the published folder
    - Updates workflow status

These stubs are intended to be replaces by real AEM MCP implementations.
---

# AI Models
The prototype uses Groq-hosted LLMs for:
- Intent detection
- Content generation
- Publish validation
---
