import { PropsWithChildren } from "react";
import styles from "./layout.module.scss";
import Image from "next/image";
import Link from "next/link";
import Backdrop from "./Backdrop";
import { LinkSection } from "./LinkSection";
import Breadcrumbs from "./Breadcrumbs";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <Backdrop />
            <div className={styles.layout}>
                <div className={styles.nav}>
                    <div className={styles.sticky}>
                        <div className={styles.homeLink}>
                            <Link className={styles.logo} href="/">
                                <Image alt="Job logo" src="/job-logo.svg" width={64} height={64} />
                            </Link>
                            <strong className={styles.myName}><Link href="/">Lawrence Job</Link></strong>
                            <strong className={styles.breadcrumbs}><Breadcrumbs /></strong>
                        </div>
                        <nav className={styles.nav}>
                            <LinkSection>
                                <div>I&apos;m a software engineer and architect.</div>
                                <div>I&apos;m still working on this website, but welcome!</div>
                                <Link href="/works">Projects</Link>
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