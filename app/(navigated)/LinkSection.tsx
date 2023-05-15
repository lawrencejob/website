"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import styles from "./LinkSection.module.scss";
import Link from "next/link";
import Image from "next/image";

type Props = PropsWithChildren<{
    startsWith?: string,
    title?: string,
}>;

export function LinkSection({ children, startsWith, title }: Props) {


    const pathname = usePathname();
    let show = false;

    if (!!startsWith) {
        if (pathname.startsWith(startsWith)) {
            show = true;
        }
    } else {
        show = pathname == "/";
    }

    return show ? <div className={styles.section}>
        {title && <div><strong>{title}</strong></div>}
        {children}
    </div> : null;
}