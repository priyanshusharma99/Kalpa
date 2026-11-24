import { useMemo } from "react";

import { useThreads } from "@liveblocks/react";

// max z-index nikaal rahe taaki new thread upar rahe
export const useMaxZIndex = () => {
  const { threads } = useThreads();

  return useMemo(() => {
    let max = 0;
    for (const thread of threads ?? []) {
      // @ts-ignore
      if (thread.metadata.zIndex > max) {
        // @ts-ignore
        max = thread.metadata.zIndex;
      }
    }
    return max;
  }, [threads]);
};
