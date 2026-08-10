// Random binary tree generation + layout for the Morris visualizer.
// Nodes are labeled in-order 1..N, so the tree is a valid BST and the
// traversal output is just 1, 2, ..., N. Layout uses the in-order rank as
// the x column and depth as y, so every thread spans exactly one column.

export const MIN_NODES = 10;
export const MAX_NODES = 15;
export const MIN_HEIGHT = 3;
export const MAX_HEIGHT = 5;
export const MIN_TWO_CHILD_NODES = 2; // nodes having both children
export const MIN_LEFT_CHILDREN = 3;   // nodes having a left child
export const MIN_RIGHT_CHILDREN = 3;  // nodes having a right child
const MAX_ATTEMPTS = 2000;

// Layout constants (viewBox units)
export const X_GAP = 58;
export const Y_GAP = 66;
export const NODE_R = 19;
export const PAD = 48;

const buildShape = (nodeCount) => {
    const make = (n) => {
        if (n === 0) return null;
        const leftCount = Math.floor(Math.random() * n); // 0..n-1
        const rightCount = n - 1 - leftCount;
        return { value: 0, left: make(leftCount), right: make(rightCount) };
    };
    return make(nodeCount);
};

const analyze = (root) => {
    let height = 0;
    let twoChild = 0;
    let leftChildren = 0;
    let rightChildren = 0;
    const walk = (node, depth) => {
        if (!node) return;
        height = Math.max(height, depth + 1);
        if (node.left && node.right) twoChild++;
        if (node.left) leftChildren++;
        if (node.right) rightChildren++;
        walk(node.left, depth + 1);
        walk(node.right, depth + 1);
    };
    walk(root, 0);
    return { height, twoChild, leftChildren, rightChildren };
};

const meetsConstraints = (root) => {
    const { height, twoChild, leftChildren, rightChildren } = analyze(root);
    return (
        height >= MIN_HEIGHT &&
        height <= MAX_HEIGHT &&
        twoChild >= MIN_TWO_CHILD_NODES &&
        leftChildren >= MIN_LEFT_CHILDREN &&
        rightChildren >= MIN_RIGHT_CHILDREN
    );
};

// Label nodes in-order with 1..N (also the node's unique id)
const labelInOrder = (root) => {
    let next = 1;
    const walk = (node) => {
        if (!node) return;
        walk(node.left);
        node.value = next++;
        walk(node.right);
    };
    walk(root);
};

export const generateTree = () => {
    const nodeCount =
        MIN_NODES + Math.floor(Math.random() * (MAX_NODES - MIN_NODES + 1));
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const root = buildShape(nodeCount);
        if (meetsConstraints(root)) {
            labelInOrder(root);
            return root;
        }
    }
    // Practically unreachable; accept whatever shape we last built
    const root = buildShape(nodeCount);
    labelInOrder(root);
    return root;
};

// Assign x/y positions; returns everything the renderer needs.
export const layoutTree = (root) => {
    const nodes = [];
    const byValue = new Map();
    let column = 0;
    let maxDepth = 0;

    const assign = (node, depth) => {
        if (!node) return;
        assign(node.left, depth + 1);
        node.x = PAD + column * X_GAP;
        node.y = PAD + depth * Y_GAP;
        node.depth = depth;
        column++;
        maxDepth = Math.max(maxDepth, depth);
        nodes.push(node);
        byValue.set(node.value, node);
        assign(node.right, depth + 1);
    };
    assign(root, 0);

    // output row sits below the tree, each value under its node's column
    const outputY = PAD + (maxDepth + 1) * Y_GAP + 6;
    const width = PAD * 2 + (nodes.length - 1) * X_GAP;
    const height = outputY + PAD;

    return { nodes, byValue, width, height, maxDepth, outputY, centerX: width / 2 };
};
