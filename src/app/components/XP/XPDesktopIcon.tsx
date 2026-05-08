import { useState } from 'react';
import { DraggableProps } from '../../types/common';
import { Rnd } from 'react-rnd';

type XPDesktopIconProps = DraggableProps & {
    text: string;
    imageSrc?: string;
    emoji?: string;
    onOpen: () => void;
}

export default function XPDesktopIcon({
    setPosition,
    position,
    text, 
    imageSrc,
    emoji,
    onOpen
}: XPDesktopIconProps) {
    const [selected, setSelected] = useState(false);
    return <Rnd
        onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
        position={position}
    >
        

    <div
    className={`desktop-icon ${selected ? 'selected' : ''}`}
    onClick={(e: any) => {
        e.stopPropagation();
        setSelected(true,)
    }}
    onDoubleClick={(e: any) => {
        onOpen();
    }}
    >
        {imageSrc && <img className="desktop-icon-image" src={imageSrc} alt={text} />}
        {emoji && <span className="desktop-icon-emoji">{emoji}</span>}
        <span className="desktop-icon-label">{text}</span>
    </div>
        </Rnd>
}