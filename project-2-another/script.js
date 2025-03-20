
const width = 600;
const height = 500;

const svg = d3.select('#graph')
    .attr('width', width)
    .attr('height', height);

let nodes = generateSmallGraph();
let links = generateLinks(nodes);

const linkGroup = svg.append('g').attr('class', 'links');
const weightGroup = svg.append('g').attr('class', 'weights');
const nodeGroup = svg.append('g').attr('class', 'nodes');
const labelGroup = svg.append('g').attr('class', 'labels');

let startNode = null;
let endNode = null;
let isRunning = false;
let isPaused = false;
let currentId = null;
let unvisited = null;
let distances = null;
let previous = null;

const distanceOutput = d3.select('#distanceOutput');
const stopButton = d3.select('#stop');

function generateSmallGraph() {
    return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
    }));
}

function generateLinks(nodes) {
    const links = [];
    for (let i = 1; i < nodes.length; i++) {
        const randomTarget = nodes[Math.floor(Math.random() * i)];
        const dx = randomTarget.x - nodes[i].x;
        const dy = randomTarget.y - nodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        links.push({
            source: nodes[i],
            target: randomTarget,
            weight: Math.round(distance / 10)
        });
    }
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() < 0.2 && !links.some(l => 
                (l.source.id === i && l.target.id === j) || 
                (l.source.id === j && l.target.id === i))) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                links.push({
                    source: nodes[i],
                    target: nodes[j],
                    weight: Math.round(distance / 10)
                });
            }
        }
    }
    return links;
}

const drag = d3.drag()
    .on('start', (event, d) => {
        d.dragging = true;
    })
    .on('drag', (event, d) => {
        d.x = event.x;
        d.y = event.y;
        links.forEach(link => {
            if (link.source === d || link.target === d) {
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                link.weight = Math.round(Math.sqrt(dx * dx + dy * dy) / 10);
            }
        });
        updateGraph();
    })
    .on('end', (event, d) => {
        setTimeout(() => { d.dragging = false; }, 100);
    });

function updateGraph() {
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

updateGraph();
distanceOutput.text('Double-click a node to set the starting point.');

d3.select('#addNode').on('click', () => {
    const newNode = {
        id: nodes.length,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
    };
    nodes.push(newNode);

    const randomTarget = nodes[Math.floor(Math.random() * (nodes.length - 1))];
    const dx = randomTarget.x - newNode.x;
    const dy = randomTarget.y - newNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    links.push({
        source: newNode,
        target: randomTarget,
        weight: Math.round(distance / 10)
    });

    const numExtraConnections = Math.floor(Math.random() * 2);
    const shuffledNodes = [...nodes.slice(0, -1)].sort(() => Math.random() - 0.5);
    shuffledNodes.slice(0, numExtraConnections).forEach(target => {
        if (target !== randomTarget && !links.some(l => 
            (l.source.id === newNode.id && l.target.id === target.id) || 
            (l.source.id === target.id && l.target.id === newNode.id))) {
            const dx = target.x - newNode.x;
            const dy = target.y - newNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            links.push({
                source: newNode,
                target,
                weight: Math.round(distance / 10)
            });
        }
    });

    updateGraph();
});

d3.select('#reset').on('click', () => {
    startNode = null;
    endNode = null;
    isRunning = false;
    isPaused = false;
    stopButton.text('Stop').classed('resume', false);
    nodeGroup.selectAll('.node')
        .classed('start', false)
        .classed('end', false)
        .classed('visited', false)
        .classed('path', false)
        .classed('dimmed', false);
    linkGroup.selectAll('.link')
        .classed('visited', false)
        .classed('path', false)
        .classed('dimmed', false);
    distanceOutput.text('Double-click a node to set the starting point.');
});

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

d3.select('#stop').on('click', () => {
    if (isPaused) {
        isPaused = false;
        stopButton.text('Stop').classed('resume', false);
        distanceOutput.text('Resuming algorithm...');
        runDijkstra();
    } else {
        isRunning = false;
        isPaused = true;
        stopButton.text('Resume').classed('resume', true);
        distanceOutput.text('Algorithm paused. Click "Resume" to continue.');
    }
});

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
        startNode = d;
        endNode = null;
        isRunning = false;
        isPaused = false;
        stopButton.text('Stop').classed('resume', false);
        nodeGroup.selectAll('.node').classed('start', false).classed('end', false).classed('visited', false).classed('path', false).classed('dimmed', false);
        linkGroup.selectAll('.link').classed('visited', false).classed('path', false).classed('dimmed', false);
        d3.select(this).classed('start', true);
        distanceOutput.text(`Starting from Node ${startNode.id}`);
    }
}

async function runDijkstra() {
    if (!startNode || !endNode) return;

    isRunning = true;


    nodeGroup.selectAll('.node')
        .classed('dimmed', d => d !== startNode && d !== endNode);
    linkGroup.selectAll('.link')
        .classed('dimmed', true);

    if (!distances || !unvisited || !previous) {
        distances = new Map(nodes.map(n => [n.id, Infinity]));
        previous = new Map(nodes.map(n => [n.id, null]));
        unvisited = new Set(nodes.map(n => n.id));
        distances.set(startNode.id, 0);
        currentId = startNode.id;
    }

    while (unvisited.size > 0 && isRunning) {
        if (isPaused) return;

        const current = nodes.find(n => n.id === currentId);

        if (current === endNode) break;

        unvisited.delete(currentId);
        if (current !== startNode && current !== endNode) {
            nodeGroup.selectAll('.node')
                .filter(d => d.id === currentId)
                .classed('visited', true)
                .classed('dimmed', false);
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
                    .classed('visited', true)
                    .classed('dimmed', false);
            }
        }

        if (unvisited.size > 0) {
            currentId = [...unvisited].reduce((minId, id) => {
                if (distances.get(id) < distances.get(minId)) return id;
                return minId;
            }, [...unvisited][0]);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isRunning) return;

    let pathNode = endNode;
    const pathNodes = [];
    while (pathNode !== startNode && isRunning) {
        if (isPaused) return;

        pathNodes.unshift(pathNode.id);
        if (pathNode !== startNode && pathNode !== endNode) {
            nodeGroup.selectAll('.node')
                .filter(d => d.id === pathNode.id)
                .classed('visited', false)
                .classed('path', true)
                .classed('dimmed', false);
        }
        const prevNode = previous.get(pathNode.id);
        linkGroup.selectAll('.link')
            .filter(d => (d.source.id === pathNode.id && d.target.id === prevNode.id) || 
                        (d.target.id === pathNode.id && d.source.id === prevNode.id))
            .classed('visited', false)
            .classed('path', true)
            .classed('dimmed', false);
        pathNode = prevNode;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (isRunning) {
        pathNodes.unshift(startNode.id);
        const totalDistance = distances.get(endNode.id);
        distanceOutput.text(`Path: ${pathNodes.join(' -> ')}\nTotal Distance: ${totalDistance === Infinity ? 'No path exists' : totalDistance}`);
        nodeGroup.selectAll('.node').classed('dimmed', false);
        linkGroup.selectAll('.link').classed('dimmed', false);
    }

    distances = null;
    unvisited = null;
    previous = null;
    currentId = null;
}