const width = 600;
const height = 500;

// SVG setup
const svg = d3.select('#graph')
    .attr('width', width)
    .attr('height', height);

// Initial graph data
let nodes = generateSmallGraph();
let links = generateLinks(nodes);

// Render groups
const linkGroup = svg.append('g').attr('class', 'links');
const weightGroup = svg.append('g').attr('class', 'weights');
const nodeGroup = svg.append('g').attr('class', 'nodes');
const labelGroup = svg.append('g').attr('class', 'labels');

// State for start and end nodes
let startNode = null;
let endNode = null;
let isRunning = false;
let isPaused = false;
let currentId = null;
let unvisited = null;
let distances = null;
let previous = null;

// Distance output element
const distanceOutput = d3.select('#distanceOutput');
const stopButton = d3.select('#stop');

// Generate a small graph (5 nodes)
function generateSmallGraph() {
    return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
    }));
}

// Generate links for a graph
function generateLinks(nodes) {
    const links = [];
    // Ensure connectivity
    for (let i = 1; i < nodes.length; i++) {
        const randomTarget = nodes[Math.floor(Math.random() * i)];
        links.push({
            source: nodes[i],
            target: randomTarget,
            weight: Math.floor(Math.random() * 10) + 1
        });
    }
    // Add extra random connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() < 0.2 && !links.some(l => (l.source.id === i && l.target.id === j) || (l.source.id === j && l.target.id === i))) {
                links.push({
                    source: nodes[i],
                    target: nodes[j],
                    weight: Math.floor(Math.random() * 10) + 1
                });
            }
        }
    }
    return links;
}

// Dragging behavior
const drag = d3.drag()
    .on('start', (event, d) => {
        d.dragging = true;
    })
    .on('drag', (event, d) => {
        d.x = event.x;
        d.y = event.y;
        updateGraph();
    })
    .on('end', (event, d) => {
        setTimeout(() => { d.dragging = false; }, 100);
    });

// Update visualization
function updateGraph() {
    // Links
    const linkSel = linkGroup.selectAll('.link')
        .data(links, d => `${d.source.id}-${d.target.id}`);
    linkSel.exit().remove();
    linkSel.enter()
        .append('line')
        .attr('class', 'link')
        .merge(linkSel)
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    // Weights
    const weightSel = weightGroup.selectAll('.weight')
        .data(links, d => `${d.source.id}-${d.target.id}`);
    weightSel.exit().remove();
    weightSel.enter()
        .append('text')
        .attr('class', 'weight')
        .merge(weightSel)
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)
        .text(d => d.weight);

    // Nodes
    const nodeSel = nodeGroup.selectAll('.node')
        .data(nodes, d => d.id);
    nodeSel.exit().remove();
    nodeSel.enter()
        .append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('dblclick', handleDoubleClick)
        .call(drag)
        .merge(nodeSel)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    // Node labels
    const labelSel = labelGroup.selectAll('.node-label')
        .data(nodes, d => d.id);
    labelSel.exit().remove();
    labelSel.enter()
        .append('text')
        .attr('class', 'node-label')
        .merge(labelSel)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.id);
}

// Initial render
updateGraph();
distanceOutput.text('Double-click a node to set the starting point.');

// Add node functionality
d3.select('#addNode').on('click', () => {
    const newNode = {
        id: nodes.length,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
    };
    nodes.push(newNode);

    // Ensure at least one connection
    const randomTarget = nodes[Math.floor(Math.random() * (nodes.length - 1))];
    links.push({
        source: newNode,
        target: randomTarget,
        weight: Math.floor(Math.random() * 10) + 1
    });

    // Add up to 1 extra connection
    const numExtraConnections = Math.floor(Math.random() * 2);
    const shuffledNodes = [...nodes.slice(0, -1)].sort(() => Math.random() - 0.5);
    shuffledNodes.slice(0, numExtraConnections).forEach(target => {
        if (target !== randomTarget && !links.some(l => (l.source.id === newNode.id && l.target.id === target.id) || (l.source.id === target.id && l.target.id === newNode.id))) {
            links.push({
                source: newNode,
                target,
                weight: Math.floor(Math.random() * 10) + 1
            });
        }
    });

    updateGraph();
});

// Reset functionality
d3.select('#reset').on('click', () => {
    startNode = null;
    endNode = null;
    isRunning = false;
    isPaused = false;
    stopButton.text('Stop').classed('resume', false);
    nodeGroup.selectAll('.node').classed('start', false).classed('end', false).classed('visited', false).classed('path', false);
    linkGroup.selectAll('.link').classed('visited', false).classed('path', false);
    distanceOutput.text('Double-click a node to set the starting point.');
});

// Restart functionality
d3.select('#restart').on('click', () => {
    nodes = generateSmallGraph();
    links = generateLinks(nodes);
    startNode = null;
    endNode = null;
    isRunning = false;
    isPaused = false;
    stopButton.text('Stop').classed('resume', false);
    nodeGroup.selectAll('.node').remove();
    linkGroup.selectAll('.link').remove();
    weightGroup.selectAll('.weight').remove();
    labelGroup.selectAll('.node-label').remove();
    updateGraph();
    distanceOutput.text('Double-click a node to set the starting point.');
});

