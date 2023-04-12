import { RtAudio, RtAudioFormat } from "audify"

const testVAC = async () => {

    const joinBuffers = (buffers: number[][], size: number): Buffer => {
        const length = buffers[0].length
        const channels = buffers.length

        let array: number[] = []

        for (let i = 0; i < length; i+=size) {
            for (let j = 0; j < channels; j++) {
                for (let k = 0; k < size; k++) {
                    array.push(buffers[j][i+k])
                }
            }
        }

        return Buffer.from(array)
    }

    const rtAudio = new RtAudio()

    const devices = rtAudio.getDevices()
    devices.forEach((device) => {
        console.log(device)
    })
    // return

    const deviceName = "virtual-audio-capturer"
    const device = devices.find((device) => device.name === deviceName)

    if (!device) return
    console.log('DEVICE', device)

    const virtualAudioLoopback = {
        deviceId: device.id,
        nChannels: device.inputChannels,
        firstChannel: 0
    }

    console.log(`\nvirtualAudioLoopback: ${JSON.stringify(virtualAudioLoopback)}`)

    const dataSize = 2
    const frameSize = 1920
    const channels = virtualAudioLoopback.nChannels
    const length = frameSize * channels * dataSize

    rtAudio.openStream(
        virtualAudioLoopback,
        virtualAudioLoopback,
        RtAudioFormat.RTAUDIO_SINT16,
        44100,
        frameSize,
        "MyStream",
        () => {
            const buffers: number[][] = []

            while (buffers.length < channels) {
                buffers.push(new Array(frameSize*dataSize).fill(buffers.length))
            }

            const resp = joinBuffers(buffers, dataSize)

            if (resp.length !== length) {
                console.warn(`buffer length is not correct (${resp.length} instead of ${length})`)
                return
            }
            rtAudio.write(resp)
        },
        null
    )

    rtAudio.start()
    console.log(`streaming`)
}

const main = async () => {
    testVAC()
}

main()