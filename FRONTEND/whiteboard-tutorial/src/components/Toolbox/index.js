import React, { useContext, useRef } from "react";
import Draggable from 'react-draggable';
import { MdDragIndicator } from "react-icons/md";

import cx from "classnames";

import {
  COLORS,
  FILL_TOOL_TYPES,
  SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import boardContext from "../../store/board-context";
import themeContext from "../../store/theme-context";

const Toolbox = () => {
  const { activeToolItem } = useContext(boardContext);
  const { toolboxState, changeStroke, changeFill, changeSize } =
    useContext(toolboxContext);
  const { isDarkMode } = useContext(themeContext);

  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const size = toolboxState[activeToolItem]?.size;
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
      <div ref={nodeRef} className={`absolute left-6 top-24 z-[60] flex flex-col gap-5 p-5 pt-3 rounded-2xl shadow-2xl border backdrop-blur-xl w-64 max-h-[85vh] overflow-y-auto no-scrollbar
        ${isDarkMode ? 'bg-[#1e1e1e]/95 border-gray-700 shadow-black/50' : 'bg-white/95 border-gray-200 shadow-indigo-500/15'}
      `}>
        {/* Drag Handle */}
        <div
          className={`drag-handle flex items-center justify-center w-full cursor-grab active:cursor-grabbing pb-3 mb-1 border-b transition-colors opacity-70 hover:opacity-100
            ${isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-400'}
          `}
          title="Drag Toolbox"
        >
          <MdDragIndicator size={22} />
        </div>

        {STROKE_TOOL_TYPES.includes(activeToolItem) && (
          <div className="flex flex-col gap-3">
            <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Stroke Color
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative group">
                <input
                  className={`w-8 h-8 rounded-full cursor-pointer appearance-none p-0 outline-none border-2 transition-transform hover:scale-110
                  ${isDarkMode ? 'border-gray-700 bg-[#2d2d2d]' : 'border-gray-200 bg-white'}
                `}
                  type="color"
                  value={strokeColor}
                  onChange={(e) => changeStroke(activeToolItem, e.target.value)}
                ></input>
              </div>
              {Object.keys(COLORS).map((k) => {
                return (
                  <div
                    key={k}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 border-2
                    ${strokeColor === COLORS[k]
                        ? (isDarkMode ? 'border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-indigo-600 scale-110 shadow-[0_0_10px_rgba(79,70,229,0.3)]')
                        : (isDarkMode ? 'border-transparent hover:scale-110' : 'border-transparent hover:scale-110 shadow-sm')
                      }
                  `}
                    style={{ backgroundColor: COLORS[k] }}
                    onClick={() => changeStroke(activeToolItem, COLORS[k])}
                  ></div>
                );
              })}
            </div>
          </div>
        )}
        {FILL_TOOL_TYPES.includes(activeToolItem) && (
          <div className="flex flex-col gap-3">
            <div className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Fill Color
            </div>
            <div className="flex flex-wrap gap-2">
              {fillColor === null ? (
                <div
                  className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 relative overflow-hidden
                  ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                `}
                  style={{
                    background: 'linear-gradient(to top left, transparent calc(50% - 1px), #ef4444 50%, transparent calc(50% + 1px))'
                  }}
                  onClick={() => changeFill(activeToolItem, COLORS.BLACK)}
                ></div>
              ) : (
                <div>
                  <input
                    className={`w-8 h-8 rounded-full cursor-pointer appearance-none p-0 outline-none border-2 transition-transform hover:scale-110
                    ${isDarkMode ? 'border-gray-700 bg-[#2d2d2d]' : 'border-gray-200 bg-white'}
                  `}
                    type="color"
                    value={strokeColor}
                    onChange={(e) => changeFill(activeToolItem, e.target.value)}
                  ></input>
                </div>
              )}
              <div
                className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 border-2 relative overflow-hidden
                ${fillColor === null
                    ? (isDarkMode ? 'border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-indigo-600 scale-110 shadow-[0_0_10px_rgba(79,70,229,0.3)]')
                    : (isDarkMode ? 'border-gray-700 hover:scale-110' : 'border-gray-200 hover:scale-110')
                  }
              `}
                style={{
                  background: 'linear-gradient(to top right, transparent calc(50% - 1px), #ef4444 50%, transparent calc(50% + 1px))'
                }}
                onClick={() => changeFill(activeToolItem, null)}
              ></div>
              {Object.keys(COLORS).map((k) => {
                return (
                  <div
                    key={k}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 border-2
                    ${fillColor === COLORS[k]
                        ? (isDarkMode ? 'border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-indigo-600 scale-110 shadow-[0_0_10px_rgba(79,70,229,0.3)]')
                        : (isDarkMode ? 'border-transparent hover:scale-110' : 'border-transparent hover:scale-110 shadow-sm')
                      }
                  `}
                    style={{ backgroundColor: COLORS[k] }}
                    onClick={() => changeFill(activeToolItem, COLORS[k])}
                  ></div>
                );
              })}
            </div>
          </div>
        )}
        {SIZE_TOOL_TYPES.includes(activeToolItem) && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                {size}
              </span>
            </div>
            <input
              type="range"
              min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
              max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
              step={1}
              value={size}
              onChange={(event) => changeSize(activeToolItem, event.target.value)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer outline-none transition-colors
              ${isDarkMode ? 'bg-gray-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'}
            `}
            ></input>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default Toolbox;
