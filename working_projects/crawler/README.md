# Multi-Language Web Crawler

This project is a multi-language web crawler implemented in Go, Python, and Node.js. Each crawler reads a list of URLs from the `CRAWL_URLS` environment variable, crawls each URL, extracts links and visible text, and saves results in per-tech, per-domain output folders.

## Features
- **Go, Python, and Node.js** implementations, each in its own folder.
- Reads URLs from the `CRAWL_URLS` environment variable (set in `.env`).
- Extracts all links and visible text from each page.
- Saves results to `output/<tech>/<domain>/` as `links.csv` and `text.json`.
- Each tech has its own `Dockerfile` and code folder.
- Unified `docker-compose.yml` and `Makefile` for building and running each version.
- Progress bar and pretty output for each tech, showing only 10% of links in the terminal.

## Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Make](https://www.gnu.org/software/make/)

## Setup
1. Create a `.env` file in the project root with a line like:
   ```env
   CRAWL_URLS=https://example.com,https://anotherdomain.com
   ```
2. (Optional) Create the `output/` directory (will be created automatically if missing).

## Build
You can build all services at once:
```sh
docker-compose build
```
Or build a specific tech:
```sh
docker-compose build go
# or
docker-compose build python
# or
docker-compose build nodejs
```
Or with Make:
```sh
make build
```

## Run
Run a specific crawler:
```sh
docker-compose run --rm go
# or
docker-compose run --rm python
# or
docker-compose run --rm nodejs
```
Or with Make:
```sh
make run-go
make run-python
make run-nodejs
```

## Output
Results are saved in the `output/` directory, organized by tech and domain:
```
output/
  go/
    example.com/
      links.csv
      text.json
  python/
    example.com/
      links.csv
      text.json
  nodejs/
    example.com/
      links.csv
      text.json
```

## Notes
- All dependencies are handled inside Docker containers; nothing is required on your host except Docker and Docker Compose.
- Each crawler shows a progress bar and pretty output, displaying only 10% of links in the terminal.
- You can add or remove URLs in the `.env` file as needed.

## License
MIT
