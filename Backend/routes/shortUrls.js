import express from "express"
import dotenv from "dotenv"
import { nanoid } from "nanoid"
import validator from "validator"
import ShortUrl from "../models/ShortUrl.js"

dotenv.config()

const router = express.Router()

const BACKEND_URL = process.env.BACKEND_URL

// Create short URL
router.post("/", async (req, res) => {
	try {
		const { url, validity = 30, shortcode } = req.body

		if (!url) {
			return res.status(400).json({ error: "URL is required" })
		}

		if (!validator.isURL(url)) {
			return res.status(400).json({ error: "Invalid URL format" })
		}

		if (validity && (!Number.isInteger(validity) || validity <= 0)) {
			return res.status(400).json({
				error: "Validity must be a positive integer representing minutes",
			})
		}

		let finalShortcode = shortcode
		if (shortcode) {
			if (!/^[a-zA-Z0-9]+$/.test(shortcode) || shortcode.length > 20) {
				return res.status(400).json({
					error: "Shortcode must be alphanumeric and max 20 characters",
				})
			}

			const existingUrl = await ShortUrl.findOne({ shortcode })
			if (existingUrl) {
				return res.status(409).json({
					error: "Shortcode already exists",
				})
			}
		} else {
			let attempts = 0
			do {
				finalShortcode = nanoid(6)
				attempts++
				if (attempts > 10) {
					return res.status(500).json({ error: "Failed to generate unique shortcode" })
				}
			} while (await ShortUrl.findOne({ shortcode: finalShortcode }))
		}

		const expiresAt = new Date(Date.now() + validity * 60 * 1000)

		const shortUrl = new ShortUrl({
			originalUrl: url,
			shortcode: finalShortcode,
			expiresAt,
		})

		await shortUrl.save()

		const shortLink = `${BACKEND_URL}/${finalShortcode}`

		res.status(201).json({
			shortLink,
			expiry: expiresAt.toISOString(),
		})
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
})

// List all short URLs with stats and click details
router.get("/", async (req, res) => {
	try {
		const docs = await ShortUrl.find({}).sort({ createdAt: -1 })

		const items = docs.map((doc) => ({
			shortcode: doc.shortcode,
			originalUrl: doc.originalUrl,
			createdAt: doc.createdAt.toISOString(),
			expiresAt: doc.expiresAt.toISOString(),
			totalClicks: doc.clicks.length,
			isExpired: new Date() > doc.expiresAt,
			shortLink: `${req.protocol}://${req.get("host")}/${doc.shortcode}`,
			clicks: doc.clicks.map((click) => ({
				timestamp: click.timestamp.toISOString(),
				referrer: click.referrer,
				location: click.location,
			})),
		}))

		res.json(items)
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
})

// Get short URL statistics (single)
router.get("/:shortcode", async (req, res) => {
	try {
		const { shortcode } = req.params

		const shortUrl = await ShortUrl.findOne({ shortcode })

		if (!shortUrl) {
			return res.status(404).json({
				error: "Short URL not found",
			})
		}

		const stats = {
			shortcode: shortUrl.shortcode,
			originalUrl: shortUrl.originalUrl,
			createdAt: shortUrl.createdAt.toISOString(),
			expiresAt: shortUrl.expiresAt.toISOString(),
			totalClicks: shortUrl.clicks.length,
			isExpired: new Date() > shortUrl.expiresAt,
			shortLink: `${req.protocol}://${req.get("host")}/${shortUrl.shortcode}`,
			clicks: shortUrl.clicks.map((click) => ({
				timestamp: click.timestamp.toISOString(),
				referrer: click.referrer,
				location: click.location,
			})),
		}

		res.json(stats)
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
})

// Delete a short URL (only if expired)
router.delete("/:shortcode", async (req, res) => {
	try {
		const { shortcode } = req.params
		const doc = await ShortUrl.findOne({ shortcode })
		if (!doc) {
			return res.status(404).json({ error: "Short URL not found" })
		}

		const isExpired = new Date() > doc.expiresAt
		if (!isExpired) {
			return res.status(400).json({ error: "Cannot delete an active short URL" })
		}

		await ShortUrl.deleteOne({ _id: doc._id })
		return res.json({ success: true, message: "Short URL deleted" })
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
})

export default router
