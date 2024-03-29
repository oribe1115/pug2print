import { NextHandleFunction } from 'connect'
import { PluginContainer } from './pluginContainer'

export const transformMiddleware = (pluginContainer: PluginContainer): NextHandleFunction => {
  const transformRequest = async (pathname: string): Promise<{ mime?: string, content: string } | null> => {
    const idResult = await pluginContainer.resolveId(pathname) || { id: pathname }

    const loadResult = await pluginContainer.load(idResult.id)
    if (!loadResult) {
      return null
    }

    const code = typeof loadResult === 'string' ? loadResult : loadResult.code
    const transformResult = await pluginContainer.transform(code, idResult.id)
    if (!transformResult) {
      return null
    }

    let mime = undefined
    if (/\.[jt]s$/.test(idResult.id)){
        mime = 'application/javascript'
    }else if (/\.html$/.test(idResult.id)){
        mime = 'text/html'
    }

    return {
      mime: mime,
      content: transformResult.code
    }
  }

  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    // res.setHeader("Content-Type", "text/html")
    res.setHeader('Access-Control-Allow-Origin', '*')

    let url: URL
    try {
      url = new URL(req.url!, 'http://example.com')
    } catch (e) {
      return next(e)
    }
    const pathname = url.pathname

    if (!/\.([jt]s|html)$/.test(pathname)){
      // transformする必要がない普通のファイルはsirvで配信
      return next()
    }

    try {
      const result = await transformRequest(pathname)
      if (result) {
        res.statusCode = 200
        if (result.mime) {
          res.setHeader('Content-Type', result.mime)
        }
        return res.end(result.content)
      }
    } catch (e) {
      return next(e)
    }

    next()
  }
}