import { useEffect, useState } from "react";

type Pending = {
    url: string;
    resolver: (value: boolean) => void;
};

let pending: Pending | null = null;
const listeners = new Set<(p: Pending | null) => void>();

function notify(p: Pending | null) {
    listeners.forEach((l) => l(p));
}

export function requestExternalNavigation(url: string): Promise<boolean> {
    if (pending) {
        pending.resolver(false);
        pending = null;
    }
    return new Promise<boolean>((resolve) => {
        pending = { url, resolver: resolve };
        notify(pending);
    });
}

function resolve(value: boolean) {
    pending?.resolver(value);
    pending = null;
    notify(null);
}

export function ExternalLinkDialog() {
    const [current, setCurrent] = useState<Pending | null>(null);

    useEffect(() => {
        const l = (p: Pending | null) => setCurrent(p);
        listeners.add(l);
        return () => {
            listeners.delete(l);
        };
    }, []);

    if (!current) return null;

    return (
        <div
            className="age-gate-backdrop"
            onClick={() => resolve(false)}
        >
            <div
                className="window age-gate-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ext-link-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="title-bar">
                    <div className="title-bar-text" id="ext-link-title">
                        Leaving site
                    </div>
                    <div className="title-bar-controls">
                        <button aria-label="Close" onClick={() => resolve(false)} />
                    </div>
                </div>
                <div className="window-body">
                    <p>
                        You're about to leave this site and open the link
                        below in a new tab.
                    </p>
                    <p className="ext-link-url">{current.url}</p>
                    <section
                        className="field-row"
                        style={{ justifyContent: "flex-end" }}
                    >
                        <button onClick={() => resolve(false)}>Cancel</button>
                        <button onClick={() => resolve(true)} autoFocus>
                            OK
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
