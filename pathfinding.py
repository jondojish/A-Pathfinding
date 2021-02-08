class Node:
    nodes = []

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.gScore = float("inf")
        self.h = float("inf")
        self.fScore = float("inf")
        self.previous = None
        self.closed = False
        Node.nodes.append(self)


def get_node(coord):
    for n in Node.nodes:
        if n.x == coord[0] and n.y == coord[1]:
            return n


def h(node, goal):
    delta_x = goal.x - node.x
    delta_y = goal.y - node.y
    c = (delta_x ** 2 + delta_x ** 2) ** 0.5
    return c


def d(curr, target):
    return 1


def get_neighbors(node):
    neighbors = []
    adjacent = [
        get_node((node.x, node.y + 1)),
        get_node((node.x, node.y - 1)),
        get_node((node.x + 1, node.y)),
        get_node((node.x - 1, node.y)),
    ]
    for n in adjacent:
        if n is not None and not n.closed:
            neighbors.append(n)
    return neighbors


# For node n, n.previous is the node immediately preceding it on the cheapest path from start to n currently known.
def reconstruct_path(current):
    total_path = [(current.x, current.y)]
    while current.previous is not None:
        total_path.append((current.previous.x, current.previous.y))
        current = current.previous
    return total_path[::-1]


def A_Star(start, goal, h):

    start = get_node(start)
    goal = get_node(goal)
    # The set of discovered nodes that may need to be (re-)expanded.
    # Initially, only the start node is known.
    openSet = {start}

    # For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    start.gScore = 0

    # For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    # how short a path from start to finish can be if it goes through n.
    start.fScore = h(start, goal)

    while len(openSet) != 0:
        # This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        # current = the node in openSet having the lowest fScore[] value
        lowest = float("inf")
        current = None
        for node in openSet:
            if node.fScore < lowest:
                lowest = node.fScore
                current = node
        if current == goal:
            return reconstruct_path(current)
            # return "success"

        openSet.remove(current)
        neighbors = get_neighbors(current)
        for neighbor in neighbors:
            # d(current,neighbor) is the weight of the edge from current to neighbor
            # tentative_gScore is the distance from start to the neighbor through current
            tentative_gScore = current.gScore + d(current, neighbor)
            if tentative_gScore < neighbor.gScore:
                # This path to neighbor is better than any previous one. Record it!
                # neighbor.previous = current
                neighbor.previous = current
                neighbor.gScore = tentative_gScore
                neighbor.fScore = neighbor.gScore + h(neighbor, goal)
                if neighbor not in openSet:
                    openSet.add(neighbor)

    # Open set is empty but goal was never reached
    return "failure"


def create_grid(width, height):
    for i in range(width + 1):
        for j in range(height + 1):
            Node(i, j)


start = (2, 1)
goal = (5, 7)
create_grid(10, 10)

closed = [
    (0, 3),
    (0, 4),
    (1, 6),
    (1, 9),
    (2, 5),
    (2, 7),
    (2, 8),
    (3, 4),
    (4, 3),
    (5, 2),
]
for coord in closed:
    get_node(coord).closed = True

print(A_Star(start, goal, h))
