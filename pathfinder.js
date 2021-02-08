const WIDTH = 40
const HEIGHT = 25
let nodes = []
class Node {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.gScore = Infinity
        this.h = Infinity
        this.fScore = Infinity
        this.previous = null
        this.closed = false
        nodes.push(this)
    }
}

// returns node asscosiated with passed coordinate
const get_node = (coord) => {
    for (let node of nodes) {
        if (node.x == coord[0] && node.y == coord[1]) {
            return node
        }
    }
}

// h is a heuristic function that estimates the cost of the cheapest path from n to the goal
const h = (node, goal) => {
    let delta_x = goal.x - node.x
    let delta_y = goal.y - node.y
    c = (delta_x ** 2 + delta_y ** 2) ** 0.5
    return c
}

const d = (curr, target) => {
    let delta_x = target.x - curr.x
    let delta_y = target.y - curr.y
    c = (delta_x ** 2 + delta_y ** 2) ** 0.5
    return c
}

// returns adjacent nodes on grid
const get_neighbors = (node) => {
    let neighbors = []
    let adjacent = [
        get_node([node.x, node.y + 1]),
        get_node([node.x, node.y - 1]),
        get_node([node.x + 1, node.y]),
        get_node([node.x - 1, node.y]),
    ]
    for (let n of adjacent) {
        if (typeof (n) != 'undefined' && !n.closed) {
            neighbors.push(n)
        }
    }
    return neighbors
}

// For node n, n.previous is the node immediately preceding it on the cheapest path from start to n currently known
const reconstruct_path = (current) => {
    let total_path = [[current.x, current.y]]
    while (current.previous !== null) {
        total_path.unshift([current.previous.x, current.previous.y])
        current = current.previous
    }
    return total_path
}

// A* algorithm that return a econstruction of the path
const A_Star = (start, goal, h) => {
    let searchNum = 0

    let startN = get_node(start)
    let goalN = get_node(goal)
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    let openSet = [startN]

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    startN.gScore = 0

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.

    startN.fScore = h(startN, goalN)
    while (openSet.length != 0) {
        // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
        // current = the node in openSet having the lowest fScore[] value
        let lowest = Infinity
        let current = null
        for (let node of openSet) {
            if (node.fScore < lowest) {
                lowest = node.fScore
                current = node
            }
        }
        if (current == goalN) {
            return {
                'path': reconstruct_path(current),
                'searchNum': searchNum // aids in animation
            }
        }
        openSet.splice(openSet.indexOf(current), 1)
        let neighbors = get_neighbors(current)
        for (let neighbor of neighbors) {
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            tentative_gScore = current.gScore + d(current, neighbor)
            if (tentative_gScore < neighbor.gScore) {
                // This path to neighbor is better than any previous one. Record it!
                // plots visualiser
                let squares = document.querySelectorAll('.square')
                for (let square of squares) {
                    if (square.getAttribute('x') == neighbor.x && square.getAttribute('y') == neighbor.y && square.id == 'square') {
                        // adds a nice animation via delaying the class change
                        setTimeout(() => {
                            square.classList.add('search')
                        }, searchNum * 5)
                        searchNum++
                    }
                }
                neighbor.previous = current
                neighbor.gScore = tentative_gScore
                neighbor.fScore = neighbor.gScore + h(neighbor, goalN)
                if (!(neighbor in openSet)) {
                    openSet.push(neighbor)
                }
            }
        }
    }
    // Open set is empty but goal was never reached
    return null
}

// creates nodes as a grid
const createGrid = (width, height) => {
    for (let i = 0; i <= width; i++) {
        for (let j = 0; j <= height; j++) {
            new Node(j, i)
        }
    }
}

// creates square as a div element which is used to show a visual of the algorithm
const createSquare = () => {
    let square = document.createElement("div");
    square.classList.add('square')
    square.innerHTML = '&nbsp;'
    square.id = 'square'
    square.addEventListener('click', () => {
        changeSquare(square)
    })
    square.addEventListener('mouseover', () => {
        if (mouseHeld) {
            changeSquare(square)
        }
    })
    document.getElementById('grid').appendChild(square);
    return square;
}

// creates the square used as the start node
const createStart = (square) => {
    let startSquare = document.getElementById('startSquare')
    if (startSquare != null) {
        startSquare.className = 'square'
        startSquare.id = 'square'
    }
    let startCoord = document.getElementById('start')
    startCoord.setAttribute('value', `${square.getAttribute('x')},${square.getAttribute('y')}`)
    square.classList.add('start')
    square.id = 'startSquare'
}

// creates the square used as the end node
const createEnd = (square) => {
    let goalSquare = document.getElementById('goalSquare')
    if (goalSquare != null) {
        goalSquare.className = 'square'
        goalSquare.id = 'square'
    }
    let endCoord = document.getElementById('end')
    endCoord.setAttribute('value', `${square.getAttribute('x')},${square.getAttribute('y')}`)
    square.classList.add('goal')
    square.id = 'goalSquare'
}

