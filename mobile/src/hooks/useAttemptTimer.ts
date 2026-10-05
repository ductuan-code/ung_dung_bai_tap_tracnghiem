import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ATTEMPT_SECONDS, AttemptClock } from '@/utils/attemptClock';

export function useAttemptTimer(enabled: boolean, onExpire: () => void) {
  const clock = useRef(new AttemptClock());
  const [remaining, setRemaining] = useState(ATTEMPT_SECONDS);
  const [attempted, setAttempted] = useState(false);
  const expire = useEffectEvent(onExpire);
  useEffect(() => {
    if (!enabled) return;
    clock.current.start(Date.now());
    const tick = () => {
      if (clock.current.submitted) return;
      const seconds = clock.current.remaining(Date.now());
      setRemaining(seconds);
      if (seconds === 0) expire();
    };
    const interval = setInterval(tick, 200);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [enabled]);
  function claimSubmit() {
    if (!clock.current.claimSubmit()) return false;
    setRemaining(clock.current.remaining(Date.now()));
    setAttempted(true);
    return true;
  }
  return {
    remaining,
    attempted,
    claimSubmit,
    canEdit: () => clock.current.canEdit(Date.now()),
  };
}
