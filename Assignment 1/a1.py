__author__ = 'Josh!'
# Josh Johson
# Student ID: 1539024
# This is a simple python program, it contains the 4 functions for Assignment 1

# This method takes a number, cubes it, multiplies it by 3, and adds 5
def  three_x_cubed_plus_5(x):
    return 3 * x**3 + 5

# This is a cesear cihper that takes a string and a shift. Flips case of letter
# and ignores non-alpha chars.
def mystery_code(someString, shift):
    returnString = ''
    for x in someString:
        if x.isalpha():
            if x.islower():
                returnString += charShift(chr(ord(x) - 32), shift, 65)
            else:
                returnString += charShift(chr(ord(x) + 32), shift, 97)
        else:
            returnString += x
    return returnString

# Helper function for mystery_code
def charShift(someChar, shift, startVal):
    endVal = startVal + 25
    if ord(someChar) + shift <= endVal:
        return chr(ord(someChar) + shift)
    else:
        newShift = (ord(someChar) + shift) % endVal - 1
        return chr(startVal + newShift)

# Splits a list into new lists of 4
def quadruples(someList):
    returnList = []
    counter = 0
    for x in someList:
        if counter % 4 == 0:
            if counter != 0:
                returnList.append(tempList)
            tempList = []
        tempList.append(x)
        counter += 1
    if len(tempList) != 0:
        returnList.append(tempList)
    return returnList

# Takes in a list and changes the tense on each verb passed in according to specific rules
def past_tense(someList):
    returnList = []
    for word in someList:
        if word in ('have', 'be', 'eat', 'go'):
            if word == 'have':
                returnList.append('had')
            elif word == 'be':
                returnList.append('was')
            elif word == 'eat':
                returnList.append('ate')
            else:
                returnList.append('went')
        elif word[-1] == 'e':
            returnList.append(word + 'd')
        elif word[-1] == 'y' and word[-2] in 'aeiou':
            returnList.append(word[:-1] + 'ied')
        elif word[-1] not in 'aeiou' and word[-2] in 'aeiou' and word[-3] not in 'aeiou':
            returnList.append(word + word[-1] + 'ed')
        else:
            returnList.append(word + 'ed')
    return returnList