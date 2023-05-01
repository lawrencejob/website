import { PropsWithChildren } from "react";
import styles from "./layout.module.scss";
import Image from "next/image";
import Link from "next/link";
import Backdrop from "./Backdrop";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <Backdrop />
            <div className={styles.layout}>
                <div>
                    <Image className={styles.logo} alt="Job logo" src="/job-logo.svg" width={96} height={96}></Image>
                    <strong className={styles.myName}>Lawrence Job</strong>
                    <hr className={styles.hr} />
                    <nav className={styles.nav}>
                        <div>I'm working on a new website right now.</div>
                        {/* <Link href="/">Homepage</Link>
                        <Link href="/">About me</Link>
                        <Link href="/">Find me</Link>
                        <Link href="/">Homepage</Link> */}
                    </nav>
                </div>
                <div>{children}</div>
            </div>
        </>
    )
}