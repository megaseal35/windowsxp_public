import { Rnd } from 'react-rnd';
import { BaseWindowProps, ClickFn, Coord, Dimension } from '../../types/common';
import { useRef, useState } from 'react';

type XPWindowProps = BaseWindowProps & {
    title: string,
    zIndex?: number;
    onFocus?: () => void;
    children?: React.ReactNode;
};

export default function XPWindow({
    title,
    position,
    size,
    setSize,
    setPosition,
    onClose,
    onFocus,
    windowStyle,
    zIndex,
    children
}: XPWindowProps) {
    const [windowState, setWindowState] = useState<"normal" | "maximized" | "minimized">("normal");
    const prevRect = useRef({ size, position });
    function maximize() {
        prevRect.current = { size, position }
        setPosition({ x: 0, y: 0 });
        setSize({ width: window.innerWidth, height: window.innerHeight - 30 });
        setWindowState('maximized')
    }
    function restore() {
        setSize(prevRect.current.size);
        setPosition(prevRect.current.position);
        setWindowState("normal");
    }

    function toggleMaximize() {
        windowState === 'maximized' ? restore() : maximize();
    }
    return (
        <Rnd
            size={size}
            position={position}
            onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, pos) => {
                setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                setPosition(pos);
            }}
            onMouseDown={onFocus}
            disableDragging={windowState === "maximized"}
            enableResizing={windowState === "normal"}
            bounds="window"
            dragHandleClassName="title-bar"
            style={{
                display: windowState === "minimized" ? "none" : "block",
                zIndex,
            }}
        >
            
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...windowStyle,
            }}
            className="window"
        >
            <div className="title-bar">
                <div className="title-bar-text">{title}</div>
                <div className="title-bar-controls">
                        <button
                        aria-label="Maximize"
                         onMouseDown={(e) => e.stopPropagation()}
                         onClick={toggleMaximize}
                         />
                    <button
                     aria-label="Close"
                    onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e: any) => {
                        setWindowState('normal');
                        if(onClose) {
                            onClose(e);
                        }
                    }}/>
                </div>
            </div>
            <div
                className="window-body"
                style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}
            >
                {children}
            </div>
        </div>
        </Rnd>
    )
    
}