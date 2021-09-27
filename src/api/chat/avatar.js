import axios from 'axios'

export const DEFAULT_AVATAR_URL = `img/noface.gif`
export const ADMIN_AVATAR_URL = `img/avater.png`

export function processAvatarUrl (avatarUrl) {
  // 去掉协议，兼容HTTP、HTTPS
  let m = avatarUrl.match(/(?:https?:)?(.*)/)
  if (m) {
    avatarUrl = m[1]
  }
  // 缩小图片加快传输
  if (!avatarUrl.endsWith('noface.gif')) {
    avatarUrl += '@48w_48h'
  }
  return avatarUrl
}