// Stop/Resume functionality
d3.select('#stop').on('click', () => {
    if (isPaused) {
        isPaused = false;
        stopButton.text('Stop').classed('resume', false);
        distanceOutput.text('Resuming algorithm...');
        runDijkstra(); // Resume from where it left off
    } else {
        isRunning = false;
        isPaused = true;
        stopButton.text('Resume').classed('resume', true);
        distanceOutput.text('Algorithm paused. Click "Resume" to continue.');
    }
});

// Handle double-click (start or end node)
function handleDoubleClick(event, d) {
    if (d.dragging) return;

    if (!startNode) {
        startNode = d;
        nodeGroup.selectAll('.node').classed('start', false);
        d3.select(this).classed('start', true);
        distanceOutput.text(`Starting from Node ${startNode.id}`);
    } else if (!endNode && d !== startNode) {
        endNode = d;
        nodeGroup.selectAll('.node').classed('end', false);
        d3.select(this).classed('end', true);
        runDijkstra();
    } else {
        // Reset if both are set and a new double-click occurs
        startNode = d;
        endNode = null;
        isRunning = false;
        isPaused = false;
        stopButton.text('Stop').classed('resume', false);
        nodeGroup.selectAll('.node').classed('start', false).classed('end', false).classed('visited', false).classed('path', false);
        linkGroup.selectAll('.link').classed('visited', false).classed('path', false);
        d3.select(this).classed('start', true);
        distanceOutput.text(`Starting from Node ${startNode.id}`);
    }
}

// Dijkstra's algorithm with total distance display
async function runDijkstra() {
    if (!startNode || !endNode) return;

    isRunning = true;

    // Initialize or resume state
    if (!distances || !unvisited || !previous) {
        distances = new Map(nodes.map(n => [n.id, Infinity]));
        previous = new Map(nodes.map(n => [n.id, null]));
        unvisited = new Set(nodes.map(n => n.id));
        distances.set(startNode.id, 0);
        currentId = startNode.id;
    }

    while (unvisited.size > 0 && isRunning) {
        if (isPaused) return; // Pause if requested

        const current = nodes.find(n => n.id === currentId);

        if (current === endNode) break;

        unvisited.delete(currentId);
        // Only apply visited class if the node is not start or end
        if (current !== startNode && current !== endNode) {
            nodeGroup.selectAll('.node').filter(d => d.id === currentId).classed('visited', true);
        }

        const neighbors = links.filter(l => l.source.id === currentId || l.target.id === currentId)
            .map(l => l.source.id === currentId ? l.target : l.source);

        for (const neighbor of neighbors) {
            if (!unvisited.has(neighbor.id)) continue;

            const link = links.find(l => (l.source.id === currentId && l.target.id === neighbor.id) || 
                                        (l.target.id === currentId && l.source.id === neighbor.id));
            const newDist = distances.get(currentId) + link.weight;

            if (newDist < distances.get(neighbor.id)) {
                distances.set(neighbor.id, newDist);
                previous.set(neighbor.id, current);

                linkGroup.selectAll('.link')
                    .filter(d => (d.source.id === currentId && d.target.id === neighbor.id) || 
                                (d.target.id === currentId && d.source.id === neighbor.id))
                    .classed('visited', true);
            }
        }

        // Find the next unvisited node with the smallest distance
        if (unvisited.size > 0) {
            currentId = [...unvisited].reduce((minId, id) => {
                if (distances.get(id) < distances.get(minId)) return id;
                return minId;
            }, [...unvisited][0]);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isRunning) return;

    // Trace and highlight the shortest path
    let pathNode = endNode;
    const pathNodes = [];
    while (pathNode !== startNode && isRunning) {
        if (isPaused) return; // Pause if requested

        pathNodes.unshift(pathNode.id);
        // Only apply path class if the node is not start or end
        if (pathNode !== startNode && pathNode !== endNode) {
            nodeGroup.selectAll('.node').filter(d => d.id === pathNode.id).classed('visited', false).classed('path', true);
        }
        const prevNode = previous.get(pathNode.id);
        linkGroup.selectAll('.link')
            .filter(d => (d.source.id === pathNode.id && d.target.id === prevNode.id) || 
                        (d.target.id === pathNode.id && d.source.id === prevNode.id))
            .classed('visited', false).classed('path', true);
        pathNode = prevNode;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (isRunning) {
        pathNodes.unshift(startNode.id);
        const totalDistance = distances.get(endNode.id);
        distanceOutput.text(`Path: ${pathNodes.join(' -> ')}\nTotal Distance: ${totalDistance === Infinity ? 'No path exists' : totalDistance}`);
    }

    // Reset state after completion
    distances = null;
    unvisited = null;
    previous = null;
    currentId = null;
}