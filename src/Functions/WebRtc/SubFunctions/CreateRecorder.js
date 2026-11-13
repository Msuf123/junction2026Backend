const fs = require("fs");
const path = require("path");
const wrtc = require("@roamhq/wrtc");
const { nonstandard,
} = wrtc;
const { RTCAudioSink } = nonstandard;

function createRecorder(track,userId) {
    const directory = path.join(process.cwd(), "recordings");

    fs.mkdirSync(directory, { recursive: true });

    const filename = `recording-${userId}-${Date.now()}.wav`;
    const filepath = path.join(directory, filename);

    const fd = fs.openSync(filepath, "w");

    // Reserve WAV header
    fs.writeSync(fd, Buffer.alloc(44));

    let dataSize = 0;
    let sampleRate = 48000;
    let channels = 1;
    let chunks = 0;
    let maxVolume = 0;

    const sink = new RTCAudioSink(track);

    sink.ondata = (data) => {
        if (!data.samples || data.samples.length === 0) {
            return;
        }

        sampleRate = data.sampleRate;
        channels = data.channelCount || 1;

        const samples = data.samples;

        // Measure audio volume
        let peak = 0;

        for (let i = 0; i < samples.length; i++) {
            peak = Math.max(peak, Math.abs(samples[i]));
        }

        maxVolume = Math.max(maxVolume, peak);
        chunks++;

        // Convert Int16 PCM samples to little-endian bytes
        const pcm = Buffer.allocUnsafe(samples.length * 2);

        for (let i = 0; i < samples.length; i++) {
            pcm.writeInt16LE(samples[i], i * 2);
        }

        fs.writeSync(fd, pcm);
        dataSize += pcm.length;

        if (chunks % 100 === 0) {
            console.log("Audio recording:", {
                chunks,
                sampleRate,
                channels,
                peak,
                maxVolume,
                dataSize,
            });
        }
    };

    console.log("Recording started:", filepath);

    return () => {
        sink.stop();

        const header = Buffer.alloc(44);

        header.write("RIFF", 0);
        header.writeUInt32LE(36 + dataSize, 4);
        header.write("WAVE", 8);

        header.write("fmt ", 12);
        header.writeUInt32LE(16, 16);
        header.writeUInt16LE(1, 20);
        header.writeUInt16LE(channels, 22);
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(sampleRate * channels * 2, 28);
        header.writeUInt16LE(channels * 2, 32);
        header.writeUInt16LE(16, 34);

        header.write("data", 36);
        header.writeUInt32LE(dataSize, 40);

        fs.writeSync(fd, header, 0, 44, 0);
        fs.closeSync(fd);

        console.log("Recording finished:", {
            filepath,
            chunks,
            sampleRate,
            channels,
            dataSize,
            maxVolume,
        });
    };
}
module.exports={createRecorder}