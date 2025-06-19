# Facilities GraphQL API

A FastAPI-based GraphQL API for managing facilities data using SQLite as the database. The API is containerized using Docker and provides GraphQL queries and mutations for facility management.

## Tech Stack

- FastAPI
- GraphQL (Strawberry)
- SQLModel
- SQLite
- Docker
- Python 3.12

## Project Structure

```bash
.
├── app/
│   ├── __init__.py
│   ├── database.py    # Database configuration and session management
│   ├── models.py      # SQLModel definitions
│   ├── schema.py      # GraphQL schema (queries and mutations)
│   └── main.py        # FastAPI application setup
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── test_api.sh        # Test script for API endpoints
├── sync_test.py       # Synchronous Python tests
├── async_test.py      # Asynchronous Python tests
└── test_stats.py      # Test statistics and comparison
```

## Available Commands

The project includes a Makefile with the following commands:

```bash
make help          # Show all available commands
make build         # Build all Docker images
make run-api       # Start the API service
make run-sync      # Run synchronous tests
make run-async     # Run asynchronous tests
make compare-tests # Run both tests and show comparison
make stop          # Stop all services
make clean         # Stop and remove all containers
make logs          # Show logs from all services
make logs-api      # Show logs from API service
make rebuild       # Rebuild and restart all services
```

## Getting Started

1. Clone the repository

2. Build and start the API:
```bash
make build
make run-api
```

3. Access the GraphQL playground at: http://localhost:8000/graphql

## Running Tests

The project includes both synchronous and asynchronous test implementations:

1. Run synchronous tests:
```bash
make run-sync
```

2. Run asynchronous tests:
```bash
make run-async
```

3. Compare performance between sync and async:
```bash
make compare-tests
```

Test results will be saved in:
- `stats/sync_stats.json`
- `stats/async_stats.json`
- `sync_results.txt`
- `async_results.txt`

## API Documentation

### GraphQL Queries

1. Query all facilities:

```graphql
query {
  facilities {
    facilityId
    facilityName
    addr1
    city
    state
    zip
    authType
    authId
    dataType
    classOfTrade
  }
}
```

2. Query a single facility by ID:
```graphql
query {
  facility(facilityId: 1) {
    facilityId
    facilityName
    addr1
    addr2
    city
    state
    zip
    authType
    authId
    expireDate
    firstObserved
    dataType
    classOfTrade
  }
}
```

### Additional Query Examples

1. Query facilities by city:
```graphql
query {
  facilitiesByCity(city: "Example City") {
    facilityId
    facilityName
    addr1
    city
    state
    zip
  }
}
```

2. Query facilities by state:
```graphql
query {
  facilitiesByState(state: "EX") {
    facilityId
    facilityName
    addr1
    city
    state
    zip
  }
}
```

3. Search facilities with multiple criteria:
```graphql
query {
  searchFacilities(
    city: "Example City"
    state: "EX"
  ) {
    facilityId
    facilityName
    addr1
    city
    state
    zip
  }
}
```

4. Search facilities by partial facility name:
```graphql
query {
  searchFacilities(
    facilityName: "Test"
  ) {
    facilityId
    facilityName
    city
    state
  }
}
```

5. Combined search with multiple parameters:
```graphql
query {
  searchFacilities(
    facilityName: "Test"
    city: "Example City"
    state: "EX"
    authType: "LICENSE"
  ) {
    facilityId
    facilityName
    addr1
    city
    state
    authType
  }
}
```

Note: 
- `facilitiesByCity` and `facilitiesByState` perform exact matches
- `searchFacilities` with `facilityName` performs a partial match (contains)
- You can combine multiple search parameters in `searchFacilities`
- All fields in the response are optional - you can request only the fields you need

### GraphQL Mutations

Create a new facility:
```graphql
mutation {
  createFacility(input: {
    source: "API"
    facilityName: "Test Facility"
    addr1: "123 Main St"
    addr2: "Suite 100"
    city: "Example City"
    state: "EX"
    zip: "12345"
    authType: "LICENSE"
    authId: "12345"
    dataType: "PHARMACY"
    classOfTrade: "RETAIL"
  }) {
    facilityId
    facilityName
    city
    state
    zip
  }
}
```

## Data Model

The Facility model includes the following fields:

```python
class FacilityRecord:
    facility_id: int           # Primary Key
    source: str               # Data source identifier
    facility_name: str        # Name of the facility
    addr1: str               # Primary address
    addr2: Optional[str]     # Secondary address (optional)
    city: str               # City
    state: str              # State code
    zip: str                # ZIP/Postal code
    auth_type: str          # Authorization type
    auth_id: str            # Authorization identifier
    expire_date: Optional[date]     # Authorization expiration date
    first_observed: Optional[date]   # First observation date
    data_type: str          # Type of facility data
    class_of_trade: str     # Trade classification
```

## Testing

The project includes a test script that demonstrates API usage:

1. Make the script executable:
```bash
chmod +x test_api.sh
```

2. Run the tests:
```bash
./test_api.sh
```

The script will:
- Create 10 sample facilities
- Query all facilities
- Query specific facilities by ID (1, 5, and 10)

Requirements for testing:
- `curl` (HTTP client)
- `jq` (JSON processor)

## Development

### Local Development

The application uses Docker volumes for hot reloading during development:

```yaml
volumes:
  - ./app:/app/app
  - ./data:/app/data
```

### Database

- Uses SQLite with the database file at `./data/facilities.db`
- Database and tables are automatically created on startup
- SQLModel handles the ORM functionality
- Data persists between container restarts in the `data` directory

### API Endpoints

- `/graphql` - GraphQL endpoint and interactive playground
- `/docs` - FastAPI automatic documentation
- `/` - API root with basic information

## CORS Configuration

CORS is enabled for all origins in development. For production, update the CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["your-domain"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Production Considerations

Before deploying to production:

1. Security
   - Update CORS settings to specific origins
   - Implement authentication/authorization
   - Add rate limiting
   - Use secure headers

2. Database
   - Consider using a production-grade database (PostgreSQL, MySQL)
   - Implement database migrations
   - Set up backup strategies

3. Monitoring
   - Add proper logging
   - Set up monitoring and alerting
   - Implement health checks
   - Add metrics collection

4. Performance
   - Optimize database queries
   - Implement caching where appropriate
   - Consider connection pooling

## Docker Commands

Common Docker commands for this project:

```bash
# Build and start containers
docker-compose up --build

# Start containers in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build api

# Shell into container
docker-compose exec api bash
```

## Environment Variables

The application uses the following environment variables (can be set in docker-compose.yml):

- `DATABASE_URL`: SQLite database URL (default: "sqlite:///./facilities.db")
- More variables can be added as needed

## License

[Add your license here]


