import pyttsx3




def speak_text(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()


speak_text("scrum sucks")