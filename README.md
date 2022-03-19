# Aria and Riley's CS385 Program 3

We've made a couple of pieces of notable progress:

1. We implemented proper scene coordinates
2. We implemented correct projection onto the 2-d plane
3. We implemented a custom priority heap, in `priority-queue.js`, which will make computing the intersection much faster
4. We've implemented about half of the code for intersection detection and removal; because of the priority queue algorithm we're using, this code is very closely intermingled with the ray-face intersection code, so the algorithm is overall more complex
