import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import type { Coord, Dimension } from "../../types/common";
import type { DynamicWindowConfig, OpenWindow, XPApp } from "./types";

export interface WindowManager {
    windows: OpenWindow[];
    zIndexFor: (id: string) => number;
    openApp: (id: string) => Promise<void>;
    openWindow: (config: DynamicWindowConfig) => void;
    closeApp: (id: string) => void;
    focusApp: (id: string) => void;
    minimizeApp: (id: string) => void;
    setPosition: (id: string, p: Coord) => void;
    setSize: (id: string, s: Dimension) => void;
}

const WindowManagerContext = createContext<WindowManager | null>(null);

export function useWindowManager(): WindowManager {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error("useWindowManager must be used inside <WindowManagerProvider>");
    return ctx;
}

type ProviderProps = {
    apps: XPApp[];
    children: ReactNode;
};

function moveToTop(order: string[], id: string): string[] {
    if (!order.includes(id)) return order;
    return [...order.filter((x) => x !== id), id];
}

export function WindowManagerProvider({ apps, children }: ProviderProps) {
    const [windows, setWindows] = useState<OpenWindow[]>([]);
    const [stackOrder, setStackOrder] = useState<string[]>([]);

    const zIndexFor = useCallback(
        (id: string) => stackOrder.indexOf(id),
        [stackOrder]
    );

    function updateWindow(id: string, applyUpdate: (w: OpenWindow) => OpenWindow): void {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? applyUpdate(w) : w))
        );
    }

    async function openApp(id: string): Promise<void> {
        if (windows.some((w) => w.id === id)) {
            focusApp(id);
            return;
        }

        const app = apps.find((a) => a.id === id);
        if (!app) return;

        if (app.onActivate) {
            await app.onActivate();
            return;
        }

        if (app.guard) {
            const allowed = await app.guard();
            if (!allowed) return;
        }

        const { width: w, height: h } = app.defaultSize;
        const newWindow: OpenWindow = {
            id: app.id,
            position: {
                x: Math.max(0, (window.innerWidth - w) / 2),
                y: Math.max(0, (window.innerHeight - h) / 2),
            },
            size: { width: w, height: h },
            minimized: false,
        };

        setWindows((prev) => [...prev, newWindow]);
        setStackOrder((prev) => [...prev.filter((x) => x !== id), id]);
    }

    function openWindow({ id, title, size, render }: DynamicWindowConfig): void {
        if (windows.some((w) => w.id === id)) {
            focusApp(id);
            return;
        }
        const newWindow: OpenWindow = {
            id,
            title,
            render,
            position: {
                x: Math.max(0, (window.innerWidth - size.width) / 2),
                y: Math.max(0, (window.innerHeight - size.height) / 2),
            },
            size,
            minimized: false,
        };
        setWindows((prev) => [...prev, newWindow]);
        setStackOrder((prev) => [...prev.filter((x) => x !== id), id]);
    }

    function closeApp(id: string): void {
        setWindows((prev) => prev.filter((w) => w.id !== id));
        setStackOrder((prev) => prev.filter((x) => x !== id));
    }

    function focusApp(id: string): void {
        setStackOrder((prev) => moveToTop(prev, id));
        updateWindow(id, (w) => ({ ...w, minimized: false }));
    }

    function minimizeApp(id: string): void {
        updateWindow(id, (w) => ({ ...w, minimized: true }));
    }

    function setPosition(id: string, p: Coord): void {
        updateWindow(id, (w) => ({ ...w, position: p }));
    }

    function setSize(id: string, s: Dimension): void {
        updateWindow(id, (w) => ({ ...w, size: s }));
    }

    const value: WindowManager = useMemo(
        () => ({
            windows,
            zIndexFor,
            openApp,
            openWindow,
            closeApp,
            focusApp,
            minimizeApp,
            setPosition,
            setSize,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [windows, zIndexFor]
    );

    return (
        <WindowManagerContext.Provider value={value}>
            {children}
        </WindowManagerContext.Provider>
    );
}
