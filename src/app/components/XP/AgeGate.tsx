import { useEffect, useState } from "react";

let pendingResolver: ((value: boolean) => void) | null = null;
const listeners = new Set<(open: boolean) => void>();

function notify(open: boolean) {
    listeners.forEach((l) => l(open));
}

export function requestAgeConfirmation(): Promise<boolean> {
    if (pendingResolver) {
        pendingResolver(false);
        pendingResolver = null;
    }
    return new Promise<boolean>((resolve) => {
        pendingResolver = resolve;
        notify(true);
    });
}

function resolve(value: boolean) {
    pendingResolver?.(value);
    pendingResolver = null;
    notify(false);
}

export function AgeGateDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const l = (next: boolean) => setOpen(next);
        listeners.add(l);
        return () => {
            listeners.delete(l);
        };
    }, []);

    if (!open) return null;

    return (
        <div
            className="age-gate-backdrop"
            onClick={() => resolve(false)}
        >
            <div
                className="window age-gate-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="age-gate-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="title-bar">
                    <div className="title-bar-text" id="age-gate-title">
                        Confirm Age
                    </div>
                    <div className="title-bar-controls">
                        <button
                            aria-label="Close"
                            onClick={() => resolve(false)}
                        />
                    </div>
                </div>
                <div className="window-body">
                    <p>
                        By selecting <strong>ENTER</strong> you are confirming
                        that you are over the age of 18, and consenting to
                        seeing mind-altering and lifestyle-changing adult
                        entertainment.
                    </p>
                    <section
                        className="field-row"
                        style={{ justifyContent: "flex-end" }}
                    >
                        <button onClick={() => resolve(false)}>Cancel</button>
                        <button
                            onClick={() => resolve(true)}
                            autoFocus
                        >
                            Enter
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
