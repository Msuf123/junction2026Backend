
const three = require("express").Router();
const path = require("path");
const fs = require("fs");

three.get("/getModel/:name", (req, res) => {
    try {
        const modelPath = process.env.THREE_D_MODEL_PATH;
        const { name } = req.params;

        if (!modelPath) {
            return res.status(500).json({
                error: "THREE_D_MODEL_PATH is not configured"
            });
        }

        // Prevent directory traversal and restrict access to GLB files
       if (!/^[a-zA-Z0-9_-]+\.(glb|vrm)$/i.test(name)) {
    return res.status(400).json({
        error: "Invalid model name"
    });
}

        const filePath = path.resolve(modelPath, name);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "Model not found"
            });
        }

      const ext = path.extname(name).toLowerCase();

res.setHeader(
    "Content-Type",
    ext === ".vrm"
        ? "model/gltf-binary"
        : "model/gltf-binary"
);

res.setHeader("Access-Control-Allow-Origin", "*");

return res.sendFile(filePath);

    } catch (error) {
        console.error("Error serving 3D model:", error);

        return res.status(500).json({
            error: "Failed to load 3D model"
        });
    }
});

three.post("/speak", async (req, res) => {
    try {
        const text = req.body.text;

        if (!text || typeof text !== "string") {
            return res.status(400).json({
                error: "Text is required"
            });
        }

        if (text.length > 1000) {
            return res.status(400).json({
                error: "Text is too long"
            });
        }

        // Send text to local Piper server
        const response = await fetch(
            "http://127.0.0.1:5000/synthesize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            }
        );

        if (!response.ok) {
            throw new Error("Piper synthesis failed");
        }

        const audioBuffer = Buffer.from(
            await response.arrayBuffer()
        );

        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Content-Length", audioBuffer.length);

        return res.send(audioBuffer);

    } catch (error) {
        console.error("Piper TTS error:", error);

        return res.status(500).json({
            error: "Speech generation failed"
        });
    }
});

module.exports = three;
