import { nanoid } from 'nanoid';

export function generateRoomId(): string {
  return nanoid(6).toUpperCase();
}

export function generatePlayerId(): string {
  return nanoid(8);
}
