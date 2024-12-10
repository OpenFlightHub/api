import Aedes from 'aedes'
import { createServer } from 'net'

const port = 8081

const aedes = new Aedes()
const server = createServer(aedes.handle)

server.listen(port, function () {
  console.log('mqtt server started and listening on port ', port)
})