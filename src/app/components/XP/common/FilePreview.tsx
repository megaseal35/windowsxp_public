import { useEffect, useState } from 'react';
import { Nillable } from '../../../../../shared/common';

export default function PreviewImageFile(props: { file: File; className?: string }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [imageURL, setImageURL] = useState<Nillable<string>>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);

            if (imageURL) {
                URL.revokeObjectURL(imageURL);
            }

            let blob: Nillable<Blob> = props.file;

            if (blob) {
                const url = URL.createObjectURL(blob);
                setImageURL(url);
            }

        })();

        return function cleanup() {
            if (imageURL) {
                URL.revokeObjectURL(imageURL);
                setImageURL(null);
            }
        };
    }, [props.file]);

    const onImageLoaded = () => {
        setLoading(false);
    };

    const onImageLoadError = () => {
        setLoading(false);
    };

    return (
        <>
            {imageURL && <img className={props.className} src={imageURL} alt="your image" onLoad={onImageLoaded} onError={onImageLoadError} />}
        </>
    );

}