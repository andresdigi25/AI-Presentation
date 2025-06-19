# FastAPI Application

This project is a FastAPI application that demonstrates the use of Pydantic for data validation and serialization. It includes endpoints for processing questions and images, utilizing a language model for generating responses.

## Project Structure

```
fastapi-app
├── app
│   ├── main.py         # Entry point of the FastAPI application
│   ├── models.py       # Data models used in the application
│   ├── schemas.py      # Pydantic schemas for request and response data
│   └── utils.py        # Utility functions for the application
├── requirements.txt     # Project dependencies
└── README.md            # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd fastapi-app
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

To run the FastAPI application, execute the following command:

```
uvicorn app.main:app --host 0.0.0.0 --port 8888 --reload
```

You can access the API documentation at `http://localhost:8888/docs`.

## Endpoints

- **POST /api/question**: Submit a question and an encoded image to receive a response from the language model.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.