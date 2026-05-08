import { useState } from 'react';
import { Coord } from '../../types/common';
import XPDesktopIcon from './XPDesktopIcon';
import { WindowManagerProvider, useWindowManager } from './WindowManager';
import XPWindow from './XPWindow';
import type { XPApp } from './types';
import { AgeGateDialog } from './AgeGate';
import { ExternalLinkDialog } from './apps/ExternalLinkDialog';
import { getDesktopApps } from './apps/registry';

type XPDesktopProps = {
    apps: XPApp[]
}

export default function XPDesktop({ apps }: XPDesktopProps) {
    return (
        <WindowManagerProvider apps={apps}>
            <div className="xp-desktop">
                <DesktopIcons apps={getDesktopApps(apps)} />
                <OpenWindows apps={apps} />
                <AgeGateDialog />
                <ExternalLinkDialog />
            </div>
        </WindowManagerProvider>
    );
}

const ICON_STAGGER_Y = 80;

function defaultIconPosition(index: number): Coord {
    return { x: 0, y: index * ICON_STAGGER_Y };
}

function DesktopIcons({ apps }: { apps: XPApp[] }) {
    const { openApp } = useWindowManager();
    const [iconPositions, setIconPositions] = useState<Record<string, Coord>>({});

    return (
        <div className="icon-grid">
            {apps.map((app, i) => (
                <XPDesktopIcon
                    key={app.id}
                    position={iconPositions[app.id] ?? defaultIconPosition(i)}
                    setPosition={(p) =>
                        setIconPositions((prev) => ({ ...prev, [app.id]: p }))
                    }
                    text={app.icon.label}
                    emoji={app.icon.emoji}
                    imageSrc={app.icon.imageSrc}
                    onOpen={() => openApp(app.id)}
                />
            ))}
        </div>
    );
}

function OpenWindows({ apps }: { apps: XPApp[] }) {
    const {
        windows,
        zIndexFor,
        setPosition,
        setSize,
        closeApp,
        focusApp,
    } = useWindowManager();

    return (
        <>
            {windows.map((w) => {
                const isDynamic = w.render !== undefined;
                const app = apps.find((a) => a.id === w.id);
                if (!isDynamic && (!app || app.render === undefined)) return null;
                const title = isDynamic ? (w.title ?? '') : app!.title;
                return (
                    <XPWindow
                        key={w.id}
                        title={title}
                        position={w.position}
                        setPosition={(p) => setPosition(w.id, p)}
                        size={w.size}
                        setSize={(s) => setSize(w.id, s)}
                        zIndex={zIndexFor(w.id)}
                        onClose={() => closeApp(w.id)}
                        onFocus={() => focusApp(w.id)}
                    >
                        {isDynamic ? w.render!(() => closeApp(w.id)) : app!.render!()}
                    </XPWindow>
                );
            })}
        </>
    );
}
