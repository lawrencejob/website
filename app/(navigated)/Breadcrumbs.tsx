"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./breadcrumbs.module.scss";
import { AnimatePresence, MotionConfig, Variants, motion } from "framer-motion";

export default function Breadcrumbs() {
    const pathname = usePathname();

    const framerVariants: Variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return <>
        <MotionConfig transition={{ duration: 0.5 }}>
            <AnimatePresence mode="wait">
                {pathname == "/"
                    ? <motion.span key="default" variants={framerVariants} className={styles.isHome}>Software Engineer and Architect</motion.span>
                    : <>
                        <motion.div key="breadcrumb_point_0" variants={framerVariants}>
                            <Image src="/icon-return.svg" alt="Back" width={11} height={9} />
                        </motion.div>
                        <motion.div key="breadcrumb_link_1" variants={framerVariants}>
                            <Link className={styles.breadcrumb} href="/works">Projects</Link>
                        </motion.div>
                        {/* <Image src="/icon-tab.svg" alt="" width={11} height={9} />
                <Link className={styles.breadcrumb} href="/">lawrencejob.com</Link>
                <Image src="/icon-tab.svg" alt="Back" width={11} height={9} />
                <Link className={styles.breadcrumb} href="/">Inner Page</Link> */}
                    </>}
            </AnimatePresence>
        </MotionConfig>
    </>

}