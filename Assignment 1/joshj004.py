# joshj004.py
# This is a python program that models a crotchety old
# man who cares very much about his lawn.

from re import *   # Loads the regular expression module.
from random import *

silence = -1
lawn = -1
Billy = False

# This just holds the introduction and a couple other lines.
def OldMan():
    introduce()
    return ('Who are you? What are you doing here?')
    return ('Don\'t just stand there looking at me, I have things to do.')

# The name of the agent.
def agentName():
    return "Ron"

# The introduction.
def introduce():
    return ("""\
My name is Ron. You don't need to know my last name.
I live in this house and you're standing on my porch.
I was programmed by Josh Johnson and if you've got a problem with
that, send him an email on that phone of yours at joshj004@uw.edu""")

# Provides a response based on the input and the states of certain variables.
def respond(the_input):
    global silence, lawn, Billy
    wordlist = split(' ',remove_punctuation(the_input))
    # adds a question mark if there originally was one
    if '?' in the_input:
        wordlist.append('?')
    # makes the words all lower case
    wordlist = [x.lower() for x in wordlist]
    # Compute mapped word list here
    # Checks if the other person didn't say anything. This is cycle #1
    if wordlist[0] == '' and len(wordlist) == 0:
        silence += 1
        if silence % 3 == 0:
            return "You just gonna stand there?"
        elif silence % 3 == 1:
            return "You're a strange kid."
        else:
            return "You got something to say?"
    # Talks about his lawn. This is cycle #2
    elif 'lawn' in wordlist:
        lawn += 1
        if lawn % 3 == 0:
            return "Yes, I take care of my lawn myself. If you want something done right, you gotta do it yourself."
        elif lawn % 3 == 1:
            return "My lawn? Has that neighbor's kid been running around on it? I told that kid to never come near it."
        else:
            return "This lawn would look a lot nicer if people didn't step on it."
    # Talks about trouble. This is random.
    elif 'trouble' in wordlist:
        troubleList = ["This 12 gauge make sure we don't have any trouble round here.",
                       "What's this you're saying about trouble?",
                       "Cut that out, I don't like troublemakers."]
        return choice(troubleList)
    # Doesn't talk about billy. This remembers if he's been brought up already.
    elif 'billy' in wordlist:
        if Billy is False:
            Billy = True
            return "We don't talk about Billy no more. It would be best if you didn't either."
        else:
            return "If you keep mentioning him, we're gonna have a real problem."
    # Asks about explosions
    elif 'explode' in wordlist:
        return "That sounds dangerous. Are you okay?"
    # Asks the other person what they do.
    elif 'not' in wordlist and 'much' in wordlist:
        return "If you won't talk, I will. What keeps you busy?"
    # Asks what they do for a living.
    elif 'work' in wordlist:
        return "What do you do for work?"
    # Specifically geared towards my partner's assistants.
    elif 'assistants' in wordlist:
        return "Excuse me for trying to talk to you. Hmph."
    # Shares his feelings about experiments
    elif 'experiment' in wordlist:
        return "Not in this community you won't. Experiments can only bring bad things."
    # Talks about alerts
    elif 'alert' in wordlist:
        return "You don't know what it means to be alert."
    # Brings up rain.
    elif 'rain' in wordlist:
        return "We don't get much rain around here, so it's always a blessing."
    # Avoids the topic of droughts
    elif 'drought' in wordlist:
        return "I'm not a superstitious type, but I don't even like thinking about the possibility."
    # Welcomes a flood
    elif 'flood' in wordlist:
        return "Hah! We haven't seen a flood in this neck of the woods for decades."
    # Makes sure the other person isn't too talky
    elif len(wordlist) > 20:
        return "I don't appreciate getting preached to."
    # Makes sure the person isn't a narcisst
    elif wordlist.count('i') > 2:
        return "Do you only ever talk about yourself?"
    # Makes sure the person doesn't ask about me.
    elif wordlist.count('you') > 2:
        return "You're getting awfully comfortable for a stranger."
    # Warns the other person not to talk about his mother.
    elif 'mother' in wordlist:
        return "Tread carefully."
    # Tells the other person they don't have to be here
    elif 'bored' in wordlist or 'boring' in wordlist:
        return "Nobody is forcing you to be here."
    # This is if they asked a question
    elif '?' in wordlist:
        return "Sometimes it's best if you don't ask too many questions."
    # Mocks the other person for using and multiple times.
    elif wordlist.count('and') > 2:
        return "Didn't anybody ever teach you how to form a sentence?"
    # A comment on brevity
    elif len(wordlist) < 2:
        return "I can appreciate being laconic."
    # If none of the other rules catch.
    return (punt())

punctuation_pattern = compile(r"\,|\.|\?|\!|\;|\:")

# Removes punctuation for a string.
def remove_punctuation(text):
    'Returns a string without any punctuation.'
    return sub(punctuation_pattern,'', text)


PUNTS = ['I don\'t have all day.',
         'I will admit, I am interested. Tell me more.',
         'So?',
         'Why should I care?',
         'I have better things I could be doing.',
         'Maybe it\'s best if you think about leaving.']

punt_count = 0
def punt():
    'Returns one from a list of default responses.'
    global punt_count
    punt_count += 1
    return PUNTS[punt_count % 6]

OldMan() # Launch the program.