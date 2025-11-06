# Prioritized Backlog (Version 2)

**Project Name:** Rubby the Duck
**Team Members:** [Giorgi Gogichashvili, Anri Javakhishvili, Davit Kutateladze, Nikoloz Tukhashvili]
**Last Updated:** Week 6, [11/6/2025]
**Sprint:** Week 6 of 15

---

## 📋 Backlog Overview

**Total Issues:** 60
**P1 (Must Have):** 22 issues
**P2 (Should Have):** 14 issues
**P3 (Nice to Have):** 24 issues
**Completed:** 0 issues

**Current Sprint Focus:** Laying the foundational design and engineering groundwork. This includes finalizing the core character design, defining the UI/UX, and building the initial project structure for the conversation interface.

---

## 🔴 Priority 1: Critical Path (Must Have for MVP)

These features are non-negotiable for the Week 15 demo. If we don't build these, we don't have a viable product.

### Issue #1: Design Core Character "Rubby"

**Status:** 🔵 To Do
**Assigned:** Davit
**Due:** Week 5
**Effort:** Medium (4-8 hrs)

**User Story:**
> As a user, I want to see a friendly and encouraging character so that the learning experience feels less intimidating and more like a conversation with a supportive friend.

**Why This Is P1:**
Rubby's character is the core of the app's persona and motivational engine. A strong, appealing design is essential for building an emotional connection and user trust from the very first screen.

**Acceptance Criteria:**
- [ ] Final character illustration of Rubby is created in SVG format.
- [ ] At least three emotional states are designed (e.g., neutral/listening, thinking, encouraging/smiling).
- [ ] The character design is tested for approachability and friendliness with 3-5 target users.

**Technical Requirements:**
- Illustrations must be scalable vector graphics (SVGs) for clean resizing.
- Assets must be optimized for web/mobile performance.
- Emotional state variations should be easily swappable in the UI.

**Definition of Done:**
- [ ] Final SVG assets are created and committed to the repository.
- [ ] Unit tests pass (>80% coverage) - N/A for design asset.
- [ ] Integration test validates end-to-end flow - N/A for design asset.
- [ ] Code reviewed by team member - N/A (Design reviewed by team).
- [ ] Documentation updated (Style Guide).
- [ ] Deployed to staging (Assets integrated into the UI).
- [ ] Tested on staging environment.

**Dependencies:**
- **Blocks:** Issue #2 (Onboarding Flow), Issue #7 ("Aha!" Moment Celebration)
- **Blocked By:** None

**Resources:**
- Moodboard: [Link to Figma/Miro board]
- Character Design Inspirations: [Link to Dribbble/Pinterest board]

---
**Priority:** P1 (Critical Path - Week 5)
**User Story:** As a user, I want to see a friendly character so the experience feels less intimidating.
**Acceptance Criteria:** Final SVG illustration created, 3+ emotional states designed, design is validated with users.
**Effort Estimate:** Medium (4-8 hours)
**Assigned To:** Nikoloz (Design)
**Dependencies:** Blocks: #2, #7
---

### Issue #2: Build Socratic Method Onboarding Flow

**Status:** 🔵 To Do
**Assigned:** All
**Due:** Week 6
**Effort:** Medium (6-8 hrs)

**User Story:**
> As a new user, I want a simple and clear introduction to how Rubby works so that I understand I need to think for myself and not expect direct answers.

**Why This Is P1:**
This manages user expectations, which is critical for the Socratic model. If users expect a standard Q&A chatbot, they will get frustrated. Onboarding prevents this and sets them up for success.

**Acceptance Criteria:**
- [ ] A 3-step onboarding flow is implemented upon first app open.
- [ ] Step 1 explains Rubby's role as a guide.
- [ ] Step 2 explains the Socratic method (questions, not answers).
- [ ] Step 3 prompts the user to enter their first problem to solve.
- [ ] Users can successfully complete the flow and land on the main chat screen.

**Technical Requirements:**
- Use a state management library to track if a user has completed onboarding.
- Onboarding flow should be a dismissible modal or a separate route.
- Copy provided by Product (Anri).

**Definition of Done:**
- [ ] Code written and committed.
- [ ] Unit tests for state management pass.
- [ ] Integration test validates the full flow from app open to chat screen.
- [ ] Code reviewed by a team member.
- [ ] Deployed to staging.
- [ ] Tested on staging environment.

**Dependencies:**
- **Blocked By:** Issue #1 (Needs character design for visuals)

**Resources:**
- Onboarding Copy: [Link to Google Doc]
- Wireframes: [Link to Figma file]

---
**Priority:** P1 (Critical Path - Week 6)
**User Story:** As a new user, I want a clear intro to how Rubby works so I don't expect direct answers.
**Acceptance Criteria:** 3-step flow implemented, explains Rubby's role and method, lands user on the chat screen.
**Effort Estimate:** Medium (6-8 hours)
**Assigned To:** Anri (Product), Davit (Eng)
**Dependencies:** Depends on: #1
---

