import os
import requests
from bs4 import BeautifulSoup
import csv
import json
from urllib.parse import urlparse
from rich.progress import Progress
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
import time

def get_domain(url):
    return urlparse(url).hostname.replace('.', '_')

def extract_links_and_text(url):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        links = [a.get('href') for a in soup.find_all('a', href=True)]
        # Extract visible text from <body>
        body = soup.body
        text = body.get_text(separator=' ', strip=True) if body else ''
        return links, text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return [], ''

def save_links_csv(links, path):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for link in links:
            writer.writerow([link])

def save_text_json(text, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'text': text}, f, ensure_ascii=False, indent=2)

def render_json_text(text):
    console = Console()
    console.print(Panel(text, title="Extracted Text (JSON)", expand=False))

def render_csv_links(links):
    console = Console()
    table = Table(title="Extracted Links (CSV) [showing 10%]")
    table.add_column("Link", style="cyan")
    n = max(1, len(links) // 10) if links else 0
    for link in links[:n]:
        table.add_row(link)
    if len(links) > n:
        table.add_row("... ({} more) ...".format(len(links) - n))
    console.print(table)

def main():
    urls = os.getenv('CRAWL_URLS', '').split(',')
    output_dir = 'output/python'
    urls = [u.strip() for u in urls if u.strip()]
    console = Console()
    with Progress() as progress:
        task = progress.add_task("Crawling...", total=len(urls))
        for url in urls:
            domain = get_domain(url)
            folder = os.path.join(output_dir, domain)
            os.makedirs(folder, exist_ok=True)
            links, text = extract_links_and_text(url)
            save_links_csv(links, os.path.join(folder, 'links.csv'))
            save_text_json(text, os.path.join(folder, 'text.json'))
            console.print(f'[green]Crawled {url} -> {folder}[/green]')
            render_json_text(text)
            render_csv_links(links)
            progress.update(task, advance=1)
            time.sleep(1)  # Add sleep to make progress bar visible

if __name__ == '__main__':
    main()
