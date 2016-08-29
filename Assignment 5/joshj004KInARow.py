'''
joshj004KInARow.py
By: Josh Johnson
This is my implementation of  K-in-a-Row with Forbidden Squares.
'''
from time import *
from random import *

currentState = None
winNumber = None
mySide = None
opponentName = None
mRows = None
nColumns = None
openSpaces = []
won = None


def prepare(initial_state, k, what_side_I_play, opponent_nickname):
    global currentState, winNumber, mySide, opponentName, mRows, nColumns, openSpaces
    currentState = initial_state[0]
    winNumber = k
    mySide = what_side_I_play
    opponentName = opponent_nickname
    mRows = len(currentState)
    nColumns = len(currentState[0])
    for x in range(mRows):
        for y in range(nColumns):
            if currentState[x][y] == " ":
                openSpaces.append([x, y])
    return "OK"


def introduce():
    return """This is my K-in-a-Row player, his name is Playa the Player.
It was created by Josh Johnson, UWNetID: joshj004. He is a cocky player
and likes making sarcastic remarks about other players.
    """


def nickname():
    return """Playa"""


def makeMove(inputtedState, currentRemark, timeLimit=10000):
    currentState = inputtedState[0]
    seconds = timeLimit // 1000
    stop = time() + (seconds * 0.99)
    openSpaces = []
    for x in range(mRows):
        for y in range(nColumns):
            if currentState[x][y] == " ":
                openSpaces.append([x, y])
    bestMove = openSpaces[0]
    bestScore = -1 * (10 ** winNumber)
    counter = -1
    while time() < stop:
        counter += 1
        if counter < len(openSpaces):
            tempMove = openSpaces[counter]
            tempState = stateCopier(currentState)
            tempState = moveApplier(tempState, tempMove, mySide)
            tempScore = staticEval(tempState)
            if mySide == 'O':
                tempScore *= -1
            if canWin(tempState, getOpposite(mySide)):
                tempScore = -1 * (10 ** winNumber)
            if tempScore > bestScore:
                bestScore = tempScore
                bestMove = tempMove
        else:
            break
    newState = moveApplier(currentState, bestMove, mySide)
    realNewState = [newState, getOpposite(mySide)]
    return [[bestMove, realNewState], getQuote()]


def staticEval(state):
    points = {}
    global winNumber
    for x in range(winNumber + 1):
        points[x] = 0
    for x in range(mRows):
        xNums = maxOpenLenRow(state, x, True, "X")
        points[xNums] += 1
        oNums = maxOpenLenRow(state, x, True, "O")
        points[oNums] -= 1
    for x in range(nColumns):
        xNums = maxOpenLenCol(state, x, True, "X")
        points[xNums] += 1
        oNums = maxOpenLenCol(state, x, True, "O")
        points[oNums] -= 1
    for x in range(mRows):
        for y in range(nColumns):
            xNums = topLeftBottomRightDiag(state, x, y, True, "X")
            points[xNums] += 1
            oNums = topLeftBottomRightDiag(state, x, y, True, "O")
            points[oNums] -= 1
    for x in range(mRows):
        for y in range(nColumns):
            xNums = topRightBottomLeftDiag(state, x, y, True, "X")
            points[xNums] += 1
            oNums = topRightBottomLeftDiag(state, x, y, True, "O")
            points[oNums] -= 1
    finalNum = 0
    global won
    for x in range(1, winNumber + 1):
        finalNum += points[x] * (10 ** x)
        if x == winNumber:
            if points[x] > 0:
                won = "X"
            elif points[x] < 0:
                won = "O"
            else:
                won = None
    return finalNum


def maxOpenLenRow(someState, rowNum, strict=False, currentSide="X"):
    opposite = getOpposite(currentSide)
    maxCount = 0
    current = 0
    someRow = someState[rowNum]
    for cell in someRow:
        if (cell == opposite or cell == '-') or (strict == True and cell == ' '):
            if current > maxCount:
                maxCount = current
            current = 0
        else:
             current += 1
    if current > maxCount:
                maxCount = current
    return maxCount


def maxOpenLenCol(someState, colNum, strict=False, currentSide="X"):
    opposite = getOpposite(currentSide)
    maxCount = 0
    current = 0
    for row in someState:
        if (row[colNum] == opposite or row[colNum] == '-') or (strict == True and row[colNum] == ' '):
            if current > maxCount:
                maxCount = current
            current = 0
        else:
             current += 1
    if current > maxCount:
                maxCount = current
    return maxCount


def getOpposite(current="X"):
    if current == "X":
        return "O"
    else:
        return "X"


def topLeftBottomRightDiag(someState, x, y, strict=False, currentSide="X"):
    xRemaining = nColumns - x
    yRemaining = mRows - y
    lowestRemaining = min(xRemaining, yRemaining)
    opposite = getOpposite(currentSide)
    maxCount = 0
    current = 0
    for i in range(lowestRemaining):
        if (someState[x][y] == opposite or someState[x][y] == '-') or (strict == True and someState[x][y] == ' '):
            if current > maxCount:
                maxCount = current
            current = 0
        else:
             current += 1
        x += 1
        y += 1
    if current > maxCount:
                maxCount = current
    return maxCount


def topRightBottomLeftDiag(someState, x, y, strict=False, currentSide="X"):
    lowestRemaining = max(x, y)
    opposite = getOpposite(currentSide)
    maxCount = 0
    current = 0
    for i in range(lowestRemaining + 1):
        try:
            if (someState[x][y] == opposite or someState[x][y] == '-') or (strict == True and someState[x][y] == ' '):
                if current > maxCount:
                    maxCount = current
                current = 0
            else:
                 current += 1
            x -= 1
            y += 1
        except IndexError:
            pass
    if current > maxCount:
                maxCount = current
    return maxCount


def stateCopier(state):
    tempState = [row[:] for row in state]
    return tempState


def moveApplier(state, location, side="X"):
    state[location[0]][location[1]] = side
    return state


def canWin(state, side="X"):
    global won
    tempOpenSpaces = openSpaces[:]
    for x in tempOpenSpaces:
        if state[x[0]][x[1]] != " ":
            tempOpenSpaces.remove(x)
    for x in tempOpenSpaces:
        tempState = stateCopier(state)
        tempState = moveApplier(tempState, x, side)
        staticEval(tempState)
        if won == side:
            return True
    return False


def getQuote():
    quotes = ["So this is what playing against a child is like...", "I'd really hate to hear that you're actually trying.", "Maybe one of these days you'll win...NOT!", "I could win this even if I only went 1 ply down.", "This is actually quite sad.", "Now's not the time for fear, that comes later.", "Don't lost hope now, you still have a chance, in your dreams hahaha."]
    return choice(quotes)