# Puppeteer Performance Testing

This project contains performance testing scripts using Puppeteer to measure and analyze web application performance.

## Project Structure

- `performance-test.js` - Main performance testing script
- `performance-history.js` - Script for tracking performance history
- `poc.js`, `poc1.js`, `poc2.js` - Proof of concept scripts
- `performance-results/` - Directory for storing test results
- `evidence/` - Directory for storing evidence/screenshots

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

The project uses Puppeteer for browser automation and performance testing. Main scripts include:

- `node performance-test.js 2 headless` - Run performance tests
- `performance-history.js` - Track and analyze performance history

## Dependencies

- puppeteer: ^24.9.0

## License

ISC 