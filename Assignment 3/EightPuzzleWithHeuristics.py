"""
Josh Johnson
This is a the basic 8 puzzle with heuristics.
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
import math
# <METADATA>
QUIET_VERSION = "0.1"
PROBLEM_NAME = "Basic Eight Puzzle"
PROBLEM_VERSION = "0.1"
PROBLEM_AUTHORS = ['J. Johnson']
PROBLEM_CREATION_DATE = "18-APR-2016"
PROBLEM_DESC = \
    '''This is a simple 8 tile puzzle that has the numbers 1-9, and
    an empty tile represented by 0. The point is to get the tiles in a
    certain goal state from 0-9.
    '''
# </METADATA>

#<COMMON_CODE>
def DEEP_EQUALS(s1, s2):
    result = s1[0] == s2[0] and s1[1] == s2[1] and s1[2] == s2[2] and s1[3] == s2[3] and s1[4] == s2[4] \
             and s1[5] == s2[5] and s1[6] == s2[6] and s1[7] == s2[7] and s1[8] == s2[8]
    return result


def DESCRIBE_STATE(state):
    # Produces a textual description of a state.
    # Might not be needed in normal operation with GUIs.
    txt = "\n"
    for element in [0, 3, 6]:
        txt += str(state[element]) + ' ' + str(state[element + 1]) + ' ' + str(state[element + 2]) + "\n"
    return txt


def HASHCODE(s):
    '''The result should be an immutable object such as a string
    that is unique for the state s.'''
    return str(s[0]) + ';' + str(s[1]) + ';' + str(s[2]) + ';' + str(s[3]) + ';' + str(s[4]) + \
    str(s[5]) + ';' + str(s[6]) + ';' + str(s[7]) + ';' + str(s[8]) + ';'


def copy_state(s):
    # Performs an appropriately deep copy of a state,
    # for use by operators in creating new states.
    return s[:]


def can_move(s, position):
    '''Tests whether it's legal to move a disk in state s
       from the From peg to the To peg.'''
    try:
        zero = s.index(0)
        if zero + position > 8 or zero + position < 0:
            return False
        if zero % 3 == 0 and position == -1:
            return False
        if zero % 3 == 2 and position == 1:
            return False
        return True
    except (Exception) as e:
        print(e)


def move(s, position):
    '''Assuming it's legal to make the move, this computes
       the new state resulting from moving the topmost disk
       from the From peg to the To peg.'''
    news = copy_state(s)
    zero = s.index(0)
    oldLocation = zero + position
    news[zero] = s[oldLocation ]
    news[oldLocation ] = 0
    return news


def goal_test(s):
    '''If the first two pegs are empty, then s is a goal state.'''
    finalState = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    return DEEP_EQUALS(s, finalState)


def goal_message(s):
    return "The Eight Puzzle is solved!"


def e_distance(s, num):
    if s[num] == num:
        return 0
    location = s.index(num)
    vertical = vertical_offset(location, num)
    horizontal = horizontal_offset(location, num)
    return math.sqrt(vertical ** 2 + horizontal ** 2)


def vertical_offset(location, num):
    return abs((location % 3) - (num % 3))


def horizontal_offset(location, num):
    return abs((location // 3) - (num // 3))


def h_euclidean(s):
    distance = 0
    for i in range(9):
        distance += e_distance(s, i)
    return distance


def h_hamming(s):
    count = 0
    for i in range(9):
        if s[i] != i:
            count += 1
    return count

def h_manhattan(s):
    distance = 0
    for i in range(9):
        location = s.index(i)
        distance += vertical_offset(location, i)
        distance += horizontal_offset(location, i)
    return distance

def h_custom(s):
    return (h_euclidean(s) + h_hamming(s) + h_manhattan(s)) // 3


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


HEURISTICS = {'h_euclidean': h_euclidean, 'h_hamming':h_hamming,
    'h_manhattan':h_manhattan, 'h_custom':h_custom}