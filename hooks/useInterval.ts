import { useEffect, useRef } from "react";

// Dan Abramov wala declarative setInterval hook

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(callback);

  // latest callback save rakho
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // interval setup
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
