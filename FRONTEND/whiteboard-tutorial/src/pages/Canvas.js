import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import Board from '../components/Board';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/ToolboxProvider';
import boardContext from '../store/board-context';
import toolboxContext from '../store/toolbox-context';
import themeContext from '../store/theme-context';
import { serializeElements, deserializeElements } from '../utils/element';
import { COLORS, FILL_TOOL_TYPES, SIZE_TOOL_TYPES, STROKE_TOOL_TYPES, TOOL_ITEMS } from '../constants';
import { BrandMark } from '../components/Brand';
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
  FaTrash,
  FaImage,
  FaLink,
  FaCheck,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaHandPaper,
  FaChevronRight,
  FaChevronLeft,
  FaMousePointer,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";

function CanvasContent({ canvasId, canvasName }) {
  const { activeToolItem, changeToolHandler, undo, redo, loadElements, clearAll, addImage } = useContext(boardContext);
  const { toolboxState, changeStroke, changeFill, changeSize } = useContext(toolboxContext);
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState('saved');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const socketRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinCanvas', canvasId);
    });

    socketRef.current.on('canvasUpdate', ({ elements: remoteElements }) => {
      isRemoteUpdateRef.current = true;
      const deserializedElements = deserializeElements(remoteElements);
      loadElements(deserializedElements);
      window.dispatchEvent(new CustomEvent('resetDrawingState'));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveCanvas', canvasId);
        socketRef.current.disconnect();
      }
    };
  }, [canvasId, loadElements]);

  const handleDownloadClick = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = `${canvasName || 'board'}.png`;
    anchor.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const probe = new Image();
      probe.onload = () => {
        addImage(src, probe.naturalWidth, probe.naturalHeight);
      };
      probe.src = src;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleShareAsImage = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setGeneratingShare(true);
    try {
      const canvas = document.getElementById('canvas');
      const snapshot = canvas.toDataURL('image/jpeg', 0.85);
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snapshot }),
      });
      if (!response.ok) throw new Error('Failed to publish snapshot');
      const link = `${API_URL}/api/canvas/public/${canvasId}/image`;
      await navigator.clipboard.writeText(link);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to generate share link.');
    } finally {
      setGeneratingShare(false);
    }
  };

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Clear the entire canvas? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      clearAll();
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('canvasUpdate', { canvasId, elements: [] });
      }
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements: [] }),
      });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
        throw new Error('Failed to clear canvas');
      }
    } catch (error) {
      console.error('Error clearing canvas:', error);
      alert('Failed to clear canvas. Please try again.');
    }
  }, [canvasId, navigate, clearAll]);

  const saveCanvas = useCallback(async (elementsToSave) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (isRemoteUpdateRef.current) { isRemoteUpdateRef.current = false; return; }

    setSaveStatus('saving...');
    try {
      const serializedElements = serializeElements(elementsToSave);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('canvasUpdate', { canvasId, elements: serializedElements });
      }
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements: serializedElements }),
      });
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
        throw new Error('Failed to save canvas');
      }
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving canvas:', error);
      setSaveStatus('error saving');
    }
  }, [canvasId, navigate]);

  useEffect(() => {
    const handleCanvasUpdate = (event) => {
      if (event.detail && event.detail.elements) {
        saveCanvas(event.detail.elements);
      }
    };
    window.addEventListener('canvasUpdated', handleCanvasUpdate);
    return () => window.removeEventListener('canvasUpdated', handleCanvasUpdate);
  }, [saveCanvas]);

  const drawingTools = [
    { id: TOOL_ITEMS.HAND, icon: <FaHandPaper />, title: "Hand / Pan (Space)" },
    { id: TOOL_ITEMS.SELECT, icon: <FaMousePointer />, title: "Select / Move" },
    { id: TOOL_ITEMS.BRUSH, icon: <FaPaintBrush />, title: "Brush" },
    { id: TOOL_ITEMS.LINE, icon: <FaSlash />, title: "Line" },
    { id: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal />, title: "Rectangle" },
    { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle />, title: "Circle" },
    { id: TOOL_ITEMS.ARROW, icon: <FaArrowRight />, title: "Arrow" },
    { id: TOOL_ITEMS.ERASER, icon: <FaEraser />, title: "Eraser" },
    { id: TOOL_ITEMS.TEXT, icon: <FaFont />, title: "Text" },
  ];

  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const sizeValue = toolboxState[activeToolItem]?.size;
  const showStroke = STROKE_TOOL_TYPES.includes(activeToolItem);
  const showFill = FILL_TOOL_TYPES.includes(activeToolItem);
  const showSize = SIZE_TOOL_TYPES.includes(activeToolItem);
  const showOptions = showStroke || showFill || showSize;

  const bg = isDarkMode ? 'bg-black' : 'bg-white';
  const panelBg = isDarkMode ? 'bg-[#0a0a0a]/95 border-white/10' : 'bg-white/95 border-black/10';
  const subtle = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const muted = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inactive = isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-black';
  const active = isDarkMode ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-black text-white shadow-lg shadow-black/20';
  const divider = isDarkMode ? 'bg-white/10' : 'bg-black/10';

  return (
    <div className={`relative w-full h-screen overflow-hidden ${bg}`}>
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-xl border-b transition-all duration-300 ${panelBg}`}>
        {/* Left */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <button
            onClick={() => navigate('/canvases')}
            title="Back to boards"
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
              ${isDarkMode ? 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white' : 'border border-black/10 text-black/70 hover:bg-black/5 hover:text-black'}
            `}
          >
            <FaArrowLeft className="w-3 h-3" />
          </button>
          <BrandMark size={24} />
          <div className="hidden sm:block">
            <h1
              className={`text-base font-semibold truncate max-w-[250px] tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {canvasName || 'Untitled'}
            </h1>
          </div>
        </div>

        {/* Center: minimal status */}
        <div className="flex-1 flex justify-center">
          <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${saveStatus === 'error saving' ? 'text-red-500' : subtle}`}>
            {saveStatus === 'error saving' ? '● error' : saveStatus === 'saving...' ? '● saving' : '● saved'}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-2 min-w-[200px]">
          <button
            onClick={handleShareAsImage}
            disabled={generatingShare}
            title="Copy canvas as shareable image link"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
              ${shareLinkCopied
                ? (isDarkMode ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-green-50 text-green-700 border border-green-200')
                : (isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-black/5 text-black border border-black/10 hover:bg-black/10')
              }
            `}
          >
            {shareLinkCopied ? <FaCheck className="w-3 h-3" /> : <FaLink className="w-3 h-3" />}
            {generatingShare ? 'Generating…' : shareLinkCopied ? 'Link copied!' : 'Share as image'}
          </button>
          <button
            onClick={handleDownloadClick}
            title="Download PNG"
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-all ${inactive}`}
          >
            <FaDownload />
          </button>
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${inactive}`}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>

      {/* Vertical Left Tool Pane (with integrated color/size options) */}
      <div className={`absolute left-4 top-20 z-40 flex items-stretch gap-0 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 max-h-[calc(100vh-6rem)]
        ${panelBg} ${isDarkMode ? 'shadow-black/60' : 'shadow-black/10'}
      `}>
        {/* Tools column */}
        <div className="flex flex-col items-center gap-1 p-2 overflow-y-auto no-scrollbar">
          {drawingTools.map((tool) => (
            <button
              key={tool.id}
              title={tool.title}
              onClick={() => changeToolHandler(tool.id)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl text-base transition-all duration-150
                ${activeToolItem === tool.id ? active : inactive}
              `}
            >
              {tool.icon}
            </button>
          ))}

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Insert image (or paste / drop anywhere)"
            className={`w-11 h-11 flex items-center justify-center rounded-xl text-base transition-all duration-150
              ${activeToolItem === TOOL_ITEMS.IMAGE ? active : inactive}
            `}
          >
            <FaImage />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className={`w-8 h-px my-1 ${divider}`}></div>

          <button onClick={undo} title="Undo (⌘Z)" className={`w-11 h-11 flex items-center justify-center rounded-xl text-base transition-all ${inactive}`}>
            <FaUndoAlt />
          </button>
          <button onClick={redo} title="Redo (⌘Y)" className={`w-11 h-11 flex items-center justify-center rounded-xl text-base transition-all ${inactive}`}>
            <FaRedoAlt />
          </button>

          <div className={`w-8 h-px my-1 ${divider}`}></div>

          <button
            onClick={handleClearAll}
            title="Clear board"
            className={`w-11 h-11 flex items-center justify-center rounded-xl text-base transition-all
              ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}
            `}
          >
            <FaTrash />
          </button>

          <div className={`w-8 h-px my-1 ${divider}`}></div>

          <button
            onClick={() => setOptionsOpen((o) => !o)}
            disabled={!showOptions}
            title={showOptions ? (optionsOpen ? "Hide options" : "Show options") : "No options for this tool"}
            className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm transition-all
              ${!showOptions
                ? (isDarkMode ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                : (optionsOpen ? active : inactive)
              }
            `}
          >
            {optionsOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        {/* Options column (color / fill / size for active tool) */}
        {showOptions && optionsOpen && (
          <div className={`flex flex-col gap-4 p-4 w-56 border-l ${divider}`}>
            {showStroke && (
              <div className="flex flex-col gap-2">
                <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${subtle}`}>Stroke</div>
                <div className="flex flex-wrap gap-1.5">
                  <input
                    type="color"
                    value={strokeColor || COLORS.BLACK}
                    onChange={(e) => changeStroke(activeToolItem, e.target.value)}
                    title="Custom color"
                    className={`w-7 h-7 rounded-full cursor-pointer appearance-none p-0 outline-none border-2 transition-transform hover:scale-110
                      ${isDarkMode ? 'border-white/20 bg-black' : 'border-black/20 bg-white'}
                    `}
                  />
                  {Object.keys(COLORS).map((k) => (
                    <div
                      key={k}
                      onClick={() => changeStroke(activeToolItem, COLORS[k])}
                      title={k.toLowerCase()}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-150 border-2
                        ${strokeColor === COLORS[k]
                          ? (isDarkMode ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'border-black scale-110 shadow-[0_0_8px_rgba(0,0,0,0.3)]')
                          : (isDarkMode ? 'border-white/10 hover:scale-110' : 'border-black/10 hover:scale-110')
                        }
                      `}
                      style={{ backgroundColor: COLORS[k] }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showFill && (
              <div className="flex flex-col gap-2">
                <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${subtle}`}>Fill</div>
                <div className="flex flex-wrap gap-1.5">
                  <div
                    onClick={() => changeFill(activeToolItem, null)}
                    title="No fill"
                    className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-150 border-2 relative overflow-hidden
                      ${fillColor === null || fillColor === undefined
                        ? (isDarkMode ? 'border-white scale-110' : 'border-black scale-110')
                        : (isDarkMode ? 'border-white/10 hover:scale-110' : 'border-black/10 hover:scale-110')
                      }
                    `}
                    style={{ background: 'linear-gradient(to top right, transparent calc(50% - 1px), #ef4444 50%, transparent calc(50% + 1px))' }}
                  />
                  <input
                    type="color"
                    value={fillColor || COLORS.BLACK}
                    onChange={(e) => changeFill(activeToolItem, e.target.value)}
                    title="Custom fill"
                    className={`w-7 h-7 rounded-full cursor-pointer appearance-none p-0 outline-none border-2 transition-transform hover:scale-110
                      ${isDarkMode ? 'border-white/20 bg-black' : 'border-black/20 bg-white'}
                    `}
                  />
                  {Object.keys(COLORS).map((k) => (
                    <div
                      key={k}
                      onClick={() => changeFill(activeToolItem, COLORS[k])}
                      title={k.toLowerCase()}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-150 border-2
                        ${fillColor === COLORS[k]
                          ? (isDarkMode ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'border-black scale-110 shadow-[0_0_8px_rgba(0,0,0,0.3)]')
                          : (isDarkMode ? 'border-white/10 hover:scale-110' : 'border-black/10 hover:scale-110')
                        }
                      `}
                      style={{ backgroundColor: COLORS[k] }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showSize && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${subtle}`}>
                    {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    {sizeValue}
                  </span>
                </div>
                <input
                  type="range"
                  min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
                  max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
                  step={1}
                  value={sizeValue}
                  onChange={(event) => changeSize(activeToolItem, event.target.value)}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-colors
                    ${isDarkMode ? 'bg-white/10 accent-white' : 'bg-black/10 accent-black'}
                  `}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper hint */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md ${panelBg} ${muted}`}>
        Paste (⌘V) · drag &amp; drop · scroll to pan · ⌘+scroll to zoom · Space to grab
      </div>

      <Board />
    </div>
  );
}

function Canvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDarkMode } = useContext(themeContext);

  useEffect(() => {
    const fetchCanvas = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const response = await fetch(`${API_URL}/api/canvas/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
          throw new Error(data.error || 'Failed to load canvas');
        }
        setCanvas(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCanvas();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black text-gray-300' : 'bg-white text-gray-600'}`}>
        <div className="flex flex-col items-center space-y-4">
          <svg className={`animate-spin h-10 w-10 ${isDarkMode ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading canvas…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl text-center border ${isDarkMode ? 'bg-[#0a0a0a] border-red-900/50' : 'bg-white border-red-100'}`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-600'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Failed to load canvas</h2>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
          <button
            onClick={() => navigate('/canvases')}
            className={`w-full py-3 px-4 font-bold rounded-xl transition-all flex justify-center items-center gap-2
              ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}
            `}
          >
            ← Back to Canvases
          </button>
        </div>
      </div>
    );
  }

  return (
    <BoardProvider initialElements={canvas?.elements || []}>
      <ToolboxProvider>
        <CanvasContent canvasId={id} canvasName={canvas?.name} />
      </ToolboxProvider>
    </BoardProvider>
  );
}

export default Canvas;
