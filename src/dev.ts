import connect from 'connect'
import historyApiFallback from 'connect-history-api-fallback'
import sirv from 'sirv'
import { createPluginContainer } from './pluginContainer'
import { getPlugins } from './plugins'
import { transformMiddleware } from './transformMiddleware'
import { exec } from "child_process"

export const startDev = () => {
  const server = connect()
  server.listen(3000, 'localhost')

  const plugins = getPlugins()
  const pluginContainer = createPluginContainer(plugins)

  server.use(transformMiddleware(pluginContainer))

  server.use(
    sirv(undefined, {
      dev: true,
      etag: true
    })
  )
  server.use(historyApiFallback() as any) // ファイルが存在しなかったときにindex.htmlを返すようにするミドルウェア

  exec("vivliostyle preview http://localhost:3000/index.html --http", (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })

  console.log('dev server running at http://localhost:3000')
}