import chokidar from 'chokidar'

export const createFileWatcher = (onChange: (eventName: string, path: string) => void) => {
  const watcher = chokidar.watch('**/*', {
    ignored: ['.git'],
    ignoreInitial: true // リッスン開始時にイベントを発火しないようにする
  })
  watcher.on('all', (eventName, path) => {
    onChange(eventName, path) // 何か変更が起きたらonChangeを呼び出す
  })
}