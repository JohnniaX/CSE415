"""
Josh Johnson
This is a basic sudoku puzzle solver.
CSE 415
"""
'''
A QUIET Solving Tool problem formulation.
QUIET = Quetzal User Intelligence Enhancing Technology.
The XML-like tags used here serve to identify key sections of this 
problem formulation.  

CAPITALIZED constructs are generally present in any problem
formulation and therefore need to be spelled exactly the way they are.
Other globals begin with a capital letter but otherwise are lower
case or camel case.
'''
# <METADATA>
QUIET_VERSION = "0.1"
PROBLEM_NAME = "Basic Sudoku Puzzle"
PROBLEM_VERSION = "0.1"
PROBLEM_AUTHORS = ['J. Johnson']
PROBLEM_CREATION_DATE = "27-APR-2016"
PROBLEM_DESC = \
    '''This is a simple sudoku puzzle that has the numbers 1-9, and
    an empty block represented by 0. The point is to get the fill all 
    the blocks to get to a certain goal state from 0-9.
    '''
# </METADATA>

#<COMMON_CODE>
def DEEP_EQUALS(s1, s2):
    '''
    Compares the two 2D lists by checking if they contain all the elements in exactly the same orderings
    :param s1: The first state
    :param s2: The second state
    :return: Returns a boolean, True if the two states are identical, False othrewise
    '''
    return s1 == s2


def DESCRIBE_STATE(state):
    '''
    :param state: An inputted state
    :return: Returns a str representation of the sudoku grid that can be printed out
    '''
    # Produces a textual description of a state.
    # Might not be needed in normal operation with GUIs.
    txt = "\n"
    for x in range(9):
        for y in range(9):
            txt += str(state[x][y]) + " "
            if y == 2 or y == 5:
                txt += " "
        txt += "\n"
        if x == 2 or x == 5:
            txt += "\n"
    return txt


def HASHCODE(s):
    '''
    Creates an returns a simple hashcode that is unique for each unique game state
    :param s: An inputted state
    :return: Returns an immutable object such as a string that is unique for the state s
    '''
    return str(s)


def copy_state(s):
    '''
    Creates a deep copy of the inputted state and returns it
    :param s: An inputted state
    :return: A deep copy of the state
    '''
    # Performs an appropriately deep copy of a state,
    # for use by operators in creating new states.
    newState = [row[:] for row in s]
    return newState


def can_move(s, position, number):
    '''
    Returns True if the move is legal, False otherwise. Relies on 3 helper methods that check
    the validity of the move. Returns False immediately if the
    :param s: An inputted state
    :param position:
    :param number:
    :return:
    '''
    '''Tests whether it's legal to move a disk in state s
       from the From peg to the To peg.'''
    if s[position[0]][position[1]] == 0:
        return False
    return row_check(s, position, number) and column_check(s, position, number) and grid_check(s, position, number)

def row_check(s, position, number):
    '''
    Checks the rows
    :param s: The state
    :param position: The position
    :param number: The number to be checked
    :return: A boolean
    '''
    return not (number in s[position[0]])


def column_check(s, position, number):
    for i in range(9):
        if s[i][position[1]] == number:
            return False
    return True


def grid_check(s, position, number):
    x = position[0] // 3
    y = position[1] // 3
    numList = []
    for i in range(y * 3, y * 3 + 3):
        for j in range(x * 3, x * 3 + 3):
            numList.append(s[i][j])
    return not (number in numList)


def move(s, position, number):
    '''Assuming it's legal to make the move, this computes
       the new state resulting from moving the topmost disk
       from the From peg to the To peg.'''
    news = copy_state(s)
    news[position[0]][position[1]] = number
    return news


def goal_test(s):
    '''If the first two pegs are empty, then s is a goal state.'''
    for x in range(9):
        for y in range(9):
            if s[x][y] == 0:
                return False
    return True


def goal_message(s):
    return "The Sudoku Puzzle is solved!"


class Operator:
    def __init__(self, name, precond, state_transf):
        self.name = name
        self.precond = precond
        self.state_transf = state_transf

    def is_applicable(self, s):
        return self.precond(s)

    def apply(self, s):
        return self.state_transf(s)

#</COMMON_CODE>

#<INITIAL_STATE>
CREATE_INITIAL_STATE = lambda: [1, 4, 2, 3, 7, 0, 6, 8, 5]
#</INITIAL_STATE>

#<OPERATORS>
peg_combinations = [-3, -1, 1, 3]
OPERATORS = [Operator("Move " + str(peg_combinations[i]) + " steps.",
                      lambda s, position = i: can_move(s, position),
                      # The default value construct is needed
                      # here to capture the values of p&q separately
                      # in each iteration of the list comp. iteration.
                      lambda s, position = i: move(s, position))
             for i in peg_combinations]
#</OPERATORS>

#<GOAL_TEST> (optional)
GOAL_TEST = lambda s: goal_test(s)
#</GOAL_TEST>

#<GOAL_MESSAGE_FUNCTION> (optional)
GOAL_MESSAGE_FUNCTION = lambda s: goal_message(s)
#</GOAL_MESSAGE_FUNCTION>

#<STATE_VIS>
if 'BRYTHON' in globals():
    from TowersOfHanoiVisForBrython import set_up_gui as set_up_user_interface
    from TowersOfHanoiVisForBrython import render_state_svg_graphics as render_state
# if 'TKINTER' in globals(): from TicTacToeVisForTKINTER import set_up_gui
#</STATE_VIS>
