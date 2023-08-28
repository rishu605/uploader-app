const net = require("net")
const fs = require("node:fs/promises")

const server = net.createServer(() => {

})


server.on("connection", (socket) => {
    console.log("New connection!")
    let fileHandle, fileStream

    socket.on("data", async (data) => {
        if(!fileHandle) {
            socket.pause() // no longer receive data until the file opens
            
            const indexOfDivider = data.indexOf("-------")
            const fileName = data.subarray(10, indexOfDivider).toString("utf-8")
                        
            fileHandle = await fs.open(`storage/${fileName}`, "w")
            fileStream = fileHandle.createWriteStream()
            // Writing to the destination file
            fileStream.write(data.subarray(indexOfDivider+7))

            socket.resume() //resume receiving dtaa once the file opens
            fileStream.on("drain", () => {
                socket.resume() 
            })
        } else {
            if(!fileStream.write(data)) {
                socket.pause()
            }
        }
    })
    
    // This close event happens when the client.js closes the socket
    socket.on("close", () => {
        if(fileHandle)
        fileHandle.close()
        fileHandle = undefined
        fileStream = undefined
        socket.end()
        console.log("Connection ended!")
    })
})

server.listen(3000, "::", () => {
    console.log("Uploader server opened on: ", server.address())
})