import React, { useEffect, useRef, useContext } from 'react';
import rough from 'roughjs/bin/rough';
import { TOOL_ITEMS } from '../../constants';
import themeContext from '../../store/theme-context';
import { deserializeElements } from '../../utils/element';

const CanvasPreview = ({ elements }) => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useContext(themeContext);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        // Scale down the canvas content to fit inside a small thumbnail container better
        // Assuming a standard screen is ~1200px wide, 300px width means 25% scale
        context.scale(0.25, 0.25);

        const roughCanvas = rough.canvas(canvas);

        if (!elements || elements.length === 0) {
            context.restore();
            return;
        }

        try {
            const deserialized = deserializeElements(elements);
            deserialized.forEach((element) => {
                switch (element.type) {
                    case TOOL_ITEMS.LINE:
                    case TOOL_ITEMS.RECTANGLE:
                    case TOOL_ITEMS.CIRCLE:
                    case TOOL_ITEMS.ARROW:
                        // For dark mode rendering of default black paths
                        if (isDarkMode && element.stroke === 'black') {
                            element.roughEle.options.stroke = 'white';
                        }
                        if (isDarkMode && element.fill === 'black') {
                            element.roughEle.options.fill = 'white';
                        }
                        roughCanvas.draw(element.roughEle);
                        break;
                    case TOOL_ITEMS.BRUSH:
                        context.fillStyle = isDarkMode && element.stroke === 'black' ? 'white' : element.stroke;
                        context.fill(element.path);
                        break;
                    case TOOL_ITEMS.TEXT:
                        context.textBaseline = "top";
                        context.font = `${element.size}px Caveat`;
                        context.fillStyle = isDarkMode && element.stroke === 'black' ? 'white' : element.stroke;
                        // Provide a dark mode adjustment for black text
                        if (isDarkMode && context.fillStyle === '#000000') {
                            context.fillStyle = '#ffffff';
                        }
                        context.fillText(element.text, element.x1, element.y1);
                        break;
                    default:
                        break;
                }
            });
        } catch (e) {
            console.error("Preview draw error", e);
        }
        context.restore();
    }, [elements, isDarkMode]);

    // If no elements, we don't need to render an empty canvas element, it'll just be clear anyway.
    if (!elements || elements.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <svg className={`w-10 h-10 opacity-20 ${isDarkMode ? 'text-neutral-500' : 'text-indigo-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden flex items-start justify-start relative bg-transparent pointer-events-none">
            <canvas
                ref={canvasRef}
                width={350}
                height={200}
                className="object-none origin-top-left"
            />
        </div>
    );
};

export default CanvasPreview;
