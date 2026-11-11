
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
        if (!/^[a-zA-Z0-9_-]+\.glb$/.test(name)) {
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

        res.setHeader("Content-Type", "model/gltf-binary");
        res.setHeader("Access-Control-Allow-Origin", "*");

        return res.sendFile(filePath);

    } catch (error) {
        console.error("Error serving 3D model:", error);

        return res.status(500).json({
            error: "Failed to load 3D model"
        });
    }
});

module.exports = three;
