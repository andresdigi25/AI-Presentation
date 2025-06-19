import streamlit as st
import sqlite3
from datetime import datetime
import json
from article_scraper import ArticleScraper, summarize_with_ollama
import pandas as pd
import os

# Initialize database
def init_db():
    # Ensure articles directory exists
    os.makedirs('articles', exist_ok=True)
    db_path = os.path.join('articles', 'articles.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            title TEXT,
            text TEXT,
            publish_date TEXT,
            summary TEXT,
            ollama_summary TEXT,
            created_at TEXT,
            metadata TEXT
        )
    ''')
    conn.commit()
    return conn

# Save article to database
def save_to_db(conn, article_data):
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO articles (
                url, title, text, publish_date, summary, 
                ollama_summary, created_at, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            article_data['url'],
            article_data['title'],
            article_data['text'],
            article_data['publish_date'],
            article_data['summary'],
            article_data['ollama_summary'],
            datetime.now().isoformat(),
            json.dumps(article_data)
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        st.warning("This article has already been saved!")
        return False

# Load articles from database
def load_articles(conn):
    c = conn.cursor()
    c.execute('SELECT * FROM articles ORDER BY created_at DESC')
    columns = [description[0] for description in c.description]
    return pd.DataFrame(c.fetchall(), columns=columns)

# Streamlit UI
st.set_page_config(page_title="Article Scraper", layout="wide")
st.title("Article Scraper with Ollama Summarization")

# Initialize database
conn = init_db()

# Create tabs
tab1, tab2 = st.tabs(["Scrape Article", "View Saved Articles"])

with tab1:
    st.header("Scrape New Article")
    url = st.text_input("Enter article URL:", "https://docs.docker.com/guides/genai-pdf-bot/")
    
    if st.button("Scrape and Summarize"):
        if url:
            with st.spinner("Scraping article and generating summary..."):
                try:
                    # Initialize scraper
                    scraper = ArticleScraper()
                    
                    # Scrape article
                    st.info("Scraping article...")
                    metadata = scraper.scrape_article(url)
                    
                    # Generate Ollama summary
                    st.info("Generating summary with Ollama...")
                    ollama_summary = summarize_with_ollama(metadata["text"])
                    metadata["ollama_summary"] = ollama_summary
                    
                    # Save to database
                    if save_to_db(conn, metadata):
                        st.success("Article saved successfully!")
                    
                    # Display results
                    st.subheader("Article Details")
                    st.write(f"**Title:** {metadata['title']}")
                    st.write(f"**Authors:** {', '.join(metadata['authors'])}")
                    st.write(f"**Published:** {metadata['publish_date']}")
                    
                    st.subheader("Original Summary")
                    st.write(metadata['summary'])
                    
                    st.subheader("Ollama Summary")
                    st.write(metadata['ollama_summary'])
                    
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        else:
            st.warning("Please enter a URL")

with tab2:
    st.header("Saved Articles")
    
    # Load and display articles
    articles_df = load_articles(conn)
    
    if not articles_df.empty:
        # Display article list
        for _, article in articles_df.iterrows():
            with st.expander(f"{article['title']} ({article['created_at']})"):
                st.write(f"**URL:** {article['url']}")
                st.write(f"**Published:** {article['publish_date']}")
                
                st.subheader("Original Summary")
                st.write(article['summary'])
                
                st.subheader("Ollama Summary")
                st.write(article['ollama_summary'])
                
                if st.button("View Full Text", key=f"view_{article['id']}"):
                    st.text_area("Full Article Text", article['text'], height=300)
    else:
        st.info("No articles saved yet. Use the 'Scrape Article' tab to add some!")

# Close database connection
conn.close() 