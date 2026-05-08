type ConfirmDialogProps = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    busy,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <div className="age-gate-backdrop">
            <div
                className="window age-gate-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="title-bar">
                    <div className="title-bar-text" id="confirm-dialog-title">
                        {title}
                    </div>
                    <div className="title-bar-controls">
                        <button aria-label="Close" onClick={onCancel} disabled={busy} />
                    </div>
                </div>

                <div className="window-body">
                    <p style={{ margin: "8px 0" }}>{message}</p>

                    <section className="field-row" style={{ justifyContent: "flex-end" }}>
                        <button type="button" onClick={onCancel} disabled={busy}>
                            {cancelLabel}
                        </button>
                        <button type="button" onClick={onConfirm} disabled={busy}>
                            {busy ? "Working…" : confirmLabel}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
