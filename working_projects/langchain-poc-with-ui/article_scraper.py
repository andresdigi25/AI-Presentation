import json
from datetime import datetime
from newspaper import Article
from typing import Dict, Any
import os
import sys
from langchain_community.llms import Ollama
import time

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

class ArticleScraper:
    def __init__(self, output_dir: str = "articles"):
        """Initialize the ArticleScraper with an output directory."""
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def scrape_article(self, url: str) -> Dict[str, Any]:
        """
        Scrape an article from the given URL and return its metadata and content.
        
        Args:
            url (str): The URL of the article to scrape
            
        Returns:
            Dict[str, Any]: Dictionary containing article metadata and content
        """
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()  # This will extract keywords and summary

        # Create metadata dictionary
        metadata = {
            "url": url,
            "title": article.title,
            "authors": list(article.authors),
            "publish_date": article.publish_date.isoformat() if article.publish_date else None,
            "text": article.text,
            "summary": article.summary,
            "keywords": list(article.keywords),
            "scraped_at": datetime.now().isoformat(),
            "top_image": article.top_image,
            "images": list(article.images),
            "movies": list(article.movies)
        }
        
        return metadata

    def save_to_json(self, metadata: Dict[str, Any]) -> str:
        """
        Save the article metadata to a JSON file.
        
        Args:
            metadata (Dict[str, Any]): The article metadata to save
            
        Returns:
            str: Path to the saved JSON file
        """
        # Create a filename from the title
        filename = f"{metadata['title'][:50].replace(' ', '_').lower()}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        # Save to JSON file using custom encoder
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2, cls=CustomJSONEncoder)
            
        return filepath

def summarize_with_ollama(text: str, model: str = "llama2", max_retries: int = 3) -> str:
    """
    Summarize text using Ollama LLM.
    
    Args:
        text (str): The text to summarize
        model (str): The Ollama model to use
        max_retries (int): Maximum number of retries if the first attempt fails
        
    Returns:
        str: The generated summary
    """
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    llm = Ollama(model=model, base_url=base_url)
    
    # Truncate text if it's too long (Ollama has context limits)
    max_length = 4000  # Adjust based on your model's context window
    if len(text) > max_length:
        text = text[:max_length] + "..."
    
    prompt = f"""Please provide a concise summary of the following article in 3-5 sentences:

{text}

Summary:"""
    
    print("\n=== Text being sent to Ollama ===")
    print(prompt)
    print("================================\n")
    
    for attempt in range(max_retries):
        try:
            print(f"Attempting to summarize with Ollama (attempt {attempt + 1}/{max_retries})...")
            summary = llm.invoke(prompt)
            print("\n=== Ollama's Response ===")
            print(summary.strip())
            print("========================\n")
            return summary.strip()
        except Exception as e:
            if attempt == max_retries - 1:
                raise Exception(f"Failed to summarize after {max_retries} attempts: {str(e)}")
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            time.sleep(2)  # Wait before retrying

def main():
    scraper = ArticleScraper()
    # Accept URL from command line, or use default
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.bbc.com/news/world-us-canada-68812345"
    
    try:
        print(f"Scraping article from: {url}")
        metadata = scraper.scrape_article(url)
        
        # Add Ollama summary
        print("Generating summary with Ollama...")
        try:
            ollama_summary = summarize_with_ollama(metadata["text"])
            metadata["ollama_summary"] = ollama_summary
            print("Summary generated successfully!")
        except Exception as e:
            print(f"Warning: Failed to generate Ollama summary: {str(e)}")
            metadata["ollama_summary"] = None
        
        # Save to JSON
        saved_path = scraper.save_to_json(metadata)
        print(f"Article saved to: {saved_path}")
        
    except Exception as e:
        print(f"Error scraping article: {str(e)}")

if __name__ == "__main__":
    main() 