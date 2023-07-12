/* eslint-disable @next/next/no-img-element */
import React, { FC, useEffect, useRef, useState } from "react";
import styles from '@/components/icon/icon.module.scss'

const Icon: FC<{ url: string }> = ({ url }) => {
    const [type, setType] = useState<string>('');
    const iconComponent = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        const isWebLink = url.includes('https') || url.includes('http');

        if (isWebLink) {
            setType('img');
            return;
        }

        const splittedUrl = url.split('.');
        const isSvg = splittedUrl.includes('svg');
    
        if (!isSvg) {
          return;
        }

        setType('svg');
    
        fetch(url, {
            mode: 'no-cors',
        })
            .then((response) => response.text())
            .then((svgUrl) => (iconComponent.current!.innerHTML = svgUrl));
    }, [url])
    
    return (
        <div ref={iconComponent} className={styles.iconContainer}>
            {type !== 'svg' && <img src={url} alt="icon" />}
        </div>
    )
}

export default Icon;