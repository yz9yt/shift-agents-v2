// modified by Albert.C Date 2025-08-22 Version 0.05
<script setup lang="ts"></script>

<template>
  <div class="flex flex-col h-full gap-4 p-4 prose prose-compact dark:prose-invert">
    <h2>Shift Agents v2 - Documentation</h2>
    <p>
      Shift Agents is a powerful, AI-powered tool designed to streamline security testing and web traffic analysis directly within the Caido platform. It provides a conversational interface for interacting with a highly-skilled AI hacker agent that can automate complex tasks and assist in finding vulnerabilities.
    </p>

    <h3>Table of Contents</h3>
    <ul>
      <li><a href="#orchestration-modes">Orchestration Modes: How the Agent Selects Its Models</a></li>
      <li><a href="#general-settings">General Settings</a></li>
      <li><a href="#agent-capabilities">Agent Capabilities (Tools)</a></li>
      <li><a href="#custom-prompts">Custom Prompts</a></li>
      <li><a href="#auto-mode">Auto Mode</a></li>
    </ul>

    <h3 id="orchestration-modes">Orchestration Modes: How the Agent Selects Its Models</h3>
    <p>
      The agent's intelligence is powered by various large language models (LLMs) from different providers via OpenRouter. To manage performance and cost, the agent uses an orchestration system with three distinct modes, which you can set in the General Settings.
    </p>
    <ul>
      <li>
        <strong>Automatic Mode:</strong>
        <p>
          In this mode, the agent intelligently selects the most capable and recommended model for each phase of its analysis. This provides the best balance between performance and reliability, as the agent is free to use powerful models for complex reasoning (e.g., plan generation) and faster, more specialized models for execution. You don't need to configure anything; the agent's internal logic handles the selection.
        </p>
      </li>
      <li>
        <strong>Economy Mode:</strong>
        <p>
          This mode is designed to minimize your API costs. The agent is instructed to prioritize using the most economical models available (e.g., "mini," "lite," or "free" models). While this may result in slightly slower or less detailed responses for highly complex tasks, it's perfect for routine, low-stakes analysis where budget is a primary concern.
        </p>
      </li>
      <li>
        <strong>Manual Mode:</strong>
        <p>
          For advanced users who want fine-grained control, this mode lets you define a specific sequence of up to 5 models. The agent will cycle through this sequence for each step of its reasoning and tool execution. This is useful for testing specific model behaviors or for fine-tuning the agent's process to your exact needs. This is why you might have seen a model other than your selected one; in Automatic mode, the agent prioritizes its own logic over the UI's displayed model.
        </p>
      </li>
    </ul>

    <h3 id="general-settings">General Settings</h3>
    <p>
      This section allows you to fine-tune the core behavior of your agent.
    </p>
    <ul>
      <li><strong>API Key:</strong> Your OpenRouter API key is essential for the agent to access the models. You can validate the key directly from here to ensure it's active.</li>
      <li><strong>Request Controller:</strong> These settings act as safeguards to protect you from unexpected API costs and agent loops.
        <ul>
          <li><strong>Throttle Delay:</strong> A delay (in milliseconds) is added between each API call to prevent a rapid, uncontrolled burst of requests. This is a crucial defense against unexpected costs.</li>
          <li><strong>Max Consecutive Failures:</strong> The agent will automatically stop after this number of consecutive API errors. This "circuit breaker" prevents it from wasting tokens if there's a connection issue or an invalid key.</li>
        </ul>
      </li>
      <li><strong>Reasoning:</strong>
        <ul>
          <li><strong>Enable Reasoning:</strong> When enabled, the agent will generate internal thoughts and a detailed plan before executing its actions. This significantly improves accuracy and is crucial for complex tasks and is highly recommended.</li>
          <li><strong>Max Reasoning Tokens:</strong> A limit on the number of tokens the agent can use for its internal thought process. This helps control costs without sacrificing the core functionality.</li>
        </ul>
      </li>
      <li><strong>Max Iterations:</strong> A hard limit on the total number of steps the agent can take, acting as a final fail-safe against indefinite loops.</li>
    </ul>

    <h3 id="agent-capabilities">Agent Capabilities (Tools)</h3>
    <p>
      The agent's power comes from its ability to use specialized tools to interact with Caido. These tools are the agent's hands and eyes, allowing it to modify requests, analyze responses, and report findings.
    </p>
    <ul>
      <li><strong>Request Modification:</strong> A suite of tools to precisely manipulate HTTP requests: <code>setRequestMethod</code>, <code>setRequestPath</code>, <code>setRequestHeader</code>, <code>setRequestBody</code>, and others. The agent can also <code>revertRequest</code> to undo its last change.</li>
      <li><strong>Traffic Analysis:</strong>
        <ul>
          <li><strong><code>sendRequest</code>:</strong> Submits the current request and fetches the raw response from the server.</li>
          <li><strong><code>grepResponse</code>:</strong> A powerful tool to search for specific text or patterns within a server's response.</li>
          <li><strong><code>getHttpHistory</code>:</strong> Allows the agent to query the entire project's HTTP history, providing crucial context for tasks like session hijacking or discovering related endpoints.</li>
        </ul>
      </li>
      <li><strong>Reporting:</strong>
        <ul>
          <li><strong><code>addFinding</code>:</strong> Creates a new finding in your Caido project, complete with a title and a detailed Markdown description. The agent will use this tool when it has successfully verified a vulnerability.</li>
        </ul>
      </li>
      <li><strong>Todo Management:</strong> <code>addTodo</code> and <code>updateTodo</code> allow the agent to break down complex tasks into manageable steps, which are visible to you in the UI.</li>
    </ul>

    <h3 id="custom-prompts">Custom Prompts</h3>
    <p>
      You can define and manage your own custom prompts to give the agent specific instructions or knowledge for specialized tasks. The plugin comes with several built-in prompts for common vulnerabilities like XSS, SSRF, and SQL Injection. These prompts act as a knowledge base and can be selected to guide the agent's behavior.
    </p>
    <p>
      For example, the "Control Agent Verification" prompt instructs the agent to perform a final, rigorous self-check before reporting a vulnerability, reducing false positives.
    </p>

    <h3 id="auto-mode">Auto Mode</h3>
    <p>
      This feature enables the agent to operate autonomously. When activated, the agent will perform a complete, end-to-end security assessment on the currently selected replay session without further input from you. The agent will:
    </p>
    <ol>
      <li><strong>Initiate an analysis:</strong> Start by understanding the request and the target.</li>
      <li><strong>Formulate a plan:</strong> Based on the request, it will create a testing plan, which may include checks for SQLi, XSS, Path Traversal, and other vulnerabilities.</li>
      <li><strong>Execute tools:</strong> Use its available tools to perform the tests, modifying the request and analyzing responses.</li>
      <li><strong>Verify findings:</strong> If a potential vulnerability is found, it will perform additional steps to verify it, using techniques like the "Control Agent Verification" prompt.</li>
      <li><strong>Report:</strong> If a vulnerability is confirmed, it will automatically add a finding to your Caido project.</li>
    </ol>
    <p>
      Auto Mode is designed to accelerate the reconnaissance and initial testing phases, allowing you to focus on more complex, high-impact tasks.
    </p>
  </div>
</template>