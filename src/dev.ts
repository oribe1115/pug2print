import connect from 'connect'
import historyApiFallback from 'connect-history-api-fallback'
import sirv from 'sirv'
import { createPluginContainer } from './pluginContainer'
import { getPlugins } from './plugins'
import { transformMiddleware } from './transformMiddleware'
import { setupReloadServer as setupWsServer } from './reloadPlugin'
import { createFileWatcher } from './fileWatcher'
import { renderPug } from './pugRenderer'

export const startDev = () => {
  const server = connect()
  server.listen(3000, 'localhost')
  const ws = setupWsServer()

  const plugins = getPlugins()
  const pluginContainer = createPluginContainer(plugins)

  server.use(transformMiddleware(pluginContainer))

  server.use(
    sirv(undefined, {
      dev: true,
      etag: true,
      setHeaders(res, pathname, stats) {
        res.setHeader('Access-Control-Allow-Origin', '*')
      },
    })
  )
  server.use(historyApiFallback() as any) // ファイルが存在しなかったときにindex.htmlを返すようにするミドルウェア

  renderPug('index.pug', 'dist')
  
  console.log('dev server running at http://localhost:3000')
  console.log('open https://vivliostyle.org/viewer/#src=http://localhost:3000/dist/index.html')

  createFileWatcher((eventName, path) => {
    console.log(`Detected file change (${eventName}) reloading!: ${path}`)
    if (/\.pug$/.test(path)){
      renderPug('index.pug', 'dist')
    }else {
      ws.send({ type: 'reload' })
    }
  })
}