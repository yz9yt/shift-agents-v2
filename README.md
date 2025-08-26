# Shift Agents v2

## Overview
Shift Agents v2 is a powerful micro-agent framework for Caido users, designed to streamline web traffic analysis and security testing. This version introduces a robust architecture focused on advanced model orchestration, cost control, and enhanced user experience. It allows for the creation of personalized, AI-powered agents to perform complex tasks such as exploiting vulnerabilities and bypassing security measures.

## Key Features
*   **Model Orchestrator**: The agent can dynamically select the most suitable AI model for each task, balancing performance, reliability, and cost.
*   **Request Controller**: Safeguards against unexpected API costs with features like request throttling and a "circuit breaker" to stop runaway agents.
*   **Auto Mode**: A new autonomous mode that enables the agent to perform a complete end-to-end security assessment without constant user intervention.
*   **Extended Toolset**: The agent's capabilities have been expanded with new tools for better context-aware testing.
*   **Improved User Interface**: The plugin UI now includes dedicated tabs for settings, documentation, and error logging for a better user experience.

## Architectural Changes
### Model Orchestrator
The model orchestration system replaces the single model selection with a dynamic, multi-model approach. This allows the agent to switch between models based on the task, optimizing for cost or performance.

**Orchestration Modes**: The user can choose from three distinct modes in the General Settings:

*   **Automatic**: The agent intelligently selects the most capable and recommended model for each task.
*   **Economy**: The agent prioritizes cost-effective models (e.g., "mini", "lite", or "free" models).
*   **Manual**: The user defines a specific sequence of up to five models for the agent to cycle through.

### Request Controller
This new component prevents unwanted API costs and infinite loops.

*   **Throttling**: A configurable delay is added between API calls to prevent a rapid burst of requests.
*   **Circuit Breaker**: The agent will automatically stop after a specified number of consecutive API errors, preventing it from wasting tokens on a non-functional connection.

### Enhanced Toolset
The agent's tool library has been extended to include more powerful, context-aware tools:

*   `revertRequest`: Allows the agent to undo the last modification to an HTTP request.
*   `getHttpHistory`: Enables the agent to query the Caido project's HTTP history for valuable context.

## User Interface
The plugin's user interface has been significantly improved for better organization and usability.

### Multi-Tab Layout
The main settings page now features a tabbed interface with dedicated sections for:

*   **General Settings**: Configure API keys, orchestration modes, and safety controls.
*   **Custom Prompts**: Manage a library of custom prompts, including new import and export functionality.
*   **Documentation**: A comprehensive guide explaining all of the agent's features, modes, and tools.
*   **Error Log**: A dedicated log for tracking and debugging agent errors.

### Redesigned Chat Input
The chat area has been optimized for responsiveness and usability, with the text input field being resizable and controls more logically placed.

## Installation
1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Build the plugin:** Execute the build command from the project root. This command specifically targets the frontend package to build the plugin efficiently.
    ```bash
    pnpm --filter frontend build
    ```

3.  **Install in Caido:**
    Upload the `dist/plugin_package.zip` file in Caido by clicking on the "Install Package" button in the plugins section of the application.
=======
# 🚀 Shift Agents v2  

## 📖 Overview  
**Shift Agents v2** is a powerful **micro-agent framework** for **Caido** users, designed to streamline web traffic analysis and security testing.  
This version introduces a robust architecture focused on **advanced model orchestration, cost control, and enhanced user experience**.  

With Shift Agents v2 you can create **personalized, AI-powered agents** capable of:  
- Exploiting vulnerabilities  
- Bypassing security measures  
- Running autonomous security assessments  

---

## ✨ Key Features  

- **🧠 Model Orchestrator**  
  Dynamically selects the most suitable AI model for each task, balancing **performance, reliability, and cost**.  

- **🛡️ Request Controller**  
  Protects against unexpected API costs with **throttling** and a **circuit breaker** to stop runaway agents.  

- **🤖 Auto Mode**  
  Enables **end-to-end autonomous assessments** without constant user intervention.  

- **🛠️ Extended Toolset**  
  New **context-aware testing tools** for improved flexibility.  

- **🎨 Improved User Interface**  
  Modernized UI with **tabs for settings, documentation, and error logging**.  

---

## 🏗️ Architectural Changes  

### 🔹 Model Orchestrator  
Replaces single-model selection with a **multi-model approach**.  

**Orchestration Modes:**  
- **Automatic** → Agent picks the best model for each task.  
- **Economy** → Prioritizes cost-efficient models (e.g., *mini, lite, free*).  
- **Manual** → User defines a sequence of up to **5 models**.  

---

### 🔹 Request Controller  
Prevents unwanted API costs and infinite loops.  
- **Throttling** → Adds a configurable delay between API calls.  
- **Circuit Breaker** → Stops after *N consecutive errors* to avoid token waste.  

---

### 🔹 Enhanced Toolset  
New tools for **better context-aware testing**:  
- \`revertRequest\` → Undo the last HTTP request modification.  
- \`getHttpHistory\` → Query Caido's HTTP history for context.  

---

### 🔹 User Interface Improvements  
A redesigned **multi-tab layout** for usability:  
- **General Settings** → API keys, orchestration modes, safety controls.  
- **Custom Prompts** → Manage, import, and export custom prompts.  
- **Documentation** → Built-in usage guide.  
- **Error Log** → Debugging and error tracking.  

**Redesigned Chat Input:**  
- Resizable text input  
- Better control placement  

---

## ⚙️ Installation  

### 1️⃣ Install dependencies  
```bash
pnpm install
```

### 2️⃣ Build the plugin  
Execute the build from the project root (targets **frontend package**).  
```bash
pnpm build
```

### 3️⃣ Install in Caido  
Upload the \`dist/plugin_package.zip\` in **Caido** via:  
👉 *Plugins section → Install Package → Select ZIP file*  

---

✅ **Shift Agents v2 brings automation, control, and flexibility to Caido like never before.**

