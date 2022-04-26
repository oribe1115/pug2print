import cac from 'cac'
import { startDev } from './dev'

const cli = cac()

cli.command('dev')
  .action(() => {
    startDev()
  })

cli.help()

cli.parse()