import type { Plugin } from 'rollup'
import { parse } from 'node-html-parser'

const virtualScriptId = '/@pug2print:reload/script.js'
const virtualScript = `
  console.log('bar')
` // とりあえずbarとコンソールに出力することにする

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