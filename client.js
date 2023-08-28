const net = require("net")
const fs = require("node:fs/promises")
const path = require("path")

const clearLine = (dir) => {
    return new Promise((resolve) => {
        process.stdout.clearLine(dir, () => {
            resolve()
        })
    })
}

const moveCursor = (dx, dy) => {
    return new Promise((resolve) => {
        process.stdout.moveCursor(dx, dy, () => {
            resolve()
        })
    })
}

const socket = net.createConnection({host: "::1", port: 3000}, async () => {
    const filePath = process.argv[2]
    const fileName = path.basename(filePath)
    const fileHandle = await fs.open(filePath, "r")
    const fileStream = fileHandle.createReadStream()
    const fileSize = (await fileHandle.stat()).size

    let uploadedPercentage = 0
    let bytesUploaded = 0
    socket.write(`filename: ${fileName}-------`)
    console.log()
    // Reading from the source file
    fileStream.on("data", async (data) => {
        if(!socket.write(data)) {
            fileStream.pause()
        }

        bytesUploaded += data.length // add the number of bytes read
        let newPercentage = Math.floor((bytesUploaded / fileSize)*100)
        if(newPercentage % 5 === 0 && newPercentage !== uploadedPercentage) {
            uploadedPercentage = newPercentage
            await moveCursor(0, -1)
            await clearLine(0)
            console.log(`Uploading... ${uploadedPercentage}% complete`)
        }
    })

    socket.on("drain", () => {
        fileStream.resume()
    })

    fileStream.on("end", () => {
        console.log("The file was successfully uploaded!")
        socket.end()
    })
})