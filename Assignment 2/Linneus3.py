"""PartII.py
Josh Johnson, CSE 415, Spring 2016, University of Washington
Instructor:  S. Tanimoto.
Assignment 2 Part II.  ISA Hierarchy Manipulation

I have worked alone (no partner).

All forms of redundancy detection and processing are working.
The test cases are all copied from the Assignment 2 page and can easily be commented in/out.
"""

from re import *  # Loads the regular expression module.

ISA = {}
INCLUDES = {}
ARTICLES = {}


def store_isa_fact(category1, category2):
    'Stores one fact of the form A BIRD IS AN ANIMAL'
    # That is, a member of CATEGORY1 is a member of CATEGORY2
    try:
        c1list = ISA[category1]
        c1list.append(category2)
    except KeyError:
        ISA[category1] = [category2]
    try:
        c2list = INCLUDES[category2]
        c2list.append(category1)
    except KeyError:
        INCLUDES[category2] = [category1]


def get_isa_list(category1):
    'Retrieves any existing list of things that CATEGORY1 is a'
    try:
        c1list = ISA[category1]
        return c1list
    except:
        return []


def get_includes_list(category1):
    'Retrieves any existing list of things that CATEGORY1 includes'
    try:
        c1list = INCLUDES[category1]
        return c1list
    except:
        return []


def isa_test1(category1, category2):
    'Returns True if category 2 is (directly) on the list for category 1.'
    c1list = get_isa_list(category1)
    return c1list.__contains__(category2)


def isa_test(category1, category2, depth_limit=10):
    'Returns True if category 1 is a subset of category 2 within depth_limit levels'
    if category1 == category2: return True
    if isa_test1(category1, category2): return True
    if depth_limit < 2: return False
    for intermediate_category in get_isa_list(category1):
        if isa_test(intermediate_category, category2, depth_limit - 1):
            return True
    return False


def store_article(noun, article):
    'Saves the article (in lower-case) associated with a noun.'
    ARTICLES[noun] = article.lower()


def get_article(noun):
    'Returns the article associated with the noun, or if none, the empty string.'
    try:
        article = ARTICLES[noun]
        return article
    except KeyError:
        return ''


def linneus():
    'The main loop; it gets and processes user input, until "bye".'
    print('This is Linneus.  Please tell me "ISA" facts and ask questions.')
    print('For example, you could tell me "An ant is an insect."')
    while True:
        info = input('Enter an ISA fact, or "bye" here: ')
        if info == 'bye': return 'Goodbye now!'
        process(info)

# Some regular expressions used to parse the user sentences:    
assertion_pattern = compile(r"^(a|an|A|An)\s+([-\w]+)\s+is\s+(a|an)\s+([-\w]+)(\.|\!)*$", IGNORECASE)
query_pattern = compile(r"^is\s+(a|an)\s+([-\w]+)\s+(a|an)\s+([-\w]+)(\?\.)*", IGNORECASE)
what_pattern = compile(r"^What\s+is\s+(a|an)\s+([-\w]+)(\?\.)*", IGNORECASE)
why_pattern = compile(r"^Why\s+is\s+(a|an)\s+([-\w]+)\s+(a|an)\s+([-\w]+)(\?\.)*", IGNORECASE)


def process(info):
    'Handles the user sentence, matching and responding.'
    result_match_object = assertion_pattern.match(info)
    if result_match_object != None:
        items = result_match_object.groups()
        store_article(items[1], items[0])
        store_article(items[3], items[2])
        # Checks for the intermediate and complex indirect redundancy
        intermediateAndComplexCheck = intermediate_and_complex_indirect_redundancy_detection(items[1], items[3])
        if intermediateAndComplexCheck[0]:
            # Checks for the Complex indirect redundancy
            if len(intermediateAndComplexCheck) > 2:
                # Shortens the list to only include relevant elements
                shortList = intermediateAndComplexCheck[1:]
                redundantList = []
                for x in shortList:
                    redundantList.append(str(get_article(x[0]) + " " + x[0] + " is " + get_article(x[1]) + " " + x[1]))
                    remove_from_isa(x[0], x[1])
                print("The following statements you made earlier are now all redundant: ")
                for x in range(len(redundantList) - 1):
                    print(redundantList[x], ';', sep='')
                print(redundantList[-1], '.', sep='')
                return
            # Else deals with the intermediate redundancy
            else:
                firstWord = intermediateAndComplexCheck[1][0]
                secondWord = intermediateAndComplexCheck[1][1]
                print("Your earlier statement that", get_article(firstWord), firstWord, "is", get_article(secondWord), secondWord, "is now redundant.")
                remove_from_isa(intermediateAndComplexCheck[1][0], intermediateAndComplexCheck[1][1])
                return
        # Checks for simple indirect redundancy
        intersection = simple_indirect_redundancy_detection(items[1], items[3])
        if intersection[0]:
            firstWord = intersection[1]
            print("Your earlier statement that", get_article(firstWord), firstWord, "is", items[2].lower(), items[3].lower(), "is now redundant.")
            store_isa_fact(items[1], items[3])
            remove_from_isa(firstWord, items[3].lower())
            return
        # Checks for direct redundancy
        tempList = get_isa_list(items[1])
        if items[3] in tempList:
            print("You told me that earlier.")
            return
        if items[1] == items[3] or items[3] in generate_simple_list(items[1]):
            print("You don't have to tell me that.")
            return
        store_isa_fact(items[1], items[3])
        print("I understand.")
        return
    result_match_object = query_pattern.match(info)
    if result_match_object != None:
        items = result_match_object.groups()
        answer = isa_test(items[1], items[3])
        if answer:
            print("Yes, it is.")
        else:
            print("No, as far as I have been informed, it is not.")
        return
    result_match_object = what_pattern.match(info)
    if result_match_object != None:
        items = result_match_object.groups()
        supersets = get_isa_list(items[1])
        if supersets != []:
            first = supersets[0]
            a1 = get_article(items[1]).capitalize()
            a2 = get_article(first)
            print(a1 + " " + items[1] + " is " + a2 + " " + first + ".")
            return
        else:
            subsets = get_includes_list(items[1])
            if subsets != []:
                first = subsets[0]
                a1 = get_article(items[1]).capitalize()
                a2 = get_article(first)
                print(a1 + " " + items[1] + " is something more general than " + a2 + " " + first + ".")
                return
            else:
                print("I don't know.")
        return
    result_match_object = why_pattern.match(info)
    if result_match_object != None:
        items = result_match_object.groups()
        if not isa_test(items[1], items[3]):
            print("But that's not true, as far as I know!")
        else:
            answer_why(items[1], items[3])
        return
    print("I do not understand.  You entered: ")
    print(info)

