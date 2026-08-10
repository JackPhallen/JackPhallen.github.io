// Builds the animation trace for Morris in-order traversal. Each step is a
// full snapshot (not a delta), so stepping backwards just renders snapshot[i-1].
// codeLine values index into pseudocode.js and must stay in sync with it.

export const buildTrace = (root, byValue) => {
    const steps = [];
    // the tree is never mutated; this map stands in for rewritten pred.right pointers
    const threads = new Map();
    const visited = [];

    const snapshot = (fields) => {
        steps.push({
            curr: null,
            pred: null,
            threads: [...threads.entries()],
            visited: [...visited],
            justVisited: null,
            activeThread: null,
            predEdge: null,
            codeLine: null,
            desc: '',
            done: false,
            ...fields,
        });
    };

    // thread-aware right child: what "pred.right" means mid-algorithm
    const rightOf = (node) =>
        threads.has(node.value) ? byValue.get(threads.get(node.value)) : node.right;

    snapshot({
        desc: 'Morris traversal: in-order traversal with O(1) extra space. ' +
            'Instead of a stack, we temporarily thread rightmost nodes back to their successor. ' +
            'Press [Step ▶] or [Space] to begin.',
    });

    let curr = root;
    snapshot({
        codeLine: 1,
        curr: curr.value,
        desc: `curr ← root (${curr.value})`,
    });

    while (curr) {
        snapshot({
            codeLine: 3,
            curr: curr.value,
            desc: curr.left
                ? `${curr.value} has a left child → find its in-order predecessor`
                : `${curr.value} has no left child`,
        });

        if (!curr.left) {
            // no left subtree: visit, then move right
            visited.push(curr.value);
            snapshot({
                codeLine: 4,
                curr: curr.value,
                justVisited: curr.value,
                desc: `visit ${curr.value} → output: [${visited.join(', ')}]`,
            });

            const following = threads.has(curr.value)
                ? [curr.value, threads.get(curr.value)]
                : null;
            const target = following ? byValue.get(following[1]) : curr.right;
            curr = target;
            snapshot({
                codeLine: 5,
                curr: curr ? curr.value : null,
                activeThread: following,
                desc: following
                    ? `curr ← curr.right — this right pointer is a thread! Climb it back up to ${following[1]}`
                    : curr
                        ? `curr ← curr.right (${curr.value})`
                        : 'curr ← curr.right (null) — nothing left to process',
            });
        } else {
            // find pred: rightmost node of the left subtree
            let pred = curr.left;
            snapshot({
                codeLine: 7,
                curr: curr.value,
                pred: pred.value,
                desc: `pred ← curr.left (${pred.value}) — walk right to find the rightmost node`,
            });
            let predRight = rightOf(pred);
            while (predRight && predRight !== curr) {
                const from = pred.value;
                pred = predRight;
                predRight = rightOf(pred);
                snapshot({
                    codeLine: 10,
                    curr: curr.value,
                    pred: pred.value,
                    predEdge: [from, pred.value],
                    desc: `pred walks right → ${pred.value}`,
                });
            }

            if (!predRight) {
                // first visit to curr: create thread, descend left
                threads.set(pred.value, curr.value);
                snapshot({
                    codeLine: 12,
                    curr: curr.value,
                    pred: pred.value,
                    desc: `pred.right is null → first time at ${curr.value}. ` +
                        `Create thread ${pred.value} ⇢ ${curr.value} so we can climb back later.`,
                });
                curr = curr.left;
                snapshot({
                    codeLine: 13,
                    curr: curr.value,
                    desc: `curr ← curr.left (${curr.value}) — go handle the left subtree`,
                });
            } else {
                // second visit to curr: remove thread, visit, go right
                threads.delete(pred.value);
                snapshot({
                    codeLine: 15,
                    curr: curr.value,
                    pred: pred.value,
                    desc: `pred.right = curr → we've been here before! ` +
                        `Remove thread ${pred.value} ⇢ ${curr.value}, restoring the tree.`,
                });
                visited.push(curr.value);
                snapshot({
                    codeLine: 16,
                    curr: curr.value,
                    justVisited: curr.value,
                    desc: `visit ${curr.value} → output: [${visited.join(', ')}]`,
                });

                const following = threads.has(curr.value)
                    ? [curr.value, threads.get(curr.value)]
                    : null;
                const target = following ? byValue.get(following[1]) : curr.right;
                curr = target;
                snapshot({
                    codeLine: 17,
                    curr: curr ? curr.value : null,
                    activeThread: following,
                    desc: following
                        ? `curr ← curr.right — another thread! Climb it up to ${following[1]}`
                        : curr
                            ? `curr ← curr.right (${curr.value})`
                            : 'curr ← curr.right (null) — nothing left to process',
                });
            }
        }
    }

    snapshot({
        desc: `Done! In-order: ${visited.join(' → ')}. ` +
            'Every thread was removed along the way, so the tree is back to its original shape — ' +
            'and we never used more than two pointers.',
        visited: [...visited],
        done: true,
    });

    return steps;
};
