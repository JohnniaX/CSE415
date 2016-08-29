'''MDP.py
S. Tanimoto, May 2016.

Provides representations for Markov Decision Processes, plus
functionality for running the transitions.

The transition function should be a function of three arguments:
T(s, a, sp), where s and sp are states and a is an action.
The reward function should also be a function of the three same
arguments.  However, its return value is not a probability but
a numeric reward value -- any real number.

operators:  state-space search objects consisting of a precondition
 and deterministic state-transformation function.
 We assume these are in the "QUIET" format used in earlier assignments.

actions:  objects (for us just Python strings) that are 
 stochastically mapped into operators at runtime according 
 to the Transition function.


Status:
 As of May 14 at 11:00 AM:
   Basic methods have been prototyped.


'''
import random

REPORTING = True

class MDP:
    def __init__(self):
        self.known_states = set()
        self.succ = {} # hash of adjacency lists by state.
        self.V = {}
        self.QValues = {}
        self.optPolicy = {}

    def register_start_state(self, start_state):
        self.start_state = start_state
        self.known_states.add(start_state)

    def register_actions(self, action_list):
        self.actions = action_list

    def register_operators(self, op_list):
        self.ops = op_list

    def register_transition_function(self, transition_function):
        self.T = transition_function

    def register_reward_function(self, reward_function):
        self.R = reward_function

    def state_neighbors(self, state):
        '''Return a list of the successors of state.  First check
           in the hash self.succ for these.  If there is no list for
           this state, then construct and save it.
           And then return the neighbors.'''
        neighbors = self.succ.get(state, False)
        if neighbors==False:
            neighbors = [op.apply(state) for op in self.ops if op.is_applicable(state)]
            self.succ[state]=neighbors
            self.known_states.update(neighbors)
        return neighbors

    def random_episode(self, nsteps):
        self.current_state = self.start_state
        self.current_reward = 0.0
        for i in range(nsteps):
            self.take_action(random.choice(self.actions))
            if self.current_state == 'DEAD':
                print('Terminating at DEAD state.')
                break
        if REPORTING: print("Done with "+str(i)+" of random exploration.")

    def take_action(self, a):
        s = self.current_state
        neighbors = self.state_neighbors(s)
        threshold = 0.0
        rnd = random.uniform(0.0, 1.0)
        r = 0
        for sp in neighbors:
            threshold += self.T(s, a, sp)
            if threshold>rnd:
                r = self.R(s, a, sp)
                break
        self.current_state = sp
        if REPORTING: print("After action "+a+", moving to state "+str(sp)+\
                            "; reward is "+str(r))

    # MDP Enhancements" #1 Part 1
    def generateAllStates(self):
        OPEN = [self.start_state]
        CLOSED = []

        while OPEN != []:
            S = OPEN[0]
            del OPEN[0]
            self.known_states.add(S)
            CLOSED.append(S)

            L = []
            for op in self.ops:
                if op.is_applicable(S):
                    new_state = op.apply(S)
                    neighbors = self.state_neighbors(new_state)
                    for neighbor in neighbors:
                        if neighbor not in CLOSED:
                            L.append(new_state)
                    if new_state not in CLOSED:
                        L.append(new_state)

            for s2 in L:
                for i in range(len(OPEN)):
                    if s2 == OPEN[i]:
                        del OPEN[i]
                        break

            OPEN = OPEN + L
        for x in range(4):
            for y in range(4):
                self.known_states.add((x, y))

    # MDP Enhancements" #1 Part 2
    def ValueIterations(self, discount, niterations):
        self.generateAllStates()
        for state in self.known_states:
            self.V[state] = 0
        if niterations < 1:
            return
        self.V[(3,2)] = 1.0
        self.V[(3,1)] = -1.0
        niterations -= 1
        for i in range(niterations):
            for state in self.known_states:
                if state != (3,2) and state != (3,1):
                    self.V[state] = self.getStateNewValue(state, discount)

    def getNeighborOperator(self, state):
        neighbors = self.state_neighbors(state)
        neighborVal = -100
        valuableNeighbor = None
        for neighbor in neighbors:
            if self.V[neighbor] > neighborVal:
                neighborVal = self.V[neighbor]
                valuableNeighbor = neighbor
        if state == "DEAD": return "DEAD"
        if (state[0], state[1] + 1) == valuableNeighbor: return "North"
        elif (state[0], state[1] - 1) == valuableNeighbor: return "South"
        elif (state[0] + 1, state[1]) == valuableNeighbor: return "East"
        elif (state[0] - 1, state[1]) == valuableNeighbor: return "West"
        else: return "ERROR"

    def getStateNewValue(self, state, discount):
        operator = self.getNeighborOperator(state)
        if operator == "DEAD": return 0
        if operator == "North":
            primary = (state[0], state[1] + 1)
            secondary1 = (state[0] + 1, state[1])
            secondary2 = (state[0] - 1, state[1])
        elif operator == "South":
            primary = (state[0], state[1] - 1)
            secondary1 = (state[0] + 1, state[1])
            secondary2 = (state[0] - 1, state[1])
        elif operator == "East":
            primary = (state[0] + 1, state[1])
            secondary1 = (state[0], state[1] + 1)
            secondary2 = (state[0], state[1] - 1)
        elif operator == "West":
            primary = (state[0] - 1, state[1])
            secondary1 = (state[0], state[1] + 1)
            secondary2 = (state[0], state[1] - 1)
        else:
            raise RuntimeError
        if 0 < primary[0] < 4 and 0 < primary[1] < 4:
            primaryVal = self.V[primary]
        else:
            primaryVal = 0
        if 0 < secondary1[0] < 4 and 0 < secondary1[1] < 4:
            secondary1Val = self.V[secondary1]
        else:
            secondary1Val = 0
        if 0 < secondary2[0] < 4 and 0 < secondary2[1] < 4:
            secondary2Val = self.V[secondary2]
        else:
            secondary2Val = 0
        return 0.8 * (primaryVal * discount) + 0.1 * (secondary1Val * discount) + 0.1 * (secondary2Val * discount)

    # "Q-Learning" #3
    def QLearning(self, discount, nEpisodes, epsilon):
        for state in self.known_states:
            for op in self.ops:
                self.QValues[(state, op)] = 0
                if state == (3,2):
                    self.QValues[(state, op)] = 1.0
                if state == (3,1):
                    self.QValues[(state, op)] = -1.0
        for i in range(nEpisodes):
            current_state = self.start_state
            while current_state != "DEAD":
                if current_state == (3,2) or current_state == (3,1):
                    new_state = "DEAD"
                else:
                    randNum = random.randint(1, 100)
                    moveOp = self.getNeighborOperator(current_state)
                    if randNum <= int(epsilon * 100):
                        moveOp = random.choice(["North", "South", "East", "West"])
                    new_state = self.getNewState(current_state, moveOp)
                    if current_state != new_state:
                        maxVal = self.getMaxValue(new_state)
                        oldVal = self.QValues[(current_state, self.getOp(moveOp))]
                        self.QValues[(current_state, self.getOp(moveOp))] = maxVal * epsilon + discount * oldVal
                current_state = new_state

    def getNewState(self, state, direction):
        if direction == "North":
            if state[1] + 1 > 3:
                return state
            else:
                return (state[0], state[1] + 1)
        elif direction == "South":
            if state[1] - 1 < 0:
                return state
            else:
                return (state[0], state[1] - 1)
        elif direction == "East":
            if state[0] + 1 > 3:
                return state
            else:
                return (state[0] + 1, state[1])
        elif direction == "West":
            if state[0] - 1 < 0:
                return state
            else:
                return (state[0] - 1, state[1])
        else:
            raise RuntimeError

    def getMaxValue(self, state):
        currentMax = -1000
        if state == (3,2): return 1.0
        elif state == (3,1): return -1.0
        elif state == "DEAD": return 0
        for op in self.ops:
            if self.QValues[state, op] > currentMax:
                currentMax = self.QValues[state, op]
        return currentMax

    # "Learned Optimal Policy" #4
    def extractPolicy(self):
        for state in self.known_states:
            bestOp = None
            bestVal = -1000
            for op in self.ops:
                value = self.QValues[(state, op)]
                if value > bestVal:
                    bestVal = value
                    bestOp = op
            self.optPolicy[state] = bestOp

    def getOp(self, direction):
        name = "Move " + direction + " if Possible"
        for op in self.ops:
            if op.name == name:
                return op