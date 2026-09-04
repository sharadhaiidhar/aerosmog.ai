// utils/session.ts — Persistent browser session ID
import { v4 as uuidv4 } from 'uuid';

const KEY = 'aerosmog_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEY, id);
  }
  return id;
}
