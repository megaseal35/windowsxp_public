export type ClickFn = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

export type Coord = {
    x: number,
    y: number
}

export type Dimension = {
    height: number,
    width: number,
}
export type DraggableProps = {
    position: Coord,
    setPosition: (coord: Coord) => void,
}

export type BaseWindowProps = DraggableProps & {
    
    size: Dimension,
    setSize: (d: Dimension) => void,
    windowStyle?: Record<string, any>
    onClose?: ClickFn;
}
