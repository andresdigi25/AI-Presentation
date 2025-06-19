import ollama
import speech_recognition as sr
import pyttsx3
import json
from datetime import datetime
import os

class ScrumMaster:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.standup_data = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "team_members": {}
        }
        self.mic_index = None
        
    def speak(self, text):
        print(f"🤖 {text}")
        self.engine.say(text)
        self.engine.runAndWait()
        
    def select_microphone(self):
        # List available microphones
        print("\nAvailable microphones:")
        mics = sr.Microphone.list_microphone_names()
        for index, name in enumerate(mics):
            print(f"{index}: {name}")
        
        # Let user choose microphone
        while True:
            try:
                self.mic_index = int(input("\nEnter the number of your microphone: "))
                if 0 <= self.mic_index < len(mics):
                    break
                print("Invalid microphone number. Please try again.")
            except ValueError:
                print("Please enter a valid number.")
        
        print(f"\nUsing microphone: {mics[self.mic_index]}")
        
    def listen(self):
        if self.mic_index is None:
            self.select_microphone()
            
        with sr.Microphone(device_index=self.mic_index) as source:
            print("🎙️ Speak now...")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = self.recognizer.listen(source)
            try:
                return self.recognizer.recognize_google(audio)
            except sr.UnknownValueError:
                print("Sorry, I couldn't understand what you said.")
                return None
            except sr.RequestError as e:
                print(f"Could not request results; {e}")
                return None

    def ask_ollama(self, prompt):
        response = ollama.chat(model="mistral", messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ])
        return response['message']['content']

    def get_joke(self, context):
        prompt = f"""Based on this standup update:
        {context}
        Tell me a short, work-appropriate joke related to software development or team work."""
        return self.ask_ollama(prompt)

    def get_scrum_joke(self):
        prompt = """Tell me a short, work-appropriate joke about Agile methodology or Scrum Masters."""
        return self.ask_ollama(prompt)

    def conduct_standup(self):
        self.speak("Welcome to today's daily standup! Let's get started.")
        
        # Select microphone before starting the standup
        self.speak("First, let's select your microphone.")
        self.select_microphone()
        
        while True:
            self.speak("What is your name?")
            name = self.listen()
            if not name:
                self.speak("I couldn't hear your name. Please try again.")
                continue
                
            if name.lower() in ["quit", "exit", "stop", "end", "that's all"]:
                self.speak("Thank you everyone for participating in today's standup!")
                self.save_standup()
                # Add final Scrum joke
                final_joke = self.get_scrum_joke()
                self.speak(f"Before we go, here's one last joke about Agile: {final_joke}")
                break
                
            self.speak(f"Hello {name}! Let's go through your updates.")
            
            # Yesterday's work
            self.speak("What did you accomplish yesterday?")
            yesterday = self.listen()
            
            # Today's plan
            self.speak("What are you planning to work on today?")
            today = self.listen()
            
            # Blockers
            self.speak("Are you facing any blockers or impediments?")
            blockers = self.listen()
            
            # Store the responses
            self.standup_data["team_members"][name] = {
                "yesterday": yesterday,
                "today": today,
                "blockers": blockers
            }
            
            # Generate and tell a joke based on the update
            context = f"{name} worked on {yesterday} yesterday, plans to work on {today} today, and has blockers: {blockers}"
            joke = self.get_joke(context)
            self.speak(f"Here's a joke for you: {joke}")
            
            # Ask if there are more team members through terminal
            print("\nIs there another team member to add? (yes/no): ", end="")
            response = input().lower().strip()
            
            if response in ["no", "n", "nope", "that's all", "that's it", "done", "finished"]:
                self.speak("Thank you everyone for participating in today's standup!")
                self.save_standup()
                # Add final Scrum joke
                final_joke = self.get_scrum_joke()
                self.speak(f"Before we go, here's one last joke about Agile: {final_joke}")
                break
                
            self.speak("Next team member please.")
            
    def save_standup(self):
        # Create standups directory if it doesn't exist
        if not os.path.exists("standups"):
            os.makedirs("standups")
            
        # Save the standup data
        filename = f"standups/standup_{self.standup_data['date']}.json"
        with open(filename, 'w') as f:
            json.dump(self.standup_data, f, indent=4)
            
        self.speak(f"Today's standup has been saved to {filename}")

def main():
    scrum_master = ScrumMaster()
    scrum_master.conduct_standup()

if __name__ == "__main__":
    main() 