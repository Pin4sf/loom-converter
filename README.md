
# Contentformer

A Next.js application that helps you transform video transcripts into various content formats using AI. Generate content ideas, video scripts, and LinkedIn posts from your video transcripts with ease.

## Features

- **AI-Powered Content Generation**: Leverage Claude and GPT models to transform transcripts
- **Multiple Output Formats**: Generate content ideas, video scripts, and LinkedIn posts
- **Interactive UI**: User-friendly interface with real-time progress tracking
- **Customizable Instructions**: Add specific instructions to guide the AI generation
- **Provider Options**: Choose between Anthropic (Claude) and OpenAI (GPT) models

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd loom-to-script/loom-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser

## Configuration

The application requires API keys to function:

1. Click the settings (cog) icon to open the API configuration dialog
2. Enter your API keys:
   - Anthropic API key for Claude models
   - OpenAI API key for GPT models
3. Select your preferred provider
4. Save your configuration

API keys are stored in your browser's localStorage for convenience.

## Usage

1. Enter your transcript in the main text area
2. (Optional) Add specific instructions to guide the AI
3. Click "Generate Content"
4. The system will process your content in three stages:
   - Generate content ideas
   - Create video scripts for selected ideas
   - Produce LinkedIn posts based on scripts
5. Browse through the generated content using the tabs
6. Pause/resume the generation process if needed

## Technologies

- Next.js
- React
- AI SDK for AI model integration
- Radix UI for accessible UI components
- Tailwind CSS for styling

## License

MIT
