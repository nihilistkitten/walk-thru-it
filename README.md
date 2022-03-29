# Walk Thru It :footprints:

Riley Shahar and Aria Killebrew Bruehl
Computer Graphics, Reed College

## Running Our Code

To run our code and generate your flip book:

1. Download this repo
2. Navigate to the repo on your machine and enter the command `open walk-thru-it.html` to open the program locally
3. Place items in the scene as desired
4. Click `generate PDF` to render your flip book

## Program Overview

### Part 1: Camera Perspective :movie_camera:

The implementation for the camera perspective is the same as
the solution to question 1 of the written assignment. Given
`center`, `towards`, and `upwards`, `into`, `right`, `up` are calculated as
the normal of the `towards` vector, the cross product of `into` and the normal of `upwards`, and the cross product of `right` and `into`, respectively.

### Part 2: Projecting Vertices :round_pushpin:

Projection is done with the `project` function which works the same as part 2 of the written assignment. Given `aPoint`
we first find the projection vector given by `aPoint - center`. We use the projection vector to find the depth of the projected point. We then use this information to find the `X` and `Y` position of the point projected in 2-space.

### Part 3: Line Segment Intersections :negative_squared_cross_mark:

We first attempted to implement the line segment intersections
using a priority queue to keep track of the depth of the line segments. We felt that this would be faster than the
suggested algorithm since a priority queue would allow us to order the line segments by depth. Then we would be able to only compare the line segment to those behind it, rather than comparing each line segment to every other. However we ran into some issues with this algorithm and figured it would be easier just to use the suggested algorithm.

Our calculation for this part are taken from Jim's solutions, not our written assignment. Our version requires solving a system of linear equations to find the intersection point which would have been overly complicated in the code.

To find the intersection we can through all the object and compare each edge of the object to every other edge on the page. If there is an intersection we find the breakpoint and mark it in the PDF rendering.

### Part 4: Excluding Subsegments :no_entry_sign:

Our strategy for part four was as follows, closely following the writeup:

1. Compute the intersection of the ray and the plane containing the face.
2. Check whether the intersection is in the triangle.
3. Check whether the intersection is shallower in the camera frame than the
   original point.

This works ok in simple cases (uncomment lines 242-262 to see a set of
triangles), but seems to fail in many cases with more geometry. We think this is
because the projection transformation is not linear, and so you cannot use the
same scalar for the affine combination in 3-space as in 2-space. We attempted a
number of solutions; commented out is the best one, which involved identifying
the (projective) midpoint of the subsegment in 3space. This doesn't work because
we have no depth information about the corresponding point before projection. We
attempted to compute the original point pre-projection in various ways, none of
which seemed to be successful.

There are also several pieces of debugging code commented out; for example,
displaying "obscured" lines in red instead of not displaying them, displaying
the midpoints and intersection points (these were correct), etc.
