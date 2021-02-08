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

sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

get_node = (coord) => {
    for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i]
        if (n.x == coord[0] && n.y == coord[1]) {
            return n
        }
    }
}

h = (node, goal) => {
    let delta_x = goal.x - node.x
    let delta_y = goal.y - node.y
    c = (delta_x ** 2 + delta_x ** 2) ** 0.5
    return c
}

d = (curr, target) => {
    return 1
}

get_neighbors = (node) => {
    let neighbors = []
    let adjacent = [
        get_node([node.x, node.y + 1]),
        get_node([node.x, node.y - 1]),
        get_node([node.x + 1, node.y]),
        get_node([node.x - 1, node.y]),
    ]
    for (let i = 0; i < adjacent.length; i++) {
        let n = adjacent[i]
        if (typeof (n) != 'undefined' && !n.closed) {
            neighbors.push(n)
        }
    }

    return neighbors
}

// For node n, n.previous is the node immediately preceding it on the cheapest path from start to n currently known.
reconstruct_path = (current) => {
    let total_path = [[current.x, current.y]]
    while (current.previous !== null) {
        total_path.unshift([current.previous.x, current.previous.y])
        current = current.previous
    }
    return total_path
}

let searchNum = 0
A_Star = (start, goal, h) => {

    start = get_node(start)
    goal = get_node(goal)
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    let openSet = [start]

    // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
    start.gScore = 0

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how short a path from start to finish can be if it goes through n.
    start.fScore = h(start, goal)

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
        if (current == goal) {
            return reconstruct_path(current)
        }
        openSet.splice(openSet.indexOf(current), 1)
        let neighbors = get_neighbors(current)
        for (let neighbor of neighbors) {
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            tentative_gScore = current.gScore + d(current, neighbor)
            if (tentative_gScore < neighbor.gScore) {
                // This path to neighbor is better than any previous one. Record it!
                // neighbor.previous = current

                /// added
                let squares = document.getElementsByClassName('square')
                for (let square of squares) {
                    if (square.getAttribute('x') == neighbor.x && square.getAttribute('y') == neighbor.y && square.id == 'square') {
                        // square.className += ' search'
                        setTimeout(() => {
                            square.className += ' search'
                        }, searchNum * 5)
                        searchNum++
                    }
                }
                /// added
                neighbor.previous = current
                neighbor.gScore = tentative_gScore
                neighbor.fScore = neighbor.gScore + h(neighbor, goal)
                if (!(neighbor in openSet)) {
                    openSet.push(neighbor)
                }
            }
        }
    }
    // Open set is empty but goal was never reached
    return "failure"
}


createGrid = (width, height) => {
    for (let i = 0; i <= width; i++) {
        for (let j = 0; j <= height; j++) {
            new Node(j, i)
        }
    }
}

createSquare = () => {
    let square = document.createElement("div");
    square.className = 'square'
    square.innerHTML = '&nbsp;'
    square.id = 'square'
    square.addEventListener('click', () => {
        createWall(square)
    })
    document.getElementById('grid').appendChild(square);
    return square;
}

createWall = (square) => {
    if (square.className.includes('wall')) {
        square.className = square.className.replace(' wall', '')
    } else {
        square.className += ' wall'
    }

}
run = (start, goal, closedCoords, width, height) => {
    createGrid(height, width)

    for (let i = 0; i < closedCoords.length; i++) {
        let coord = closedCoords[i]
        get_node(coord).closed = true
    }

    let path = A_Star(start, goal, h)
    return path
}

loadCols = (width) => {
    let columnContainer = document.getElementById('columns')
    for (let i = 0; i < width; i++) {
        let col = document.createElement('div')
        col.className = 'rowCol'
        col.innerHTML = i
        columnContainer.appendChild(col)
    }
}
loadrows = (height) => {
    let rowContainer = document.getElementById('rows')
    for (let i = 0; i < height; i++) {
        let row = document.createElement('div')
        row.className = 'rowCol'
        row.innerHTML = i
        rowContainer.appendChild(row)
    }
}

// reset = () => {
//     let Squares = document.querySelectorAll('#square')
//     for (let square of Squares) {
//         square.className = 'square'
//     }
//     let startSquare = document.getElementById('startSquare')
//     startSquare.className = 'square'
//     startSquare.id = 'square'
//     let goalSquare = document.getElementById('goalSquare')
//     goalSquare.className = 'square'
//     goalSquare.id = 'square'
// }

main = () => {
    let startCoord = document.getElementById('start').value.split(',')
    let endCoord = document.getElementById('end').value.split(',')
    let squares = document.querySelectorAll('#square')
    let walls = document.getElementsByClassName('square wall')
    let closedCoords = []
    for (let wall of walls) {
        let coord = [wall.getAttribute('x'), wall.getAttribute('y')]
        closedCoords.push(coord)
    } 500
    let path = run(startCoord, endCoord, closedCoords, WIDTH, HEIGHT)
    setInterval(() => {
        let activeNum = 0
        searchSquares = document.getElementsByClassName('square search')
        if (searchSquares.length == searchNum) {
            for (let i = 0; i < path.length; i++) {
                for (let square of squares) {
                    if (square.getAttribute('x') == path[i][0] && square.getAttribute('y') == path[i][1]) {
                        if (!(square.className.includes('start')) && !(square.className.includes('goal'))) {
                            setTimeout(() => {
                                square.className = 'square active'
                            }, activeNum * 20)
                            activeNum++
                        }
                    }
                }
            }
        }
    }, 50)
}

loadPage = (width, height) => {
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
        location.reload()
        // reset()
    })

}

setInterval(() => {
    let startCoord = document.getElementById('start').value.split(',')
    let endCoord = document.getElementById('end').value.split(',')
    let squares = document.getElementsByClassName('square')
    let startSquare = document.getElementById('startSquare')
    let goalSquare = document.getElementById('goalSquare')
    for (let square of squares) {
        if (square.getAttribute('x') == startCoord[0] && square.getAttribute('y') == startCoord[1] && square.id != 'startSquare') {
            square.className += ' start'
            if (startSquare != null) {
                startSquare.className = 'square'
                startSquare.id = 'square'
            }
            square.id = 'startSquare'
        }
        if (square.getAttribute('x') == endCoord[0] && square.getAttribute('y') == endCoord[1] && square.id != 'goalSquare') {
            square.className += ' goal'
            if (goalSquare != null) {
                goalSquare.className = 'square'
                goalSquare.id = 'square'
            }
            square.id = 'goalSquare'
        }
    }
}, 100)

window.onload = () => {
    loadPage(WIDTH, HEIGHT)
}