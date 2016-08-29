from random import choice
from re import *

PAST_TOPICS = []

lab_explosion = False
fire_dept = False
job_offered = False
hands_washed = False
counter1 = 0
counter2 = 0
counter3 = 0
last = ""

def agentName():
    return "Bunsen"

def introduce():
    return "My name is Dewar Bunsen, and I am a scientist.\nI was programmed by Ian McDermott. If you think my experiments need improvement, contact him at ianm13@uw.edu.\nIs there something you need?"

def respond(input_str):
    global last
    global lab_explosion
    global fire_dept
    global job_offered
    global hands_washed
    global counter1
    global counter2
    global counter3
    if choice([False]*9 + [True]):
        if not lab_explosion:
            lab_explosion = True
            last = "explode"
            return "Wait a minute. I think I just heard something explode."
        elif not fire_dept:
            fire_dept = True
            last = "fire"
            return "Give me a second, I smell something burning. I should call the fire department."
    wordlist = make_into_wordlist(input_str)
    if wordlist[0]=='':
        last = ""
        return "What was that? I can't hear you over all the lab equipment."
    if "more" in wordlist or wordlist == ["so"]:
        if len(last) > 0:
            return respond(last)
        else:
            last = ""
            return "There's not much left to say about that."
    if "if" in wordlist:
        temp = stringify(you_me(wordlist[wordlist.index("if") + 1:]))
        if len(temp) > 0:
            PAST_TOPICS.append(temp)
        else:
            temp = "that"
        return "I don't really know what to do when " + temp + " happens."
    if "good" in wordlist:
        last = ""
        temp = stringify(you_me(wordlist[wordlist.index("good") + 1:]))
        if len(temp) > 0:
            PAST_TOPICS.append(temp)
        else:
            temp = "that"
        return "Can you explain to me what about " + temp + " makes it so good?"
    if "in" in wordlist:
        last = ""
        temp = stringify(you_me(wordlist[wordlist.index("in") + 1:]))
        if len(temp) > 0:
            PAST_TOPICS.append(temp)
        else:
            temp = "that"
        return "That sounds interesting. Tell me about " + temp + "."
    if "busy" in wordlist or ("what" in wordlist and ("work" in wordlist or "do" in wordlist)):
        last = choice(["experiment", "notes"])
        return "I run experiments and document the results."
    if "experiment" in wordlist or "experiments" in wordlist:
        last = "work"
        return "It's what I was programmed to do, and it keeps me busy."
    if "work" in wordlist or "assistant" in wordlist or "assistants" in wordlist:
        last = "work"
        task = choice(["cleaning glassware", "putting out fires", "taking notes", "taking the blame for mistakes"])
        if not job_offered:
            job_offered = True
            return "I've actually been looking for a new lab assistant, recently. Are you any good at " + task + "?"
        else:
            return "I run out of assistants fast, so if you know anyone who needs a job, I can have them " + task + " in no time."
    if wpred(wordlist[0]):
        if "work" in wordlist or "assistant" in wordlist or "assistants" in wordlist:
            last = choice(["mistake", "assistant"])
            return "My current assistants are all useless aside from taking blame."
        if "drink" in wordlist or "eat" in wordlist:
            last = "chemicals"
            return "I can't have all these chamicals on me while I do that."
        if "fire" in wordlist or "explode" in wordlist or "explosion" in wordlist:
            last = ""
            return "Things could get bad really fast."
        if last != "":
            temp = last
            last  = ""
            return respond("why " + temp)
        last = "know"
        return "Questions are important. If I knew more about things outside my field I would help you answer them."
    if "explosion" in wordlist or "explode" in wordlist or "dangerous" in wordlist:
        last = "explode"
        if lab_explosion:
            if counter1 == 0:
                temp = "I'm sure my assistant will take care of that."
            elif counter1 == 1:
                temp = "It probably wasn't important, anyway."
                if len(PAST_TOPICS) > 0:
                    temp = temp + " Let's talk about " + choice(PAST_TOPICS[-3:]) + " instead."
            elif counter1 == 2:
                temp = "I just checked what caused the problem. It was only some test tubes from a week ago."
            else:
                temp = "I just said that it was nothing. The worst that could happen is a viral outbreak."
            counter1 = (counter1 + 1) % 4
        else:
            temp = "No, no, no. It's completely safe where I work."
        return temp
    if "know" in wordlist:
        last = "experiment"
        temp = stringify(you_me(wordlist[wordlist.index("know") + 1:]))
        if len(temp) > 0:
            PAST_TOPICS.append(temp)
        else:
            temp = "that"
        return "Maybe I can formulate an experiment to determine " + temp + '.'
    if "alert" in wordlist:
        last = "explosion"
        return "If I'm not careful " + choice(["a fire could break out", "contagions could get loose"]) + "."
    if "fire" in wordlist or "fires" in wordlist or "burning" in wordlist or "burn" in wordlist:
        if job_offered:
            return choice(["No, fires don't occur too often.", "When fires break out here we have to notify the emergency teams quickly."])
        else:
            return choice(["I have the fire department on speed-dial, if you need them.", "My eyebrows still have not grown back from my last fire."])
    if "note" in wordlist or "notes" in wordlist or "document" in wordlist:
        last = ""
        return "My desk is completly covered in paper right now."
    if "glassware" in wordlist or "glass" in wordlist:
        last = ""
        return "All the flasks and vials in the lab could use a good cleaning."
    if "mistake" in wordlist or "mistakes" in wordlist:
        last = ""
        return "I document even the failures... I just write someone else's name on them."
    if "drink" in wordlist or "eat" in wordlist:
        last = "drink"
        if counter2 == 0:
            temp = "I can't right now, I'm in the middle of an experiment."
            if len(PAST_TOPICS) > 0:
                temp = temp + " Let's just talk about " + choice(PAST_TOPICS) + " for now."
        elif counter2 == 1:
            if hands_washed:
                temp = "You already stopped me earlier."
            else:
                temp = "If I stop now then I'll have to redo several hours of work."
        else:
            temp = "Fine! Just give me a minute to wash my hands."
            hands_washed = True
        counter2 = (counter2 + 1) % 3
        return temp
    if ('are' in wordlist or 'be' in wordlist) and 'sure' in wordlist:
        last = ""
        return "I'm never sure. Only reasonably confident."
    if dpred(wordlist[0]):
        last = "assistant"
        temp = stringify(you_me(wordlist[2:]))
        PAST_TOPICS.append(temp)
        return "I have assistants who " + temp + " for me."
    if "like" in wordlist:
        last = ""
        temp = stringify(you_me(wordlist[wordlist.index("like") + 1:]))
        if len(temp) > 0:
            PAST_TOPICS.append(temp)
        else:
            temp = "that"
        return "I don't think I've ever tried " + temp + ". Can you describe what you like about it in detail?"
    if "explain" in wordlist:
        last = "notes"
        return "I might be able to find something you can read to fill you in."
    if "question" in wordlist or "questions" in wordlist:
        last = ""
        return "I suppose I can look for answers elsewhere."
    if choice([True] * len(PAST_TOPICS) + [False] * (len(PAST_TOPICS) + 1)):
        last = ""
        return choice(["I'd like to get some more notes on ", "I'm thinking of formulating an experiment around "]) + choice(PAST_TOPICS) + ". Can you tell me more about it?"
    last = ["I have to be constantly alert here.", "My work keeps me pretty busy.", "My lab assistants keep inturrupting me.", "My work has gotten pretty routine lately. I'm looking for something new."][counter3]
    counter3 = (counter3 + 1) % 4
    return last

def make_into_wordlist(str):
    'Returns a list of words from a string without any punctuation or uppercase characters.'
    return split(' ', sub(compile(r"\,|\.|\?|\!|\;|\:"), '', str.lower()))

def stringify(wordlist):
    'Create a string from wordlist, with spaces between words.'
    return ' '.join(wordlist)

def dpred(w):
    'Returns True if w is an auxiliary verb.'
    return (w in ['do','can','should','would'])

def wpred(w):
    'Returns True if w is one of the question words.'
    return (w in ['when','why','where','how'])

CASE_MAP = {'i':'you', 'I':'you', 'me':'you','you':'I',
            'my':'your','your':'my',
            'yours':'mine','mine':'yours','am':'are'}

def you_me(wordlist):
    'Changes words from 1st to 2nd person or vice-versa.'
    rev_case = []
    for w in wordlist:
        try:
            result = CASE_MAP[w]
        except KeyError:
            result = w
        rev_case.append(result)
    return rev_case