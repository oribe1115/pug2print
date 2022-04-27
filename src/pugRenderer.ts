import { exec } from "child_process"

export const renderPug = (targetFile: string, outputDir: string)=>{
    exec(`pug ${targetFile} -o ${outputDir}`,  (err, stdout, stderr) => {
        if (err) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      })
}