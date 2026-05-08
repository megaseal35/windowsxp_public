import type { ReactNode } from "react";
import type { Coord, Dimension } from "../../types/common";

export interface XPAppIcon {
    label: string;
    emoji?: string;
    imageSrc?: string;
}

type XPAppCommon = {
    id: string;
    title: string;
    icon: XPAppIcon;
    desktop?: boolean;
    explorerPath?: string[];
};

export type XPWindowApp = XPAppCommon & {
    defaultSize: Dimension;
    render: () => React.ReactNode;
    guard?: () => Promise<boolean>;
    onActivate?: undefined;
};

export type XPLinkApp = XPAppCommon & {
    onActivate: () => Promise<void> | void;
    defaultSize?: undefined;
    render?: undefined;
    guard?: undefined;
};

export type XPApp = XPWindowApp | XPLinkApp;

export interface ExplorerFolder {
    id: string;
    label: string;
    icon?: XPAppIcon;
    parentId?: string;
}

export type OpenWindow = {
    id: string;
    position: Coord;
    size: Dimension;
    minimized: boolean;
    title?: string;
    render?: (close: () => void) => ReactNode;
};

export type DynamicWindowConfig = {
    id: string;
    title: string;
    size: Dimension;
    render: (close: () => void) => ReactNode;
};
