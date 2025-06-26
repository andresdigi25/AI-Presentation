import pyttsx3

# The phrase from the root README.md
PHRASE = (
    "Remember: Limits, like fear, are often just an illusion "
)

def speak_strong_male(text):
    engine = pyttsx3.init()
    # Try to set a strong male voice if available
    voices = engine.getProperty('voices')
    for voice in voices:
        engine.setProperty('voice', voice.id)
        engine.say(text)
    engine.runAndWait()

def main():
    print(f"Voicing phrase: {PHRASE}")
    speak_strong_male(PHRASE)

if __name__ == "__main__":
    main() 