//
// walk-thru.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Spring 2022
//
// This defines five object types that support the laying out of a
// walk-through of a scene of objects, made up of several camera
// shots of that scene.
//
// It defines these classes
//
//  * Shot; the position and direction of a camera shot placed in the scene.
//
//  * Placememt: the positioning, sizing, and orientation of an object from
//      a preloaded object library/
//
//  * WalkThru: a collection of shots and placements that make up the
//      walk-through of a scene.
//
// It provides the template for code for these classes:
//
//  * SceneCamera: the geometric information for producing a snapsot of the
//      scene from a particular shot in the walk-through of a scene.
//
//  * SceneObject: the geometric information for the placememt of an
//      object within a scene.
//
// ------
//
// Assignment
//
// Your job is to complete the code for the `toPDF` method of a
// `WalkThru`.  It compiles all the geometric information for the
// shots and object placements of the scene walk-through. From that,
// it should then produce a series of lines on the pages of a PDF
// documemt. Each page should correspond to a snapshot of the objects
// in the scene from some camera location, as directed by the series
// of shots.
//
// Each page should render the objects according to a perspective
// drawing of the edges/facets of each object in the scene, with
// "hidden lines removed." This means that if a portion of an edge is
// hidden behind a face of an object that sits closer to the camera,
// then that portion of the edge should not be drawn.
//
const MINIMUM_PLACEMENT_SCALE = 0.1; // Smallest object we can place.
const EPSILON = 0.00000001;

class Shot {
  constructor(position0, direction0) {
    this.position = position0;
    this.direction = direction0;
  }
}

class Placement {
  //
  // Class representing the placement of a library object in the scene.
  //
  constructor(name, position0) {
    //
    // `name`: string of the object cloned from the library. This name is
    //    used to access the object's geometric info (its faceted
    //    surface) and also to render it with glBeginEnd.
    //
    // `position`, `scale`, `direction`: a `point`, number, and `vector`
    //    representing the location, size, and orientation of this
    //    object's placement in the scene.
    //
    this.name = name;
    this.position = position0;
    this.scale = MINIMUM_PLACEMENT_SCALE;
    this.orientation = 0.0;
  }

  resize(scale, bounds) {
    //
    // Return the 2D orientation of the object as an angle in degrees.
    // This gives the "spin" of the clone around its base.
    //
    // Some checks prevent growing the clone beyond the scene bounds.
    //
    scale = Math.max(scale, MINIMUM_PLACEMENT_SCALE);
    scale = Math.min(scale, bounds.right - this.position.x);
    scale = Math.min(scale, bounds.top - this.position.y);
    scale = Math.min(scale, this.position.x - bounds.left);
    scale = Math.min(scale, this.position.y - bounds.bottom);
    this.scale = scale;
  }

  moveTo(position, bounds) {
    //
    // Relocate the object.
    //
    // Some checks prevent the object from being placed outside
    // the scene bounds.
    //
    position.x = Math.max(position.x, bounds.left + this.scale);
    position.y = Math.max(position.y, bounds.bottom + this.scale);
    position.x = Math.min(position.x, bounds.right - this.scale);
    position.y = Math.min(position.y, bounds.top - this.scale);
    this.position = position;
  }

  rotateBy(angle) {
    //
    // Re-orient the clone by spinning it further by and angle.
    //
    this.orientation += angle;
  }

  baseIncludes(queryPoint) {
    //
    // Checks whether the `queryPoint` lives within the circular base
    // of the clone.
    //
    const distance = this.position.dist2(queryPoint);
    return distance < this.scale * this.scale;
  }

