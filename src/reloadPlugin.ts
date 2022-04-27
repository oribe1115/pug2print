import type { Plugin } from 'rollup'
import { parse } from 'node-html-parser'
import WebSocket, { WebSocketServer } from 'ws'

const port = 24678
const virtualScriptId = '/@pug2print:reload/script.js'
const virtualScript = `
  const ws = new WebSocket('ws://localhost:${port}/')
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data)
    if (msg.type === 'reload') {
      location.reload() // リロードというメッセージが来たらページをリロードする
    }
  })
`

export const reload = (): Plugin => {
  return {
    name: 'pug2print:reload',
    async resolveId(id: string) {
      // virtualScriptIdのものはそのまま解決できると指定する
      if (id === virtualScriptId) return virtualScriptId
      return null
    },
    async load(id: string) {
      // virtualScriptIdの内容としてvirtualScriptを返す
      if (id === virtualScriptId) {
        return virtualScript
      }
      return null
    },
    async transform(code, id) {
      if (!id.endsWith('.html')) return null

      // HTMLのheadタグの末尾にvirtualScriptIdへのリンクのあるscriptタグを挿入する
      const doc = parse(code)
      doc
        .querySelector('head')
        ?.insertAdjacentHTML('beforeend', `<script type="module" src="${virtualScriptId}">`)

      return doc.toString()
    }
  }
}

interface Data {
  type: string
}

export const setupReloadServer = () => {
  const wss = new WebSocketServer({
    port,
    host: 'localhost'
  })

  let ws: WebSocket
  wss.on('connection', connectedWs => {
    ws = connectedWs
  })

  return {
    send(data: Data) {
      if (!ws) return
      ws.send(JSON.stringify(data))
    }
  }
}