import cac from 'cac'

const cli = cac()

cli.command('dev')
  .action(() => {
    console.log('dev server start')
  })

cli.help()

cli.parse()