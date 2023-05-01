"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./backdrop.module.scss";
import useAnimationFrame from "@/utils/use-animation-frame";

import { createNoise3D } from 'simplex-noise';

function windowScaleFactors(window: Window, canvas: HTMLCanvasElement): [number, number] {
    return [window.innerWidth / canvas.width, window.innerHeight / canvas.height];
}

export default function Backdrop({ }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [mouse, setMouse] = useState<[number, number, Date] | null>(null);
    const [elementOfInterest, setElementOfInterest] = useState<Element | null>(null);

    const noise3d = useRef(createNoise3D());

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {

            // pick up the mouse coordinates
            console.log('has no existing');
            setMouse([e.clientX, e.clientY, new Date()]);

            // look for any elements behind the cursor
            const elementOfInterest = document.elementsFromPoint(e.clientX, e.clientY)
                .find(x => x instanceof HTMLAnchorElement || x instanceof HTMLButtonElement);

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
    });

    const render = useCallback(() => {

        // establish a drawing context
        const canvas = canvasRef.current;
        if (canvas == null) return;
        const ctx = canvas?.getContext('2d', { alpha: false });
        if (ctx == null) return;

        // figure out how to scale for the difference in size between canvas and screen
        const [x, y] = windowScaleFactors(window, canvas);

        // generate some horizontal noise based on the time
        const windX = Math.sin(new Date().getTime() / 400) * 2;
        const windY = Math.sin(new Date().getTime() / 1100) * 2;

        // move a blurry version of what was previously on the canvas but slightly higher
        ctx.filter = "blur(2px)";
        ctx.drawImage(canvas, windX / x, (windY - 0.1) / y);
        ctx.filter = "none";

        // dim what is currently on the screen rather than replacing it (fades exponentially)
        ctx.fillStyle = "rgba(20,20,20,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // if the mouse has moved recently, draw a circle
        if (mouse && new Date().getTime() - 200 < mouse[2].getTime()) {

            const [mX, mY, mDate] = mouse;

            const mouseAge = new Date().getTime() - mDate.getTime();

            ctx.fillStyle = `rgba(255, 225, 58, 1)`;
            ctx.beginPath();
            ctx.ellipse(mX / x, mY / y, 20 / x, 20 / y, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // if the mouse is over something interesting, draw a rectangle for it
        if (elementOfInterest) {
            ctx.fillStyle = '#ffe13a';
            ctx.beginPath();
            //ctx.rect(mouse[0] / x, mouse[1] / y, 100 / x, 100 / y);
            const { x: eX, y: eY, width, height } = elementOfInterest.getBoundingClientRect();
            ctx.fillRect(eX / x, eY / y, width / x, height / y);
        }

        // add noise to the screen
        const noise = noise3d.current;
        for (var i = 0; i < canvas.clientWidth / 20; i++) {
            for (var j = 0; j < canvas.clientHeight / 20; j++) {
                const opacity = (noise(i / 20, j / 20, new Date().getTime() / 1_0000 % 1_000) + 1) * 0.01;
                ctx.fillStyle = `rgba(255,255,255,${opacity})`;
                ctx.fillRect(i * 20, j * 20, 20, 20);
            }
        }

    }, [mouse, elementOfInterest]);

    useAnimationFrame(render);

    return <>
        <div className={styles.background}></div>
        <canvas ref={canvasRef} className={styles.canvas} width={300} height={300} />
        <div className={styles.foreground}></div>
    </>
}