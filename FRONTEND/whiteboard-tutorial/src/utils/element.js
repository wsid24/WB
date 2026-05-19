import { ARROW_LENGTH, TOOL_ITEMS } from "../constants";
import getStroke from "perfect-freehand";

import rough from "roughjs/bin/rough";
import { getArrowHeadsCoordinates, isPointCloseToLine } from "./math";

const gen = rough.generator();

export const createElement = (
  id,
  x1,
  y1,
  x2,
  y2,
  { type, stroke, fill, size }
) => {
  const element = {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    fill,
    stroke,
    size,
  };
  let options = {
    seed: id + 1, // id can't be zero
    fillStyle: "solid",
  };
  if (stroke) {
    options.stroke = stroke;
  }
  if (fill) {
    options.fill = fill;
  }
  if (size) {
    options.strokeWidth = size;
  }
  switch (type) {
    case TOOL_ITEMS.BRUSH: {
      const brushElement = {
        id,
        points: [{ x: x1, y: y1 }],
        path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }], {
          size: size || 2,
          thinning: 0.6,
          smoothing: 0.7,
          streamline: 0.55,
        }))),
        type,
        stroke,
        size: size || 2,
      };
      return brushElement;
    }
    case TOOL_ITEMS.LINE:
      element.roughEle = gen.line(x1, y1, x2, y2, options);
      return element;
    case TOOL_ITEMS.RECTANGLE:
      element.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      return element;
    case TOOL_ITEMS.CIRCLE:
      const cx = (x1 + x2) / 2,
        cy = (y1 + y2) / 2;
      const width = x2 - x1,
        height = y2 - y1;
      element.roughEle = gen.ellipse(cx, cy, width, height, options);
      return element;
    case TOOL_ITEMS.ARROW:
      const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(
        x1,
        y1,
        x2,
        y2,
        ARROW_LENGTH
      );
      const points = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x2, y2],
        [x4, y4],
      ];
      element.roughEle = gen.linearPath(points, options);
      return element;
    case TOOL_ITEMS.TEXT:
      element.text = "";
      return element;
    case TOOL_ITEMS.IMAGE:
      return element;
    default:
      throw new Error("Type not recognized");
  }
};

// Axis-aligned bounding box for any element in world coords. Returns { x, y, w, h } or null.
export const getElementBoundingBox = (element) => {
  switch (element.type) {
    case TOOL_ITEMS.BRUSH: {
      if (!element.points || element.points.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of element.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const pad = (element.size || 2) / 2;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    }
    case TOOL_ITEMS.TEXT: {
      const canvas = document.getElementById('canvas');
      const ctx = canvas ? canvas.getContext('2d') : null;
      let w = 0;
      if (ctx) {
        ctx.save();
        ctx.font = `${element.size}px Caveat`;
        w = ctx.measureText(element.text || '').width;
        ctx.restore();
      }
      const h = parseInt(element.size, 10) || 32;
      return { x: element.x1, y: element.y1, w: Math.max(w, 20), h };
    }
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW:
    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
    case TOOL_ITEMS.IMAGE: {
      const x = Math.min(element.x1, element.x2);
      const y = Math.min(element.y1, element.y2);
      const w = Math.abs(element.x2 - element.x1);
      const h = Math.abs(element.y2 - element.y1);
      return { x, y, w, h };
    }
    default:
      return null;
  }
};

// Topmost element under the point (in world coords). Pads small for thin shapes.
export const findElementAt = (elements, px, py) => {
  const pad = 6;
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const bb = getElementBoundingBox(el);
    if (!bb) continue;
    if (px >= bb.x - pad && px <= bb.x + bb.w + pad &&
        py >= bb.y - pad && py <= bb.y + bb.h + pad) {
      return el;
    }
  }
  return null;
};

// AABB intersect — both rects expressed as { x, y, w, h } in the same coord space
const rectsIntersect = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Returns all elements whose bounding box intersects the given world-space rect
export const findElementsInRect = (elements, rect) => {
  const matches = [];
  for (const el of elements) {
    const bb = getElementBoundingBox(el);
    if (!bb) continue;
    if (rectsIntersect(bb, rect)) matches.push(el);
  }
  return matches;
};