// decides what to change a square to eg. wall square to start square
const changeSquare = (square) => {
    if (sDown) {
        createStart(square)
    } else if (eDown) {
        createEnd(square)
    } else if (square.classList.contains('wall')) {
        square.classList.remove('wall')
    } else {
        square.classList.add('wall')
    }
}

// creates nodes then returns path
const run = (start, goal, closedCoords, width, height) => {
    createGrid(height, width)
    for (let i = 0; i < closedCoords.length; i++) {
        let coord = closedCoords[i]
        get_node(coord).closed = true
    }
    let path = A_Star(start, goal, h)
    // clears external stuff for replayability
    nodes.splice(0, nodes.length)
    return path
}

const loadCols = (width) => {
    let columnContainer = document.getElementById('columns')
    for (let i = 0; i < width; i++) {
        let col = document.createElement('div')
        col.classList.add('rowCol')
        col.innerHTML = i
        columnContainer.appendChild(col)
    }
}
const loadrows = (height) => {
    let rowContainer = document.getElementById('rows')
    for (let i = 0; i < height; i++) {
        let row = document.createElement('div')
        row.classList.add('rowCol')
        row.innerHTML = i
        rowContainer.appendChild(row)
    }
}

const reset = () => {
    let Squares = document.querySelectorAll('#square')
    for (let square of Squares) {
        square.className = 'square'
    }
    let startSquare = document.getElementById('startSquare')
    if (startSquare != null) {
        startSquare.className = 'square'
        startSquare.id = 'square'
    }
    let goalSquare = document.getElementById('goalSquare')
    if (goalSquare != null) {
        goalSquare.className = 'square'
        goalSquare.id = 'square'
    }
    let startInput = document.getElementById('start')
    startInput.setAttribute('value', '')
    let endInput = document.getElementById('end')
    endInput.setAttribute('value', '')
}


const drawPath = (path) => {
    let squares = document.querySelectorAll('#square')
    let activeNum = 0
    for (let i = 0; i < path.length; i++) {
        for (let square of squares) {
            if (square.getAttribute('x') == path[i][0] && square.getAttribute('y') == path[i][1]) {
                if (!(square.classList.contains('start')) && !(square.classList.contains('goal'))) {
                    setTimeout(() => {
                        square.classList.remove('search')
                        square.classList.add('active')
                    }, activeNum * 10)
                    activeNum++
                }
            }
        }
    }
}

// handles creating and plotting path and algorithm visualisation
const main = () => {
    let startSquare = document.getElementById('startSquare')
    let goalSquare = document.getElementById('goalSquare')
    let startCoord = [startSquare.getAttribute('x'), startSquare.getAttribute('y')]
    let endCoord = [goalSquare.getAttribute('x'), goalSquare.getAttribute('y')]
    // let squares = document.querySelectorAll('#square')
    let walls = document.querySelectorAll('.square.wall')
    let closedCoords = []
    for (let wall of walls) {
        let coord = [wall.getAttribute('x'), wall.getAttribute('y')]
        closedCoords.push(coord)
    }
    let Path = run(startCoord, endCoord, closedCoords, WIDTH, HEIGHT)
    if (Path != null) {
        path = Path.path
        searchNum = Path.searchNum
        let plot = setInterval(() => {
            let searchSquares = document.querySelectorAll('.square.search')
            if (searchSquares.length == searchNum) {
                drawPath(path)
                clearInterval(plot)
            }
        }, 50)
    }
}

// self explanatory
const loadPage = (width, height) => {
    loadCols(width)
    loadrows(height)
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let square = createSquare()
            square.setAttribute("y", i);
            square.setAttribute("x", j);
        }
    }
    let startBtn = document.getElementById('startBtn')
    startBtn.addEventListener('click', () => {
        main()
    })
    let resetBtn = document.getElementById('reset')
    resetBtn.addEventListener('click', () => {
        reset()
    })

}

// checks wheather a coordinate is entered then plots it
const checkInputs = setInterval(() => {
    let startCoord = document.getElementById('start').value.split(',')
    let endCoord = document.getElementById('end').value.split(',')
    let squares = document.getElementsByClassName('square')
    for (let square of squares) {
        if (square.getAttribute('x') == startCoord[0] && square.getAttribute('y') == startCoord[1] && square.id != 'startSquare') {
            createStart(square)
        }
        if (square.getAttribute('x') == endCoord[0] && square.getAttribute('y') == endCoord[1] && square.id != 'goalSquare') {
            createEnd(square)
        }
    }
}, 100)


// handles drawing of walls
let mouseHeld = false
window.addEventListener('mousedown', () => {
    mouseHeld = true
})
window.addEventListener('mouseup', () => {
    mouseHeld = false
})

// handles plotting start
let sDown = false
window.addEventListener('keydown', (e) => {
    if (e.key == 's') {
        sDown = true
    }
})

// handles plotting end
let eDown = false
window.addEventListener('keydown', (e) => {
    if (e.key == 'e') {
        eDown = true
    }
})

// handles plotting
window.addEventListener('keyup', (e) => {
    sDown = false
    eDown = false
})

window.onload = () => {
    loadPage(WIDTH, HEIGHT)
}