  draw(objectColor, highlightColor, drawBase, drawShaded) {
    //
    // Draws the object within the current WebGL/opengl context.
    //
    glPushMatrix();
    const position = this.position;
    const angle = this.orientation;
    const scale = this.scale;
    glTranslatef(this.position.x, this.position.y, this.position.z);
    glRotatef(angle, 0.0, 0.0, 1.0);
    glScalef(this.scale, this.scale, this.scale);
    //
    // draw
    if (drawShaded) {
      // Turn on lighting.
      glEnable(GL_LIGHTING);
      glEnable(GL_LIGHT0);
    }
    glColor3f(objectColor.r, objectColor.g, objectColor.b);
    glBeginEnd(this.name);
    if (drawShaded) {
      // Turn on lighting.
      glDisable(GL_LIGHT0);
      glDisable(GL_LIGHTING);
    }

    // draw with highlights
    if (highlightColor != null) {
      glColor3f(highlightColor.r, highlightColor.g, highlightColor.b);
      //
      // Draw its wireframe.
      glBeginEnd(this.name + "-wireframe");
      if (drawBase) {
        // Show its extent as a circle.
        glBeginEnd("BASE");
      }
    }

    glPopMatrix();
  }
}

function toPDFcoords(p) {
  /*
   * Computes the point in 2D projection coordinates to
   * a pair of coordinates corresponding to the millimeters
   * left and down from the top-left corner of a credit
   * card-sized PDF 54mm wide and 86mm tall.
   */

  // The 2D points are assumed to live in the box
  //
  //     [-1.0,1.0] x [0.0,2.0]
  //
  // This puts ant such points into [0,54] x [0,54].
  //
  const x = (p.x + 1.0) * 27;
  const y = (2.0 - p.y) * 27;

  return { x: x, y: y };
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   WALK THRU
*/

class WalkThru {
  constructor() {
    /*
     * new WalkThru
     *
     * Initializes an empty scene with a single shot of it.
     * The shot is on the left side facing right.
     */
    this.shot0 = new Shot(ORIGIN3D(), X_VECTOR3D());
    this.shots = [this.shot0];
    this.placements = [];
  }

  toPDF(document, startNewPage) {
    // var q0 = new Point3d(0.0, 0.0, 2.0);
    // var q1 = new Point3d(0.0, 1.0, 2.0);
    // var q2 = new Point3d(1.0, 0.0, 2.0);
    // var d = new Point3d(1.0, 1.0, 2.0);
    // var origin = new Point3d(0.0, 0.0, 0.0);

    // var castVec = d.minus(origin);
    // var depth = castVec.norm();

    // console.log(oneRayCast(q0, q1, q2, origin, castVec, depth));
    // return;
    /*
     * Issue line/circle commands with a jsPDF object `document`
     * relying on the function `startNewPage` to add and set-up
     * each page of the resulting PDF file.
     */

    //
    // Make all the cameras from the walk-through's shots.
    //
    const cameras = [];
    for (let shot of this.shots) {
      const camera = new SceneCamera(
        shot.position,
        shot.direction,
        Z_VECTOR3D()
      );
      cameras.push(camera);
    }

    // Make all the scene objects from their placements.

    const placement1 = new Placement("triangle", new Point3d(2.0, 1.0, 0.0));
    placement1.scale = 0.5;
    const prototype1 = gObjectsLibrary.get(placement1.name);
    const object1 = new SceneObject(prototype1, placement1);

    const placement2 = new Placement("triangle", new Point3d(2.0, 1.2, 0.0));
    placement2.scale = 0.5;
    const prototype2 = gObjectsLibrary.get(placement2.name);
    const object2 = new SceneObject(prototype2, placement2);

    // const placement3 = new Placement("triangle", new Point3d(1.9, 0.8, 0.0));
    // placement3.scale = 0.3;
    // const prototype3 = gObjectsLibrary.get(placement3.name);
    // const object3 = new SceneObject(prototype3, placement3);

    const placement4 = new Placement("triangle", new Point3d(1.9, 1.3, 0.9));
    placement4.scale = 0.4;
    const prototype4 = gObjectsLibrary.get(placement4.name);
    const object4 = new SceneObject(prototype4, placement4);

    const objects = [object1, object2, object4];

    //
    // Render each page of the walk-through.
    //
    for (let camera of cameras) {
      // For now, one page per shot.
      startNewPage(document);

      // Compute projected vertex information and draw the lines of
      // each edge.
      var i = 0;
      for (let object of objects) {
        // Project the vertices of this object.
        i++;
        if (i === 2) {
          console.log("object 2");
        }
        let pvs = object.projectVertices(camera);

        // Draw each edge, projected, within the PDF.
        for (let edge of object.allEdges()) {
          //
          // Get the vertex information for each endpoint.
          const v00 = edge.vertex(0, object);
          const v01 = edge.vertex(1, object);
          //
          // Get the projected position of each.
          const p0map = pvs.get(v00);
          const p1map = pvs.get(v01);

          const pp0 = p0map.projection;
          const pp1 = p1map.projection;
          if (i === 2) {
            console.log("p0", pp0);
            console.log("p1", pp1);
          }

          var breakpoints = [0, 1];

          for (let object1 of objects) {
            let pvs1 = object1.projectVertices(camera);

            for (let edge1 of object1.allEdges()) {
              // Get the vertex information for each endpoint.
              const v10 = edge1.vertex(0, object1);
              const v11 = edge1.vertex(1, object1);
              //
              // Get the projected position of each.
              const pq0 = pvs1.get(v10).projection;
              const pq1 = pvs1.get(v11).projection;

              // scalar position of break point
              var scalar_p = intersection(pp0, pp1, pq0, pq1);

              if (scalar_p) {
                breakpoints.push(scalar_p);
              }
            }
          }

          breakpoints.sort();

          const op0 = p0map.point;
          const op1 = p1map.point;

          var p0;
          var p1 = pp0;

          var o0;
          var o1 = op0;

          for (var i = 1; i < breakpoints.length; i++) {
            p0 = p1;
            p1 = pp0.combo(breakpoints[i], pp1);

            o0 = o1;
            // original point at breakpoint i
            o1 = op0.combo(breakpoints[i], op1);

            // // draw breakpoints
            // var pbp = toPDFcoords(p1);
            // document.setFillColor(255, 0, 0);
            // document.circle(pbp.x, pbp.y, 0.35, "F");

            // // draw midpoints
            // var mp = p0.combo(0.5, p1);
            // var pmp = toPDFcoords(mp);
            // document.setFillColor(0, 255, 0);
            // document.circle(pmp.x, pmp.y, 0.35, "F");

            var mid = o0.combo(0.5, o1); // 3d midpoint

            if (!rayCast(mid, objects, camera.center)) {
              // draw line
              const proj0 = toPDFcoords(p0);
              const proj1 = toPDFcoords(p1);

              document.setLineWidth(0.1);
              document.setDrawColor(25, 25, 25);
              document.line(proj0.x, proj0.y, proj1.x, proj1.y);
            }
          }
        }
      }
    }
  }
}

// return whether a face intersects a ray casted from the origin through p with
// smaller depth
function rayCast(p, objects, origin) {
  var castVec = p.minus(origin);
  var depth = castVec.norm();

  for (let object of objects) {
    for (let face of object.allFaces()) {
      // get 3d vertices of triangle
      var q0 = face.vertex(0, object).position;
      var q1 = face.vertex(1, object).position;
      var q2 = face.vertex(2, object).position;

      if (oneRayCast(q0, q1, q2, origin, castVec, depth)) {
        // console.log("triangle: ", q0, q1, q2);
        // console.log("castVec: ", castVec);
        // console.log("depth: ", depth);
        return true;
      }
    }
  }

  return false;
}

// check if q0, q1, q2 intersects castVec at a smaller depth
function oneRayCast(q0, q1, q2, origin, castVec, depth) {
  // basis for the triangle
  var v1 = q1.minus(q0).unit();
  var v2 = q2.minus(q0).unit();

  // 1. compute intersection with plane

  // unit normal to the triangle
  // unit because v1 and v2 are unit
  var n = v1.cross(v2);

  // component of vector to triangle vertex normal to Q plane
  var longDelta = q0.minus(origin).dot(n);
  // component of cast vector normal to Q plane
  var shortDelta = castVec.dot(n);
  if (shortDelta == 0) {
    // we're casting parallel to the plane of the face, no way there's an intersection
    return false;
  }

  // intersection with the Q plane
  var q = origin.plus(castVec.times(longDelta / shortDelta));

  // 2. ensure intersection is valid

  var v = q.minus(q0).unit();

  var littleH = q.minus(q0).dot(v1);
  var bigH = q1.minus(q0).norm();
  var alpha1 = littleH / bigH;

  var littleH = q.minus(q0).dot(v2);
  var bigH = q2.minus(q0).norm();
  var alpha2 = littleH / bigH;

  var alpha0 = 1 - (alpha1 + alpha2);

  // console.log("a0", alpha0);
  // console.log("a1", alpha1);
  // console.log("a2", alpha2);

  if (
    alpha0 < 0 ||
    alpha0 > 1 ||
    alpha1 < 0 ||
    alpha1 > 1 ||
    alpha2 < 0 ||
    alpha2 > 1
  ) {
    // point is not obscured by the face
    return false;
  }

  // 3. compare depth of point and face

  var depthQ = q.minus(origin).norm(); // depth at the intersection point
  // console.log("depth", depth);
  // console.log("depthQ", depthQ);
  // in this case Q does obscure the point
  return depthQ < depth;
}

class SceneCamera {
  //
  // new SceneCamera(center, towards, upward)
  //
  // Represents the parameters of a 2-D snapshot of a 3-D scene.
  // This yields a perspective projection of a camera looking at
  // the scene in a direction `towards`, from the given `center` of
  // projection, with an orientation that puts a certain direction
  // `upward`.
  //
  // Underlying the `Camera` object is an orthonormal frame whose
  // origin sits at `center`, and whose axes are `right`, `up`, and
  // `into`. This is a *left-handed* system. The vectors `right` and
  // `up` form a basis for the projection onto the virtual
  // film/screen/paper.  The `into` vector points towards/into
  // the scene.
  //
  constructor(center, towards, upward) {
    //
    // Constructs a left-handed orthonormal frame for projection.
    //
    this.center = center;
    this.into = towards.unit();
    //
    this.right = this.into.cross(upward.unit());
    this.up = this.right.cross(this.into);
  }

  project(aPoint) {
    //
    // Projects a 3D point into 2D with perspective using this camera.
    //

    // Compute a 2D projected point and its depth.
    var pointAsVec = aPoint.minus(this.center);
    var depth = this.into.dot(pointAsVec);
    var projection = this.center.plus(pointAsVec.div(depth));

    var origin = this.center.plus(this.into);
    var projectionVec = projection.minus(origin);
    var projectionX = projectionVec.dot(this.right);
    var projectionY = projectionVec.dot(this.up);

    const result = {
      point: aPoint,
      projection: new Point2d(projectionX, projectionY),
      distance: depth,
    };

    return result;
  }
}

//
// class SceneObject (extends CGObject)
//
// This object represents a CGObject that results from placing
// another CGObject at a certain position, scaled, and oriented.
//
// It shares the edge and face information with the provided
// object, but then its vertices are at new positions based on
// the placement.
//
class SceneObject extends CGObject {
  // new SceneObject(cgobject, placement):
  //
  // Builds a new object as a placement of the given object.
  //
  constructor(cgobject, placement) {
    // Compile geometric info from a placed object,
    super();
    this.cloneFromObject(cgobject, placement);
  }

  projectVertices(camera) {
    const vertexInfo = new Map();
    for (let v of this.allVertices()) {
      const projection = camera.project(v.position);
      vertexInfo.set(v, projection);
    }
    return vertexInfo;
  }
}
