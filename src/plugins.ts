import { reload } from './reloadPlugin'
import { resolve } from './resolvePlugin'

export const getPlugins = () => [
  resolve(),
  reload()
]