import express from "express"
import geoip from "geoip-lite"
import ShortUrl from "../models/ShortUrl.js"

const router = express.Router()

router.get("/:shortcode", async (req, res) => {
	try {
		const { shortcode } = req.params

		const shortUrl = await ShortUrl.findOne({ shortcode })

		if (!shortUrl) {
			return res.status(404).json({ error: "Short URL not found" })
		}

		if (new Date() > shortUrl.expiresAt) {
			return res.status(410).json({ error: "Short URL has expired" })
		}

		const clientIp = req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"]
		const userAgent = req.headers["user-agent"] || "Unknown"
		const referrer = req.headers.referer || "direct"

		const geo = clientIp ? geoip.lookup(clientIp) : null
		const location = geo
			? { country: geo.country, region: geo.region, city: geo.city }
			: { country: "Unknown", region: "Unknown", city: "Unknown" }

		shortUrl.clicks.push({
			referrer,
			ipAddress: clientIp,
			userAgent,
			location,
		})

		await shortUrl.save()

		res.redirect(shortUrl.originalUrl)
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
			message: error.message,
		})
	}
})

export default router
