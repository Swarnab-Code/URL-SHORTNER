import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import shortUrlRoutes from "./routes/shortUrls.js"
import redirectRoutes from "./routes/redirect.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	}),
)
app.use(express.json())

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to MongoDB")
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error)
	})

app.use("/shorturls", shortUrlRoutes)
app.use("/", redirectRoutes)

app.get("/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.use((error, req, res, next) => {
	console.error("Unhandled error:", error.message)
	res.status(500).json({
		error: "Internal server error",
		message: error.message,
	})
})

app.use((req, res) => {
	res.status(404).json({
		error: "Route not found",
		path: req.path,
	})
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
