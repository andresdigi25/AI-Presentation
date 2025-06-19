from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from .database import create_db_and_tables

app = FastAPI(
    title="Facilities API",
    description="GraphQL API for managing facilities",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

graphql_app = GraphQLRouter(
    schema,
    graphiql=True  # Enables the GraphQL Playground UI
)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Facilities API",
        "docs": "/docs",
        "graphql": "/graphql"
    } 