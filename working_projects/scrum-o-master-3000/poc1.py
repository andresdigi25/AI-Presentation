# Voice Chatbot with Ollama Integration
# This script creates a voice-controlled chatbot that uses speech recognition
# to listen to user input and responds using text-to-speech with Ollama AI

import ollama
import speech_recognition as sr
import pyttsx3


def ask_ollama(prompt, model="mistral"):
    """
    Send a prompt to Ollama AI and get a response.
    
    Args:
        prompt (str): The user's question or input
        model (str): The Ollama model to use (default: "mistral")
    
    Returns:
        str: The AI's response text
    """
    response = ollama.chat(model=model, messages=[
        {
            'role': 'user',
            'content': prompt
        }
    ])
    return response['message']['content']


def listen_to_user():
    """
    Listen to user's voice input and convert it to text.
    
    This function:
    1. Lists available microphones for user selection
    2. Sets up speech recognition with the chosen microphone
    3. Listens for voice input and converts it to text using Google's speech recognition
    
    Returns:
        str or None: The recognized text, or None if recognition failed
    """
    # Initialize the speech recognizer
    r = sr.Recognizer()
    
    # List available microphones so user can choose the right one
    print("\nAvailable microphones:")
    mics = sr.Microphone.list_microphone_names()
    for index, name in enumerate(mics):
        print(f"{index}: {name}")
    
    # Let user choose which microphone to use
    while True:
        try:
            mic_index = int(input("\nEnter the number of your microphone: "))
            if 0 <= mic_index < len(mics):
                break
            print("Invalid microphone number. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    print(f"\nUsing microphone: {mics[mic_index]}")
    
    # Use the selected microphone to listen for voice input
    with sr.Microphone(device_index=mic_index) as source:
        print("🎙️ Speak now...")
        # Adjust for ambient noise to improve recognition accuracy
        r.adjust_for_ambient_noise(source, duration=1)
        # Listen for audio input
        audio = r.listen(source)
        try:
            # Convert speech to text using Google's speech recognition
            return r.recognize_google(audio)
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand what you said.")
            return None
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return None


def speak(text):
    """
    Convert text to speech and play it through the speakers.
    
    Args:
        text (str): The text to be spoken aloud
    """
    # Initialize the text-to-speech engine
    engine = pyttsx3.init()
    # Queue the text to be spoken
    engine.say(text)
    # Play the speech and wait for it to complete
    engine.runAndWait()


def main():
    """
    Main function that runs the voice chatbot.
    
    This function:
    1. Starts the chatbot and displays instructions
    2. Continuously listens for user voice input
    3. Sends the input to Ollama AI for processing
    4. Speaks the AI response back to the user
    5. Continues until the user says 'quit', 'exit', or 'stop'
    """
    print("🤖 Voice Chatbot with Ollama is running. Say 'quit' to exit.")
    
    # Main loop - keep running until user wants to quit
    while True:
        # Listen for user's voice input
        user_input = listen_to_user()
        
        if user_input:
            print(f"🗣️ You: {user_input}")
            
            # Check if user wants to exit the program
            if user_input.lower() in ["quit", "exit", "stop"]:
                break

            # Get AI response from Ollama
            bot_response = ask_ollama(user_input)
            print(f"🤖 Bot: {bot_response}")
            
            # Speak the AI response back to the user
            speak(bot_response)


# Entry point - only run main() if this script is executed directly
if __name__ == "__main__":
    main()
