# Capstone Proposal

**Course:** Building AI-Powered Applications  
**Team Name:** Promptsitutes  
**Project Title:** Rubby.AI  
**Date:** 10/17/25

---

## 1. Problem Statement

### The Problem

Many learners and developers struggle to think through problems independently when using
AI tools. To solve this, we aim to create an AI system that encourages active reasoning and
self-explanation rather than simply providing answers. Most existing systems focus on output,
not understanding, which leads to shallow learning and weak long-term retention. Before
AI-assisted coding, [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)
was a popular and effective way for programmers to find mistakes simply by explaining their
thought process out loud. We aim to revive and enhance that practice by making the “duck”
interactive so it can ask questions back, guide reasoning, and help identify obstacles or
logical gaps in real time.

Our project introduces an AI-powered, voice-enabled learning companion — a fun and
interactive “rubber duck” that uses **LLMs**, **TTS/STT**,  and the
[Socratic method](https://en.wikipedia.org/wiki/Socratic_method) to guide thought processes
without giving away answers. AI is uniquely suited for this because it can **adapt its
responses and questions to each user’s reasoning process**, creating a personalized and
dynamic learning experience that static tools cannot offer. Designed to be cute,
conversational, and cognitively engaging, it redefines how people use AI for learning —
turning it from a tool that hands out answers into one that cultivates curiosity, reflection,
and genuine understanding.

Based on informal interviews with our fellowe students, we've confirmed that a majority feel they
overuse AI for direct answers and desire a tool that guides their thinking instead. Our project revives
and enhances the "rubber duck" practice by making the “duck” interactive. Our AI companion uses the Socratic 
method to ask guiding questions, helping users identify logical gaps and build genuine understanding in real-time.

---

### Scope

- Development of a text-to-speech (TTS) and speech-to-text (STT) system with a distinct, friendly “duck” voice.

- Creation of an interactive web app or desktop companion (similar to classic XP assistants) that users can talk to in real time.

- Integration and prompt-tuning of an LLM to emulate the behavior described in the problem statement — guiding thought processes, asking reflective questions, and supporting reasoning.

### What's Out of Scope (but maybe future work)

- Building a physical version of the duck with onboard processing, microphones, and speakers.

- Developing custom LLM training from scratch beyond prompt-tuning and API integration.

- Why This Scope Makes Sense

This scope focuses on creating a functional, interactive prototype that demonstrates the project’s core idea — an AI companion that encourages thinking rather than replaces it. It’s ambitious yet achievable within a semester, while leaving room for meaningful expansion into hardware or advanced model development in the future.

---

## 2. Target Users

### Primary User Persona

User Type:
Students, self-learners, hobbyists, and developers of all ages

Demographics:

Age range: 8–60+
Technical proficiency: From basic computer users to experienced programmers

Context of use: While studying, coding, or practicing explanations on a computer, tablet, or laptop

User Needs:
Need #1: A way to clarify their own understanding by explaining ideas out loud
Why it matters: Talking through problems improves comprehension and long-term retention
Current workaround: Speaking to themselves, taking notes, or trying to explain to a friend

Need #2: A thinking companion that helps identify gaps in logic or understanding without giving answers away
Why it matters: Encourages active learning and deeper reasoning across subjects
Current workaround: Asking AI tools for direct answers, which can lead to passive learning

Need #3: A fun and engaging way to learn or solve problems
Why it matters: Keeps users motivated and makes the learning process enjoyable
Current workaround: Using static flashcards, videos, or exercises that lack interactivity

User Pain Points:
Overreliance on AI tools that provide solutions without understanding
Difficulty identifying mistakes in their own reasoning
Boredom or lack of engagement when learning alone

### Secondary Users (Optional)

Educators and tutors: Could use the companion to help students articulate reasoning during lessons

Professionals and researchers: Might use it as a reflective thinking partner during problem-solving or brainstorming

---

## 3. Success Criteria

### Product Success Metrics

**How we'll know our solution works:**

### Metric #1: Improved reasoning and understanding
- **Target:** 80% of users report clearer understanding or self-identified error discovery after interaction  
- **Measurement method:** Post-session feedback form or reflection survey  

### Metric #2: User engagement and retention
- **Target:** Average of 3+ interactions per week per active user  
- **Measurement method:** Usage analytics tracking number and duration of sessions  

### Metric #3: User satisfaction and enjoyment
- **Target:** Average satisfaction score of ≥4/5 in user surveys  
- **Measurement method:** Post-use rating prompt and optional qualitative feedback  

### Metric #4: Reduced dependency on direct-answer AI tools
- **Target:** 70% of users report relying less on direct-answer prompts (e.g., “solve this for me”)  
- **Measurement method:** Follow-up survey comparing pre- and post-use behavior  

### Metric #5: System performance and accessibility
- **Target:** TTS/STT response latency under 2 seconds, and <$0.15 per session in API costs  
- **Measurement method:** Logging response times and tracking operational costs  

### Metric #6: STT Accuracy
- **Target:** Achieve a Word Error Rate (WER) of less than 15% on our "golden set" of test audio clips.
- **Measurement method:** Running pre-recorded test cases against our STT service.

---

### Technical Success Criteria

- **Response latency:** <3 seconds (p95) for TTS/STT and LLM responses  
- **Availability:** 95% uptime during testing period  
- **Error rate:** <5% of requests fail or return unusable output  
- **Cost per user:** <$0.15 per session on average, accounting for LLM, TTS/STT, and hosting costs

### Technical Architecture

Will added as we progress on

## 4. Week 3-4 Learnings

### Learning #1: The Challenge of Real-Time Voice:
We learned that building a seamless, low-latency voice pipeline is complex. Initial tests show possible significant delays between STT, LLM, and TTS services, which we will work on to optimize.

### Learning #2: Prompt Engineering is Key:
We discovered that getting an LLM to consistently ask Socratic questions without ever giving the answer is a non-trivial prompting challenge. Problem is that our prompts may result in the AI "breaking character."

### Learning #3: TTS Voice Choice Matters:
The choice of TTS voice significantly impacts the user's perception of the "duck's" personality. We thought of several voices and are finilizing the solution for the right balance of friendly and engaging voice without being distracting.

## 6. Technical Decisions Log

|Category        |Decision                       |Justification                |Alternatives Considered|
|----------------|-------------------------------|-----------------------------|-----------------------|
|LLM             |Not finalized yet              |                             |                       | 
|STT/TTS         |OpenAI's integrated APIs       |Using a single provider simplifies API key management, billing, and reduces network overhead between services.          |Management, billing, and reduces network overhead between services.	Deepgram for STT (lower latency but more complex integration), ElevenLabs for TTS (higher quality voices but significantly higher cost).                       |
|Architecture    |WebSocket-based streaming|Essential for providing a low-latency, real-time conversational feel. A standard HTTP request/response model would feel too slow and clunky.|HTTP Long-Polling (less efficient and more complex to manage state).|

## 7. Risk Assessment

|Risk Category        |Risk Description          |Likelihood                   |Impact                 |Mitigation Strategy    |
|----------------|-------------------------------|-----------------------------|-----------------------|-----------------------|
|Technical       |High End-to-End Latency: Users may become frustrated if the duck takes too long to respond.|High |High |We will optimize our pipeline by streaming data between services instead of waiting for each step to complete. We have set a technical success metric of <3s latency.|
|Product        |The Socratic Method is Annoying: Users might just want the answer and find the constant questioning to be frustrating rather than helpful.       |Medium |High | We will refine the prompt to ensure the duck's tone is encouraging and not condescending. User testing will be critical to validate this core mechanic.|
|Cost   |	API Costs Exceed Budget: A long conversation or inefficient use of models could quickly drain our project budget.|Medium|Medium	|We will use cost-effective models, caching where possible, and will implement usage limits (e.g., max 15-minute sessions) if costs become an issue.|
|Team  |Integration Complexity: One team member is responsible for the full voice pipeline, creating a potential bottleneck.|Low|Medium|We are documenting the entire process and will conduct a knowledge-sharing session in Week 5 to ensure at least two members understand the end-to-end flow.|

## 8. Open Questions

What is the most effective way to manage conversation history to provide context without making the LLM prompt too long and expensive?

How should the system handle user silence or ambiguous phrases like "um" or "I don't know"?

What is the best UI/UX to indicate when the duck is "listening" vs. "thinking" vs. "speaking"?