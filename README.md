# ChainMind AI

An intelligent AI chatbot that streamlines and automates supply chain master data management for materials, customers, and pricing.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/ChainMind-20251003-045540)

ChainMind AI is an intelligent automation platform designed to streamline master data management in supply chain operations. It provides a sophisticated, minimalist chatbot interface for internal users to manage material, customer, and pricing master data. The AI-powered assistant guides users through complex data creation and validation processes, automates data population using intelligent tools, and ensures high data quality through built-in validation and anomaly detection. The platform aims to significantly reduce manual effort, eliminate errors, and foster smarter, data-driven decision-making across the organization.

## Key Features

-   **Conversational Interface**: Manage complex master data through a simple, intuitive chat UI.
-   **AI-Powered Assistance**: Get real-time guidance for creating and validating materials, customers, and pricing data.
-   **Intelligent Tooling**: The AI automatically uses tools to perform actions like creating material masters or validating customer records.
-   **Session Management**: Persistent, named chat sessions allow you to manage multiple tasks and review conversation history.
-   **Responsive Design**: A clean, minimalist interface that works flawlessly on desktop and mobile devices.
-   **Built on Cloudflare**: Leverages the power and scalability of Cloudflare Workers and Durable Objects for a robust, stateful backend.

## Technology Stack

-   **Frontend**:
    -   React (with Vite)
    -   TypeScript
    -   Tailwind CSS
    -   shadcn/ui
    -   Framer Motion
    -   Zustand
    -   Lucide React
-   **Backend**:
    -   Cloudflare Workers
    -   Cloudflare Agents (Durable Objects)
    -   Hono
-   **AI & Services**:
    -   Cloudflare AI Gateway
    -   Model Context Protocol (MCP)

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [Bun](https://bun.sh/) installed as your package manager.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chainmind-ai.git
    cd chainmind-ai
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure Environment Variables:**

    Create a `.dev.vars` file in the root of the project. This file is used by Wrangler to load environment variables for local development.

    ```ini
    # .dev.vars

    # Cloudflare AI Gateway URL
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"

    # Cloudflare API Key (for AI Gateway)
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```

    Replace the placeholder values with your actual Cloudflare Account ID, Gateway ID, and API Key.

### Running Locally

Start the development server, which includes the Vite frontend and the Cloudflare Worker backend:

```bash
bun dev
```

The application will be available at `http://localhost:3000` (or the port specified in your terminal).

## Usage

Once the application is running, you can interact with the AI assistant:

-   Click the "New Chat" button to start a new conversation.
-   Type requests into the input box, for example: `Create a new material master for a 12V DC Motor`.
-   The AI will guide you through the process, asking for required information.
-   Past conversations are saved in the sidebar for easy access.

## Project Structure

-   `src/`: Contains all the frontend React application code.
    -   `components/`: Reusable UI components.
    -   `pages/`: Main application views/pages.
    -   `stores/`: Zustand state management stores.
    -   `lib/`: Utility functions and client-side API services.
-   `worker/`: Contains all the backend Cloudflare Worker and Agent code.
    -   `agent.ts`: The core `ChatAgent` Durable Object class.
    -   `chat.ts`: Handles AI model interaction and logic.
    -   `tools.ts`: Defines and implements the tools the AI can use.
    -   `userRoutes.ts`: Defines the API routes for the application.
    -   `index.ts`: The entry point for the Cloudflare Worker.

## Deployment

This project is designed for easy deployment to Cloudflare's global network.

1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account:
    ```bash
    bunx wrangler login
    ```

2.  **Configure Production Secrets:**
    For deployment, you must set your environment variables as secrets in your Cloudflare dashboard or via the command line. **Do not commit secrets to your repository.**

    ```bash
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    ```

3.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to Cloudflare.

    ```bash
    bun run deploy
    ```

    Wrangler will provide you with the URL of your deployed application.

---

**Deploy with one click:**

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/ChainMind-20251003-045540)