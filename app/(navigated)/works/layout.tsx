import { PropsWithChildren } from "react";
import styles from "./page.module.scss";

export default function Page({ children }: PropsWithChildren) {
    return <main className={styles.articleMain}><article className={styles.article}>{children}</article></main>
}