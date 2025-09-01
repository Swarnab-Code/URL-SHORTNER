import mongoose from "mongoose"

const clickSchema = new mongoose.Schema({
	timestamp: {
		type: Date,
		default: Date.now,
	},
	referrer: {
		type: String,
		default: "direct",
	},
	ipAddress: String,
	userAgent: String,
	location: {
		country: String,
		region: String,
		city: String,
	},
})

const shortUrlSchema = new mongoose.Schema({
	originalUrl: {
		type: String,
		required: true,
	},
	shortcode: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
	clicks: [clickSchema],
	isActive: {
		type: Boolean,
		default: true,
	},
})

// Index for efficient queries
shortUrlSchema.index({ expiresAt: 1 })

// Virtual for click count
shortUrlSchema.virtual("clickCount").get(function () {
	return this.clicks.length
})

// Method to check if URL is expired
shortUrlSchema.methods.isExpired = function () {
	return new Date() > this.expiresAt
}

export default mongoose.model("ShortUrl", shortUrlSchema)
