import { useRef } from 'react';
import { ALLOWED_MIME, MAX_BYTES } from '../../../../../shared/common';

type UploadButtonProps = {
    onAttachFile: (file: File) => void;
    onError?: (errorMessage: string) => void;
    buttonText?: string;
    accept?: string;
    showSizeLimit?: boolean;
}

export default function UploadButton({
    onAttachFile,
    onError,
    buttonText = 'Browse...',
    accept,
    showSizeLimit = true,
}: UploadButtonProps) {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const onInputClick = async (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        // @ts-ignore
        event.currentTarget.value = null;
    };

    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0]) {
            return;
        }

        const file = event.target.files[0];

        if (file.size > MAX_BYTES) {
            if (onError) {
                onError(`File size should not exceed ${MAX_BYTES}MB.`);
            }
            return;
        }

        if (onAttachFile) {
            onAttachFile(file);
        }
    };

    const handleClickOpen = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    };
    return (
        <label htmlFor='attach-file'>
            <input
                ref={inputFileRef}
                style={{ display: 'none' }}
                accept={accept ?? Array.from(ALLOWED_MIME).join(',')}
                id='attach-file'
                name='attach-file'
                onChange={onFileChange}
                onClick={onInputClick}
                type='file'
            />
            <button type="button" onClick={handleClickOpen}>
                {buttonText}
            </button>
        </label>
    );
};
