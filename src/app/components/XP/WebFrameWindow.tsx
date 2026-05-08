type WebFrameWindowProps = {
    url: string;
    sandbox?: string;
};

export default function WebFrameWindow({ url, sandbox }: WebFrameWindowProps) {
    return (
        <iframe
            src={url}
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", border: 0 }}
        />
    );
}
