
 

// Based off a tweet and codesandbox:
// https://mobile.twitter.com/hieuhlc/status/1164369876825169920
import { useCallback, useLayoutEffect, useRef } from "react";

export default (cb: () => void) => {
  if (typeof performance === "undefined" || typeof window === "undefined") {
    return;
  }
  const frame = useRef<number | undefined>();

  const animate = useCallback(() => {
    cb();
    frame.current = requestAnimationFrame(animate);
  }, [cb]);

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => { frame.current && cancelAnimationFrame(frame.current) };
  }, [animate]);
};