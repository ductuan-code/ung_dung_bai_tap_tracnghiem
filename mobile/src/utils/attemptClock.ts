export const ATTEMPT_SECONDS = 60;

/** One instance per mounted attempt. A submitted attempt is never unlocked. */
export class AttemptClock {
  private deadline: number | null = null;
  submitted = false;
  start(now: number) {
    this.deadline ??= now + ATTEMPT_SECONDS * 1000;
  }
  remaining(now: number) {
    return this.deadline === null
      ? ATTEMPT_SECONDS
      : Math.max(0, Math.ceil((this.deadline - now) / 1000));
  }
  canEdit(now: number) {
    return !this.submitted && this.deadline !== null && this.remaining(now) > 0;
  }
  claimSubmit() {
    if (this.submitted || this.deadline === null) return false;
    this.submitted = true;
    return true;
  }
}
export function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
