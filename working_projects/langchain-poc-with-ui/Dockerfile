FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK punkt and punkt_tab data
RUN python -m nltk.downloader punkt punkt_tab

# Copy the rest of the application
COPY . .

# Create directory for articles and database
RUN mkdir -p articles

# Expose Streamlit port
EXPOSE 8501

# Command to run Streamlit
CMD ["streamlit", "run", "app.py", "--server.address", "0.0.0.0"] 