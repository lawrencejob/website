import { PropsWithChildren } from "react";
import styles from "./layout.module.scss";
import Image from "next/image";
import Link from "next/link";
import Backdrop from "./Backdrop";
import { LinkSection } from "./LinkSection";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <Backdrop />
            <div className={styles.layout}>
                <div className={styles.nav}>
                    <div className={styles.sticky}>
                        <Link href="/" className={styles.homeLink}>
                            <Image className={styles.logo} alt="Job logo" src="/job-logo.svg" width={64} height={64} />
                            <strong className={styles.myName}>Lawrence Job</strong>
                            <hr className={styles.hr} />
                        </Link>
                        <nav className={styles.nav}>
                            <LinkSection>
                                <div>I&apos;m working on a new website right now.</div>
                            </LinkSection>
                            <LinkSection startsWith="/works" title="Projects">
                                <Link href="/works/situ">SITU</Link>
                                <Link href="/works/this">lawrencejob.com</Link>
                            </LinkSection>
                        </nav>
                    </div>
                </div>
                {children}
            </div>
        </>
    )
}