### Issue #3: Implement Microphone Permissions & Voice Input

**Status:** 🔵 To Do
**Assigned:** Giorgi
**Due:** Week 8
**Effort:** Large (8+ hrs)

**User Story:**
> As a user, I want to speak my thoughts out loud so that I can have a natural, conversational learning experience.

**Why This Is P1:**
Voice is a core modality for the app's "conversational companion" feel. It lowers the barrier to entry for users to articulate complex thoughts compared to typing.

**Acceptance Criteria:**
- [ ] The app requests microphone permission at the start of the first voice-enabled session.
- [ ] A clear visual indicator shows the microphone's status (idle, listening, processing).
- [ ] User's speech is transcribed into text and displayed in the input field.
- [ ] The app handles permission denial gracefully with a message explaining how to enable it in settings.

**Technical Requirements:**
- Use the Web Speech API or a similar library for Speech-to-Text.
- The microphone status indicator must be persistent and obvious.
- Ensure all data handling is secure and transparent.

**Definition of Done:**
- [ ] Code written and committed.
- [ ] Unit tests for permission handling and API calls pass.
- [ ] Integration test validates the flow from tapping the mic button to sending a transcribed message.
- [ ] Code reviewed by a team member.
- [ ] Deployed to staging.
- [ ] Tested on Chrome, Safari, and Firefox on staging.

**Dependencies:**
- **Blocked By:** Issue #9 (Core Chat Interface)

**Resources:**
- Web Speech API Docs: [Link to MDN]
- UI Mockups for Mic Status: [Link to Figma]

---
**Priority:** P1 (Critical Path - Week 8)
**User Story:** As a user, I want to speak my thoughts out loud for a natural learning experience.
**Acceptance Criteria:** Mic permission is requested, visual status indicator is present, speech is transcribed, permission denial is handled gracefully.
**Effort Estimate:** Large (8+ hours)
**Assigned To:** Davit (Eng)
**Dependencies:** Depends on: #9
---

### Issue #4: Ensure Full Screen Reader Compatibility

**Status:** 🔵 To Do
**Assigned:** Nikoloz, Davit
**Due:** Week 10
**Effort:** Large (8+ hrs)

**User Story:**
> As a visually impaired user, I want the app to be fully compatible with my screen reader so that I can navigate, listen to questions, and input my answers effectively.

**Why This Is P1:**
Accessibility is a core pillar. A learning tool must be available to all learners. This is a non-negotiable for an ethical and inclusive product.

**Acceptance Criteria:**
- [ ] All interactive elements (buttons, inputs) are properly labeled with ARIA attributes.
- [ ] Rubby's incoming messages are automatically announced by the screen reader.
- [ ] The user can navigate the entire application using only keyboard and screen reader commands.
- [ ] Tested and validated with VoiceOver (macOS/iOS) and TalkBack (Android).

**Technical Requirements:**
- Use semantic HTML5 elements wherever possible.
- Implement ARIA live regions for dynamic content like incoming messages.
- Follow WCAG 2.1 AA guidelines.

**Definition of Done:**
- [ ] Code written and committed.
- [ ] Manual testing checklist for screen readers completed and passed.
- [ ] Automated accessibility audit (e.g., Lighthouse) score is >95.
- [ ] Code reviewed by a team member.
- [ ] Deployed to staging.
- [ ] Validated on staging by at least one other team member using a screen reader.

