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
