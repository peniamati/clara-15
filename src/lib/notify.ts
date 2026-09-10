export function notify(message: string) {
  window.dispatchEvent(new CustomEvent('invitation-notice', { detail: message }));
}
