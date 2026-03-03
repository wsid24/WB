import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import Board from '../components/Board';
import Toolbox from '../components/Toolbox';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/ToolboxProvider';
import boardContext from '../store/board-context';
import themeContext from '../store/theme-context';
import { serializeElements, deserializeElements } from '../utils/element';
import { TOOL_ITEMS } from '../constants';
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
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";

function CanvasContent({ canvasId, canvasName }) {
  const { elements, activeToolItem, changeToolHandler, undo, redo, loadElements, clearAll } = useContext(boardContext);
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Connecting to:', API_URL);
    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ Connected! Socket ID:', socketRef.current.id);
      console.log('📍 Joining canvas:', canvasId);
      socketRef.current.emit('joinCanvas', canvasId);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    socketRef.current.on('canvasUpdate', ({ elements: remoteElements }) => {
      console.log('📥 Received update from another user');
      isRemoteUpdateRef.current = true;
      const deserializedElements = deserializeElements(remoteElements);
      loadElements(deserializedElements);

      // Reset any active drawing state to prevent errors
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

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear the entire canvas? This cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('🗑️ Clearing canvas');
      clearAll();

      // Broadcast clear to other users
      if (socketRef.current && socketRef.current.connected) {
        console.log('📤 Broadcasting clear to other users');
        socketRef.current.emit('canvasUpdate', {
          canvasId,
          elements: []
        });
      }

      // Save empty canvas to database
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements: [] }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to clear canvas');
      }

      console.log('✅ Canvas cleared successfully');
    } catch (error) {
      console.error('Error clearing canvas:', error);
      alert('Failed to clear canvas. Please try again.');
    }
  }, [canvasId, navigate, clearAll]);

  // Save function to be called on draw complete
  const saveCanvas = useCallback(async (elementsToSave) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Skip saving if this was triggered by a remote update
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setSaveStatus('saving...');

    try {
      const serializedElements = serializeElements(elementsToSave);

      // Emit to other users in real-time
      if (socketRef.current && socketRef.current.connected) {
        console.log('📤 Broadcasting update to canvas:', canvasId);
        socketRef.current.emit('canvasUpdate', {
          canvasId,
          elements: serializedElements
        });
      } else {
        console.warn('⚠️ Socket not connected, cannot broadcast');
      }

      // Save to database
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements: serializedElements }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to save canvas');
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving canvas:', error);
      setSaveStatus('error saving');
    }
  }, [canvasId, navigate]);

  // Listen for canvas updates (on mouseup events)
  useEffect(() => {
    const handleCanvasUpdate = (event) => {
      if (event.detail && event.detail.elements) {
        saveCanvas(event.detail.elements);
      }
    };

    window.addEventListener('canvasUpdated', handleCanvasUpdate);
    return () => {
      window.removeEventListener('canvasUpdated', handleCanvasUpdate);
    };
  }, [saveCanvas]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top Bar / Toolbar */}
      <div className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md border-b shadow-sm transition-all duration-300
        ${isDarkMode ? 'bg-[#1a1a1a]/95 border-gray-800' : 'bg-white/95 border-gray-200'}
      `}>
        {/* Left Section (Back & Title) */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <button
            onClick={() => navigate('/canvases')}
            className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2
              ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
          </button>
          <div className="hidden sm:block">
            <h1 className={`text-lg font-bold truncate max-w-[250px] ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {canvasName || 'Canvas Editor'}
            </h1>
          </div>
        </div>

        {/* Center Toolbar Section */}
        <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm
            ${isDarkMode ? 'bg-[#2d2d2d]/80 border-gray-700' : 'bg-gray-50/80 border-gray-200'}
          `}>
            {/* Drawing Tools */}
            {[
              { id: TOOL_ITEMS.BRUSH, icon: <FaPaintBrush />, title: "Brush" },
              { id: TOOL_ITEMS.LINE, icon: <FaSlash />, title: "Line" },
              { id: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal />, title: "Rectangle" },
              { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle />, title: "Circle" },
              { id: TOOL_ITEMS.ARROW, icon: <FaArrowRight />, title: "Arrow" },
              { id: TOOL_ITEMS.ERASER, icon: <FaEraser />, title: "Eraser" },
              { id: TOOL_ITEMS.TEXT, icon: <FaFont />, title: "Text" }
            ].map((tool) => (
              <button
                key={tool.id}
                title={tool.title}
                onClick={() => changeToolHandler(tool.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all duration-200
                  ${activeToolItem === tool.id
                    ? (isDarkMode ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30')
                    : (isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900')
                  }
                `}
              >
                {tool.icon}
              </button>
            ))}

            {/* Separator */}
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            {/* Actions */}
            <button
              onClick={undo}
              title="Undo"
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'}
              `}
            >
              <FaUndoAlt />
            </button>
            <button
              onClick={redo}
              title="Redo"
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'}
              `}
            >
              <FaRedoAlt />
            </button>
            <button
              onClick={handleDownloadClick}
              title="Download as PNG"
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-indigo-400' : 'text-gray-500 hover:bg-gray-200 hover:text-indigo-600'}
              `}
            >
              <FaDownload />
            </button>

            {/* Separator */}
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            <button
              onClick={handleClearAll}
              title="Clear Board"
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all text-red-500
                ${isDarkMode ? 'hover:bg-red-900/30 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-600'}
              `}
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Right Section (Status & Theme) */}
        <div className="flex items-center justify-end gap-4 min-w-[200px]">
          <span className={`text-sm font-medium italic hidden md:block
            ${saveStatus === 'error saving' ? 'text-red-500' : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}
          `}>
            {saveStatus === 'error saving' ? 'Error saving' : saveStatus}
          </span>
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shadow-sm
              ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}
            `}
            title="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <Board />
      <Toolbox />
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
      if (!token) {
        navigate('/login');
        return;
      }

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
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
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
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
        <div className="flex flex-col items-center space-y-4">
          <svg className={`animate-spin h-10 w-10 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading canvas content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl text-center border ${isDarkMode ? 'bg-[#2d2d2d] border-red-900/50' : 'bg-white border-red-100'}`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-600'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Failed to load canvas</h2>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
          <button
            onClick={() => navigate('/canvases')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
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
