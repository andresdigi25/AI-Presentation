# Scrum-O-Master 3000

Scrum-O-Master 3000 is an interactive voice-based Scrum Master assistant designed to facilitate daily standups for Agile teams. It uses speech recognition, text-to-speech, and AI-powered responses to make standups more engaging and efficient. The assistant can record team updates, generate jokes based on the context, and save the standup data for future reference.

![Scrum-O-Master 3000](assets/smo3000.png)

---

## Features

- **Voice Interaction**: Uses speech recognition to listen to team members and text-to-speech to respond.
- **AI-Powered Responses**: Generates jokes and responses using the Ollama API.
- **Standup Data Management**: Records and saves daily standup updates in JSON format.
- **Customizable Microphone Selection**: Allows users to select their preferred microphone for input.
- **Agile Humor**: Ends the standup with a light-hearted Agile-related joke.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/scrum-o-master-3000.git
   cd scrum-o-master-3000


2. Install dependencies
   ```bash
   pip install -r requirements.txt
   brew install portaudio
   ```

## Requirements
The project uses the following Python libraries:

- **pyttsx3:** A text-to-speech conversion library used to make the Scrum-O-Master speak responses and jokes.
- **SpeechRecognition**: A library for speech recognition, used to capture and process voice input from team members.
- **pyaudio**: Provides access to the audio input/output streams required for speech recognition.
- **ollama**: An API client for interacting with the Ollama AI model, used to generate jokes and responses during the standup.

## Usage
python scrum_master.py

## Directory Structure
   ```bash
scrum-o-master-3000/
├── assets/
│   └── scrum-o-master-3000.png  # Project image
├── standups/
│   └── standup_<date>.json      # Saved standup data
├──                       # Simple text-to-speech example
├──                     # Simple speech recognition example
├──                       # Proof of concept for voice interaction
├──               # Main application file
├──              # Project dependencies
├──                     # Project documentation

```

## Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue for any bugs or feature requests.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