**Dependencies:**
- **Blocked By:** All major UI features (e.g., #2, #9) must be mostly complete.

**Resources:**
- WAI-ARIA Authoring Practices: [Link to W3C]
- MDN Accessibility Guide: [Link to MDN]

---
**Priority:** P1 (Critical Path - Week 10)
**User Story:** As a visually impaired user, I want screen reader compatibility to use the app effectively.
**Acceptance Criteria:** All elements are ARIA-labeled, new messages are announced, app is fully keyboard-navigable, validated with VoiceOver/TalkBack.
**Effort Estimate:** Large (8+ hours)
**Assigned To:** Giorgi, Davit
**Dependencies:** Depends on: #2, #9
---

## 🟡 Priority 2: Enhanced Features (Should Have)

Features we'll build if time permits, in priority order. If we finish P1 early, we start on these.

### Issue #7: Build Session End & Summary Screen

**Status:** 🔵 To Do
**Assigned:** Nikoloz, Anri
**Due:** Week 14
**Effort:** Medium (6-8 hrs)

**User Story:**
> As a user, I want to be able to end my session and see a summary of my key insights so that I can review what I learned and feel a sense of accomplishment.

**Why This Is P2:**
This feature provides closure to the learning loop and reinforces the value of the session. It's a strong retention mechanic but not strictly required for the core conversation to work.

**Acceptance Criteria:**
- [ ] A button to "End Session" is available in the chat interface.
- [ ] Clicking the button takes the user to a summary screen.
- [ ] The summary screen displays any messages the user has marked as a "key insight".
- [ ] A button to "Start a New Session" is present on the summary screen.

**Technical Requirements:**
- State management must track "key insight" flags.
- A new route and component for the summary screen.

**Definition of Done:**
- [ ] Code written and committed.
- [ ] Unit tests for state changes pass.
- [ ] Integration test validates the flow from clicking "End Session" to viewing the summary.
- [ ] Code reviewed by a team member.
- [ ] Deployed to staging.
- [ ] Tested on staging.

**Dependencies:**
- **Blocked By:** Issue #10 (Highlight Key Insights)

**Resources:**
- Wireframes for Summary Screen: [Link to Figma]

---
**Priority:** P2 (Should Have - Week 14)
**User Story:** As a user, I want to end my session and see a summary of key insights to review what I learned.
**Acceptance Criteria:** "End Session" button exists, leads to summary screen, summary shows starred insights, "New Session" button is present.
**Effort Estimate:** Medium (6-8 hours)
**Assigned To:** Nikoloz, Davit
**Dependencies:** Depends on: #10
---

## 🟢 Priority 3: Nice-to-Have (Could Have)

Features deferred to post-course or only if we're significantly ahead of schedule.

- **Issue #15: Save & Revisit Conversations:** Allows users to access their full chat history. Deferred because it requires significant backend/database work not needed for a live demo.
- **Issue #16: Subtle Encouraging Animations:** Adds small animations to Rubby's character. Deferred as it's a "polish" feature, not core functionality.
- **Issue #17: "Daily Encouragement" Feature:** A push notification system. Deferred because notifications add complexity and are not essential to the in-app experience.

---

## ⏸️ Backlog (Not Prioritized Yet)

Features and ideas that need more discussion before prioritizing.

- [ ] **Memory & Callback System:** Have Rubby remember key facts from previous conversations.
- [ ] **Personalized Questioning:** Adapt the AI's Socratic style based on user success rate.
- [ ] **Group Learning Sessions:** A mode where Rubby can moderate a discussion between multiple users.

---

## 🚫 Rejected / Cut Features

Features we decided not to build for the MVP, with rationale.

- **Customizable Accessories:** Cut because it's a purely cosmetic feature with a high art/dev cost for low impact on the core learning loop.
- **Adjustable Questioning Styles:** Cut because it adds complexity to the user interface before we have validated the default style.
- **Single-Switch Mode:** Cut because it is a highly specialized accessibility feature that requires more time and expertise than available for the MVP.

---

## 📅 Sprint Timeline

### Week 4 (Current)
- [ ] Issue #1: Design Core Character "Rubby" (Nikoloz)
- [ ] Setup Project Scaffolding & CI/CD (Davit)
- [ ] Define Core UI Components in Figma (Giorgi)

### Week 5
- [ ] Issue #9: Build Core Chat Interface (Davit)
- [ ] Issue #11: Write Supportive Onboarding Copy (Anri)
- [ ] Issue #12: Develop Warm & Friendly UI Palette (Nikoloz)

### Week 6
- [ ] Issue #2: Build Socratic Method Onboarding Flow (Davit)
- [ ] Issue #13: Create Non-Judgmental In-App Copy (Anri)

### Week 7: User Testing Round 1
- [ ] Test Onboarding and Visual Design
- [ ] Gather initial feedback on the concept

### Week 8
- [ ] Issue #3: Implement Microphone Permissions & Voice Input (Giorgi)
- [ ] Issue #14: Implement Text-to-Speech for Rubby's Voice (Davit)

### Week 9: Midterm Buffer
- [ ] Bug fixes and documentation catch-up

### Week 10
- [ ] Issue #4: Ensure Full Screen Reader Compatibility (Giorgi, Davit)
- [ ] Issue #10: Implement "Highlight Key Insight" feature (Davit)

### Week 11: Safety Audit
- [ ] Issue #18: Implement Content Moderation Filters (Davit)
- [ ] Issue #19: Implement Clear Privacy Onboarding (Anri, Davit)

### Week 12
- [ ] Issue #20: Implement "I'm Stuck" Mechanism (All)
- [ ] Polish and bug fixes from user testing feedback

### Week 13
- [ ] Issue #7: Build Session End & Summary Screen (All)
- [ ] End-to-end integration testing

### Week 14: User Testing Round 2
- [ ] Final validation of the full MVP loop
- [ ] Identify critical bugs for the demo

### Week 15
- [ ] Final polish
- [ ] Demo preparation, presentation, and video recording