"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./breadcrumbs.module.scss";

export default function Breadcrumbs() {
    const pathname = usePathname();

    if (pathname == "/") {
        return <span className={styles.isHome}>Software Engineer and Architect</span>;
    }

    return <>
        <Image src="/icon-return.svg" alt="Back" width={11} height={9} className={styles.backIcon} />
        <Link className={styles.breadcrumb} href="/">Projects</Link>
        {/* <Image src="/icon-tab.svg" alt="Back" width={11} height={9} className={styles.backIcon} />
        <Link className={styles.breadcrumb} href="/">lawrencejob.com</Link>
        <Image src="/icon-tab.svg" alt="Back" width={11} height={9} className={styles.backIcon} />
        <Link className={styles.breadcrumb} href="/">Inner Page</Link> */}
    </>;
}