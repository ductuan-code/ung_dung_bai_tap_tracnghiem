import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { errorMessage } from '@/utils/study';

/** Fetch on focus and explicit refresh. Ignore late responses after blur/new requests. */
export function useScreenData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });
  const generation = useRef(0);
  const run = useCallback(async () => {
    const current = ++generation.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await loader();
      if (current === generation.current)
        setState({ data, loading: false, error: null });
    } catch (error) {
      if (current === generation.current)
        setState({ data: null, loading: false, error: errorMessage(error) });
    }
  }, [loader]);
  useFocusEffect(
    useCallback(() => {
      // Schedule the external request after focus; cleanup cancels pending work/results.
      let active = true;
      void Promise.resolve().then(() => {
        if (active) void run();
      });
      return () => {
        active = false;
        generation.current++;
      };
    }, [run]),
  );
  return { ...state, refresh: run };
}