# Removes an ISA statement (from those redundant statements found)
def remove_from_isa(word1, word2):
    try:
        c1list = ISA[word1]
        c1list.remove(word2)
        ISA[word1] = c1list
    except:
        return

    try:
        c2list = INCLUDES[word2]
        c2list.remove(word1)
        INCLUDES[word2] = c2list
    except:
        return


def intermediate_and_complex_indirect_redundancy_detection(word1, word2):
    word2MapTo = get_isa_list(word2)
    word1MapFrom = get_includes_list(word1)
    tempList = [False]
    for x in word1MapFrom:
        xMapTo = get_isa_list(x)
        for y in xMapTo:
            if y in word2MapTo:
                tempList[0] = True
                tempList.append([x, y])
    return tempList


def simple_indirect_redundancy_detection(word1, word2):
    word1List = get_includes_list(word1)
    word2List = get_includes_list(word2)
    intersect = list(set(word1List) & set(word2List))
    tempList = []
    tempList.append(len(intersect) > 0)
    if tempList[0]:
        tempList.append(intersect[0])
    return tempList


def generate_simple_list(word):
    tempList = get_isa_list(word)
    for x in tempList:
        tempList.extend(generate_simple_list(x))
    return tempList


def answer_why(x, y):
    'Handles the answering of a Why question.'
    if x == y:
        print("Because they are identical.")
        return
    if isa_test1(x, y):
        print("Because you told me that.")
        return
    print("Because " + report_chain(x, y))
    return


from functools import reduce


def report_chain(x, y):
    'Returns a phrase that describes a chain of facts.'
    chain = find_chain(x, y)
    all_but_last = chain[0:-1]
    last_link = chain[-1]
    main_phrase = reduce(lambda x, y: x + y, map(report_link, all_but_last))
    last_phrase = "and " + report_link(last_link)
    new_last_phrase = last_phrase[0:-2] + '.'
    return main_phrase + new_last_phrase


def report_link(link):
    'Returns a phrase that describes one fact.'
    x = link[0]
    y = link[1]
    a1 = get_article(x)
    a2 = get_article(y)
    return a1 + " " + x + " is " + a2 + " " + y + ", "


def find_chain(x, z):
    'Returns a list of lists, which each sublist representing a link.'
    if isa_test1(x, z):
        return [[x, z]]
    else:
        for y in get_isa_list(x):
            if isa_test(y, z):
                temp = find_chain(y, z)
                temp.insert(0, [x, y])
                return temp


def test():
    process("A turtle is a reptile.")
    process("A turtle is a shelled-creature.")
    process("A reptile is an animal.")
    process("An animal is a thing.")

    # 1st Trial
    # process("A sockeye is a salmon")
    # process("A salmon is a fish.")
    # process("A sockeye is a fish.")
    # process("A spade is a spade.")
    # process("A sockeye is a salmon.")


    # 2nd Trial
    # process("A hawk is a bird")
    # process("A hawk is an raptor")
    # process("A raptor is a bird")

    # 3rd Trial
    # process("A hawk is a raptor")
    # process("A hawk is an animal")
    # process("A bird is an animal")
    # process("A raptor is a bird")

    # LAST TRIAL
    # process("A chinook is an organism.")
    # process("A sockeye is a salmon.")
    # process("A fish is an animal.")
    # process("A sockeye is an organism.")
    # process("A chinook is an animal.")
    # process("A chinook is a salmon.")
    # process("A sockeye is an animal.")
    # process("A fish is an organism.")
    # process("A salmon is a fish.")


test()
linneus()
