import { useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import themeContext from "../../store/theme-context";
import { FaPlus, FaMinus, FaExpand } from "react-icons/fa";
import { findElementAt, findElementsInRect, getElementBoundingBox } from "../../utils/element";

const imageCache = new Map();

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const { isDarkMode } = useContext(themeContext);
  const {
    activeToolItem,
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    addImage,
    selectedElementIds,
    selectElements,
    moveSelectedBy,
    finishMove,
    deleteSelected,
    undo,
    redo,
  } = useContext(boardContext);
  const { toolboxState } = useContext(toolboxContext);
  const [, setImgTick] = useState(0);

  // Infinite canvas viewport
  const [view, setView] = useState({ panX: 0, panY: 0, scale: 1 });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [hoverElement, setHoverElement] = useState(false);
  const [marquee, setMarquee] = useState(null); // {x, y, w, h} in world coords during drag
  const panRef = useRef(null);
  const dragRef = useRef(null);
  const marqueeRef = useRef(null);

  const isPanTool = activeToolItem === TOOL_ITEMS.HAND;
  const isSelectTool = activeToolItem === TOOL_ITEMS.SELECT;
  const hasSelection = selectedElementIds && selectedElementIds.length > 0;

  const toWorld = useCallback((clientX, clientY) => ({
    x: (clientX - view.panX) / view.scale,
    y: (clientY - view.panY) / view.scale,
  }), [view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === "Space") {
        const target = event.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
        event.preventDefault();
        setSpaceHeld(true);
        return;
      }
      const target = event.target;
      const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        redo();
      } else if (!isTyping && (event.key === "Delete" || event.key === "Backspace") && hasSelection) {
        event.preventDefault();
        deleteSelected();
      } else if (!isTyping && event.key === "Escape" && hasSelection) {
        selectElements([]);
      }
    }
    function handleKeyUp(event) {
      if (event.code === "Space") setSpaceHeld(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo, deleteSelected, selectElements, hasSelection]);

  useEffect(() => {
    const handlePaste = (event) => {
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target.result;
            const probe = new Image();
            probe.onload = () => {
              const w = window.innerWidth / 2;
              const h = window.innerHeight / 2;
              const world = toWorld(w, h);
              addImage(src, probe.naturalWidth, probe.naturalHeight, world.x, world.y);
            };
            probe.src = src;
          };
          reader.readAsDataURL(file);
          event.preventDefault();
          return;
        }
      }
    };

    const handleDragOver = (event) => event.preventDefault();
    const handleDrop = (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target.result;
          const probe = new Image();
          probe.onload = () => {
            const world = toWorld(event.clientX, event.clientY);
            addImage(src, probe.naturalWidth, probe.naturalHeight, world.x, world.y);
          };
          probe.src = src;
        };
        reader.readAsDataURL(file);
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [addImage, toWorld]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save();

    // Paint the theme background so the canvas's pixel buffer is opaque.
    // This is what makes downloads and shared snapshots come out with the
    // correct white-in-light / black-in-dark background instead of transparent
    // pixels (which most viewers render as black, esp. JPG).
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = isDarkMode ? "#000000" : "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.setTransform(view.scale, 0, 0, view.scale, view.panX, view.panY);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.stroke;
          context.fill(element.path);
          break;
        case TOOL_ITEMS.TEXT:
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          break;
        case TOOL_ITEMS.IMAGE: {
          let img = imageCache.get(element.src);
          if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => setImgTick((t) => t + 1);
            img.src = element.src;
            imageCache.set(element.src, img);
          }
          if (img.complete && img.naturalWidth > 0) {
            context.drawImage(
              img,
              element.x1,
              element.y1,
              element.x2 - element.x1,
              element.y2 - element.y1
            );
          }
          break;
        }
        default:
          throw new Error("Type not recognized");
      }
    });

    // Draw selection outlines around each selected element
    if (selectedElementIds && selectedElementIds.length > 0) {
      const selSet = new Set(selectedElementIds);
      const pad = 6 / view.scale;
      const dash = 6 / view.scale;
      const gap = 4 / view.scale;
      context.save();
      context.strokeStyle = isDarkMode ? "#ffffff" : "#000000";
      context.lineWidth = 1.4 / view.scale;
      context.setLineDash([dash, gap]);
      for (const el of elements) {
        if (!selSet.has(el.id)) continue;
        const bb = getElementBoundingBox(el);
        if (!bb) continue;
        context.strokeRect(bb.x - pad, bb.y - pad, bb.w + pad * 2, bb.h + pad * 2);
      }
      context.restore();
    }

    // Draw marquee rectangle during drag
    if (marquee && (marquee.w > 0 || marquee.h > 0)) {
      context.save();
      const fillCol = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      const strokeCol = isDarkMode ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
      context.fillStyle = fillCol;
      context.strokeStyle = strokeCol;
      context.lineWidth = 1.2 / view.scale;
      context.setLineDash([5 / view.scale, 3 / view.scale]);
      context.fillRect(marquee.x, marquee.y, marquee.w, marquee.h);
      context.strokeRect(marquee.x, marquee.y, marquee.w, marquee.h);
      context.restore();
    }

    context.restore();

    return () => {
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    };
  }, [elements, view, selectedElementIds, isDarkMode, marquee]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea && textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  // Wheel: pinch-zoom (Ctrl/Meta) or pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = Math.exp(-e.deltaY * 0.01);
        setView((v) => {
          const newScale = Math.max(0.1, Math.min(8, v.scale * zoomFactor));
          const wx = (e.clientX - v.panX) / v.scale;
          const wy = (e.clientY - v.panY) / v.scale;
          return {
            scale: newScale,
            panX: e.clientX - wx * newScale,
            panY: e.clientY - wy * newScale,
          };
        });
      } else {
        setView((v) => ({ ...v, panX: v.panX - e.deltaX, panY: v.panY - e.deltaY }));
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const startPan = (event) => {
    panRef.current = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY };
  };

  const handleMouseDown = (event) => {
    if (event.button === 1 || spaceHeld || isPanTool) {
      startPan(event);
      return;
    }
    const w = toWorld(event.clientX, event.clientY);

    if (isSelectTool) {
      const hit = findElementAt(elements, w.x, w.y);
      if (hit) {
        // Clicking on an element: drag it. If it was not in the current
        // selection, replace selection with just this element.
        const alreadySelected = selectedElementIds.includes(hit.id);
        const dragIds = alreadySelected ? selectedElementIds : [hit.id];
        if (!alreadySelected) selectElements([hit.id]);
        dragRef.current = { ids: dragIds, lastX: w.x, lastY: w.y, moved: false };
      } else {
        // Clicking on empty space: clear selection and start a marquee
        selectElements([]);
        marqueeRef.current = { startX: w.x, startY: w.y };
        setMarquee({ x: w.x, y: w.y, w: 0, h: 0 });
      }
      return;
    }

    boardMouseDownHandler({ clientX: w.x, clientY: w.y, button: event.button }, toolboxState);
  };

  const handleMouseMove = (event) => {
    if (panRef.current) {
      setView((v) => ({
        ...v,
        panX: panRef.current.panX + (event.clientX - panRef.current.x),
        panY: panRef.current.panY + (event.clientY - panRef.current.y),
      }));
      return;
    }
    const w = toWorld(event.clientX, event.clientY);

    if (dragRef.current) {
      const dx = w.x - dragRef.current.lastX;
      const dy = w.y - dragRef.current.lastY;
      if (dx !== 0 || dy !== 0) {
        moveSelectedBy(dragRef.current.ids, dx, dy);
        dragRef.current.lastX = w.x;
        dragRef.current.lastY = w.y;
        dragRef.current.moved = true;
      }
      return;
    }

    if (marqueeRef.current) {
      const { startX, startY } = marqueeRef.current;
      setMarquee({
        x: Math.min(startX, w.x),
        y: Math.min(startY, w.y),
        w: Math.abs(w.x - startX),
        h: Math.abs(w.y - startY),
      });
      return;
    }

    if (isSelectTool) {
      const hit = findElementAt(elements, w.x, w.y);
      setHoverElement(!!hit);
    } else if (hoverElement) {
      setHoverElement(false);
    }

    boardMouseMoveHandler({ clientX: w.x, clientY: w.y });
  };

  const handleMouseUp = () => {
    if (panRef.current) {
      panRef.current = null;
      return;
    }
    if (dragRef.current) {
      if (dragRef.current.moved) finishMove();
      dragRef.current = null;
      return;
    }
    if (marqueeRef.current) {
      const rect = marquee;
      marqueeRef.current = null;
      setMarquee(null);
      if (rect && rect.w > 2 && rect.h > 2) {
        const matches = findElementsInRect(elements, rect);
        selectElements(matches.map((e) => e.id));
      }
      return;
    }
    boardMouseUpHandler();
  };

  const zoomBy = (factor) => {
    setView((v) => {
      const newScale = Math.max(0.1, Math.min(8, v.scale * factor));
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const wx = (cx - v.panX) / v.scale;
      const wy = (cy - v.panY) / v.scale;
      return { scale: newScale, panX: cx - wx * newScale, panY: cy - wy * newScale };
    });
  };
  const resetView = () => setView({ panX: 0, panY: 0, scale: 1 });

  const cursorClass = panRef.current
    ? 'cursor-grabbing'
    : dragRef.current
      ? 'cursor-grabbing'
      : (spaceHeld || isPanTool)
        ? 'cursor-grab'
        : isSelectTool
          ? (marqueeRef.current ? 'cursor-crosshair' : (hoverElement ? 'cursor-move' : 'cursor-default'))
          : activeToolItem === TOOL_ITEMS.TEXT
            ? 'cursor-text'
            : 'cursor-crosshair';

  const lastEl = elements[elements.length - 1];
  const textareaTop = lastEl ? lastEl.y1 * view.scale + view.panY : 0;
  const textareaLeft = lastEl ? lastEl.x1 * view.scale + view.panX : 0;
  const textareaFontSize = lastEl ? (lastEl.size || 32) * view.scale : 32;

  const zoomBtn = isDarkMode
    ? 'bg-[#0a0a0a]/95 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
    : 'bg-white/95 border-black/10 text-gray-700 hover:bg-black/5 hover:text-black';

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && lastEl && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={`fixed border-none bg-transparent resize-none outline-none p-0 m-0 w-auto h-auto overflow-hidden font-[inherit] text-[inherit] leading-[inherit] font-caveat z-40 ${isDarkMode ? 'text-white' : 'text-black'}`}
          style={{
            top: textareaTop,
            left: textareaLeft,
            fontSize: `${textareaFontSize}px`,
            color: lastEl.stroke,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        className={`block fixed top-0 left-0 w-full h-full touch-none z-10 ${cursorClass} ${isDarkMode ? 'bg-black' : 'bg-white'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Zoom controls */}
      <div className={`absolute right-4 bottom-4 z-40 flex items-center gap-1 p-1 rounded-xl border backdrop-blur-xl shadow-lg ${zoomBtn}`}>
        <button onClick={() => zoomBy(1 / 1.2)} title="Zoom out" className="w-8 h-8 flex items-center justify-center rounded-lg text-xs">
          <FaMinus />
        </button>
        <button
          onClick={resetView}
          title="Reset view"
          className="px-2 h-8 text-xs font-semibold tabular-nums min-w-[3.5rem] flex items-center justify-center rounded-lg"
        >
          {Math.round(view.scale * 100)}%
        </button>
        <button onClick={() => zoomBy(1.2)} title="Zoom in" className="w-8 h-8 flex items-center justify-center rounded-lg text-xs">
          <FaPlus />
        </button>
        <button onClick={resetView} title="Reset view" className="w-8 h-8 flex items-center justify-center rounded-lg text-xs">
          <FaExpand />
        </button>
      </div>
    </>
  );
}

export default Board;
