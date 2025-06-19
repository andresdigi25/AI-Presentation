import speech_recognition as sr

def listen_to_microphone():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Say something...")
        audio = r.listen(source)
        try:
            text = r.recognize_google(audio)
            print(f"🗣️ You said: {text}")
            return text
        except sr.UnknownValueError:
            print("😕 Didn't catch that.")
        except sr.RequestError:
            print("⚠️ Service is down.")

listen_to_microphone()