// Returns a new element translated by (dx, dy). Regenerates roughEle/path as needed.
export const moveElement = (element, dx, dy) => {
  switch (element.type) {
    case TOOL_ITEMS.BRUSH: {
      const newPoints = element.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      return {
        ...element,
        points: newPoints,
        path: new Path2D(
          getSvgPathFromStroke(
            getStroke(newPoints, { size: element.size || 2, thinning: 0.6, smoothing: 0.7, streamline: 0.55 })
          )
        ),
      };
    }
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
    case TOOL_ITEMS.ARROW:
      return createElement(
        element.id,
        element.x1 + dx,
        element.y1 + dy,
        element.x2 + dx,
        element.y2 + dy,
        { type: element.type, stroke: element.stroke, fill: element.fill, size: element.size }
      );
    case TOOL_ITEMS.TEXT:
      return { ...element, x1: element.x1 + dx, y1: element.y1 + dy };
    case TOOL_ITEMS.IMAGE:
      return {
        ...element,
        x1: element.x1 + dx, y1: element.y1 + dy,
        x2: element.x2 + dx, y2: element.y2 + dy,
      };
    default:
      return element;
  }
};

export const createImageElement = (id, x1, y1, src, naturalWidth, naturalHeight) => {
  return {
    id,
    type: TOOL_ITEMS.IMAGE,
    x1,
    y1,
    x2: x1 + naturalWidth,
    y2: y1 + naturalHeight,
    src,
  };
};

export const isPointNearElement = (element, pointX, pointY) => {
  const { x1, y1, x2, y2, type } = element;
  const context = document.getElementById("canvas").getContext("2d");
  switch (type) {
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW:
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
      );
    case TOOL_ITEMS.BRUSH:
      return context.isPointInPath(element.path, pointX, pointY);
    case TOOL_ITEMS.IMAGE:
      return pointX >= x1 && pointX <= x2 && pointY >= y1 && pointY <= y2;
    case TOOL_ITEMS.TEXT:
      context.font = `${element.size}px Caveat`;
      context.fillStyle = element.stroke;
      const textWidth = context.measureText(element.text).width;
      const textHeight = parseInt(element.size);
      context.restore();
      return (
        isPointCloseToLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
        isPointCloseToLine(
          x1 + textWidth,
          y1,
          x1 + textWidth,
          y1 + textHeight,
          pointX,
          pointY
        ) ||
        isPointCloseToLine(
          x1 + textWidth,
          y1 + textHeight,
          x1,
          y1 + textHeight,
          pointX,
          pointY
        ) ||
        isPointCloseToLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
      );
    default:
      throw new Error("Type not recognized");
  }
};

export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

// Serialize elements for saving (remove non-serializable objects)
export const serializeElements = (elements) => {
  return elements.map(element => {
    const serialized = { ...element };
    // Remove non-serializable properties
    delete serialized.roughEle;
    delete serialized.path;
    return serialized;
  });
};

// Deserialize elements when loading (reconstruct roughEle and path)
export const deserializeElements = (elements) => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    const { id, x1, y1, x2, y2, type, stroke, fill, size, points, text } = element;
    
    // Reconstruct the element with roughEle or path
    switch (type) {
      case TOOL_ITEMS.BRUSH:
        if (points && points.length > 0) {
          return {
            ...element,
            path: new Path2D(getSvgPathFromStroke(getStroke(points, {
              size: size || 2,
              thinning: 0.5,
              smoothing: 0.5,
              streamline: 0.5,
            })))
          };
        }
        return element;
      
      case TOOL_ITEMS.LINE:
      case TOOL_ITEMS.RECTANGLE:
      case TOOL_ITEMS.CIRCLE:
      case TOOL_ITEMS.ARROW:
        // Recreate the element to get roughEle
        return createElement(id, x1, y1, x2, y2, { type, stroke, fill, size });
      
      case TOOL_ITEMS.TEXT:
        return { ...element };

      case TOOL_ITEMS.IMAGE:
        return { ...element };

      default:
        return element;
    }
  });
};
