# Article Scraper with Ollama Summarization

This project combines web article scraping with AI-powered summarization using Ollama. It scrapes articles from any URL, extracts metadata, and generates summaries using a local LLM (Large Language Model) through Ollama.

## Features

- Web article scraping with metadata extraction
- Local LLM summarization using Ollama
- Docker-based setup for easy deployment
- JSON output with both original and AI-generated summaries
- Console output for monitoring the summarization process

## Prerequisites

- Docker and Docker Compose
- Internet connection for article scraping
- Sufficient disk space for Ollama models

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd langchain-poc
```

2. Start the services:
```bash
docker-compose up -d
```

3. Pull the Llama2 model (this might take a while):
```bash
docker exec -it ollama ollama pull llama2
```

## Usage

To scrape and summarize an article, run:

```bash
docker-compose run --rm article-scraper python article_scraper.py "https://your-article-url.com"
docker-compose run --rm article-scraper python article_scraper.py "https://docs.docker.com/guides/genai-pdf-bot/"
```

The script will:
1. Scrape the article and extract metadata
2. Show the text being sent to Ollama
3. Display Ollama's summary response
4. Save everything to a JSON file in the `articles` directory

### Output

The script generates a JSON file in the `articles` directory containing:
- Article URL
- Title
- Authors
- Publication date
- Full text
- Original summary (from newspaper3k)
- Keywords
- Scrape timestamp
- Images and media
- Ollama-generated summary

## Project Structure

```
.
├── article_scraper.py    # Main scraping and summarization script
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Service orchestration
├── requirements.txt     # Python dependencies
└── articles/           # Output directory for JSON files
```

## Dependencies

- newspaper3k: Article scraping
- langchain: LLM integration
- Ollama: Local LLM server
- Docker: Containerization

## Troubleshooting

1. If the container fails to start:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. If Ollama summarization fails:
   - Check if Ollama is running: `docker ps`
   - Verify the model is downloaded: `docker exec -it ollama ollama list`
   - Check container logs: `docker logs ollama`

3. If article scraping fails:
   - Verify the URL is accessible
   - Check your internet connection
   - Look for any rate limiting from the source website

## Contributing

Feel free to submit issues and enhancement requests! 