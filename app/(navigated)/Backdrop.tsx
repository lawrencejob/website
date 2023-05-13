"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./backdrop.module.scss";
import useAnimationFrame from "@/utils/use-animation-frame";

import { createNoise3D } from 'simplex-noise';
import { usePathname } from "next/navigation";
import { useThrottle } from "react-use";

function windowScaleFactors(window: Window, canvas: HTMLCanvasElement): [number, number] {
    return [window.innerWidth / canvas.width, window.innerHeight / canvas.height];
}

export default function Backdrop({ }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const pathname = usePathname();

    const [mouse, setMouse] = useState<[number, number, Date] | null>(null);
    const debouncedMouse = useThrottle(mouse, 10);
    const [elementOfInterest, setElementOfInterest] = useState<Element | null>(null);

    const noise3d = useRef(createNoise3D());

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {

            // pick up the mouse coordinates
            setMouse([e.clientX, e.clientY, new Date()]);

            // look for any elements behind the cursor
            const elementOfInterest = document.elementsFromPoint(e.clientX, e.clientY)
                .find(x => x instanceof HTMLAnchorElement || x instanceof HTMLButtonElement || x.nodeName === "SMALL");

            if (elementOfInterest) {
                setElementOfInterest(elementOfInterest);
            } else {
                setElementOfInterest(null);
            }
        }

        window.addEventListener("pointermove", onPointerMove);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
        }
    }, []);

    const render = useCallback(() => {

        const frameTime = new Date().getTime();

        // establish a drawing context
        const canvas = canvasRef.current;
        if (canvas == null) return;
        const ctx = canvas?.getContext('2d', { alpha: false });
        if (ctx == null) return;

        // figure out how to scale for the difference in size between canvas and screen
        const [x, y] = windowScaleFactors(window, canvas);

        // generate some horizontal noise based on the time
        const windX = Math.sin(frameTime / 400) / 10;
        const windY = Math.sin(frameTime / 1100) / 10;

        // move a blurry version of what was previously on the canvas but slightly higher
        ctx.filter = "blur(2px)";
        ctx.drawImage(canvas, windX * x, (windY - 0.1) * y);
        ctx.filter = "none";

        // dim what is currently on the screen rather than replacing it (fades exponentially)
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // if the mouse has moved recently, draw a circle
        if (debouncedMouse && frameTime - 200 < debouncedMouse[2].getTime()) {

            // const mouseAge = frameTime - mDate.getTime();
            ctx.fillStyle = `rgba(255, 225, 58, 1)`;
            ctx.beginPath();
            ctx.ellipse(debouncedMouse[0] / x, debouncedMouse[1] / y, 20 / x, 20 / y, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // if the mouse is over something interesting, draw a rectangle for it
        if (elementOfInterest) {
            ctx.fillStyle = '#ffe13a';
            ctx.beginPath();
            //ctx.rect(mouse[0] / x, mouse[1] / y, 100 / x, 100 / y);
            const rects = elementOfInterest.getClientRects();
            for (const rect of rects) {
                const { x: eX, y: eY, width, height } = rect;
                ctx.fillRect(eX / x, eY / y, width / x, height / y);
            }

        }

        const dreamColors = [
            'rgba(255,255,255,0.005)',
            'rgba(255,255,255,0.01)',
            'rgba(255,255,255,0.02)',
            'rgba(255,255,255,0.03)',
            'rgba(255,255,255,0.05)',
        ]

        const time = frameTime / 1_0000 % 1_000;

        if (pathname == "/") {

            // add noise to the screen
            const noise = noise3d.current;
            for (var i = 0; i < canvas.width / 20; i++) {
                for (var j = 0; j < canvas.height / 20; j++) {
                    const n = Math.floor((noise(i / 20, j / 20, time) + 1) * 2.5);
                    if (n != 0) {
                        ctx.fillStyle = dreamColors[n];
                        ctx.fillRect(i * 20, j * 20, 20, 20);
                    }
                }
            }

        }

    }, [debouncedMouse, elementOfInterest, pathname]);

    useAnimationFrame(render);

    return <>
        <div className={styles.background}></div>
        <canvas ref={canvasRef} className={styles.canvas} width={300} height={300} />
        <div className={styles.foreground}></div>
    </>
}