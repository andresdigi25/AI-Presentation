
import ollama
import speech_recognition as sr
import pyttsx3


def ask_ollama(prompt, model="mistral"):
    response = ollama.chat(model=model, messages=[
        {
            'role': 'user',
            'content': prompt
        }
    ])
    return response['message']['content']



def listen_to_user():
    r = sr.Recognizer()
    
    # List available microphones
    print("\nAvailable microphones:")
    mics = sr.Microphone.list_microphone_names()
    for index, name in enumerate(mics):
        print(f"{index}: {name}")
    
    # Let user choose microphone
    while True:
        try:
            mic_index = int(input("\nEnter the number of your microphone: "))
            if 0 <= mic_index < len(mics):
                break
            print("Invalid microphone number. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    print(f"\nUsing microphone: {mics[mic_index]}")
    
    with sr.Microphone(device_index=mic_index) as source:
        print("🎙️ Speak now...")
        # Adjust for ambient noise
        r.adjust_for_ambient_noise(source, duration=1)
        audio = r.listen(source)
        try:
            return r.recognize_google(audio)
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand what you said.")
            return None
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return None

# speak.py


def speak(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()




def main():
    print("🤖 Voice Chatbot with Ollama is running. Say 'quit' to exit.")
    while True:
        user_input = listen_to_user()
        if user_input:
            print(f"🗣️ You: {user_input}")
            if user_input.lower() in ["quit", "exit", "stop"]:
                break

            bot_response = ask_ollama(user_input)
            print(f"🤖 Bot: {bot_response}")
            speak(bot_response)

if __name__ == "__main__":
    main()
