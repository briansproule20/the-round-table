import { Player } from "./types"

const PLAYER_ID_KEY = "camelot_player_id"
const PLAYER_NAME_KEY = "camelot_player_name"

export function getPlayer(): Player | null {
  if (typeof window === "undefined") return null
  const id = localStorage.getItem(PLAYER_ID_KEY)
  const name = localStorage.getItem(PLAYER_NAME_KEY)
  if (!id || !name) return null
  return { id, name }
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name)
}

export function initPlayer(name: string): Player {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  localStorage.setItem(PLAYER_NAME_KEY, name)
  return { id, name }
}
