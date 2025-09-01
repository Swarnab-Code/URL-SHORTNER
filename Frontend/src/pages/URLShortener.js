import { useState } from "react"
import {
	Paper,
	Typography,
	TextField,
	Button,
	Box,
	Grid,
	Card,
	CardContent,
	Alert,
	Chip,
	IconButton,
	Tooltip,
} from "@mui/material"
import { Add, Delete, ContentCopy } from "@mui/icons-material"
import axios from "axios"

function URLShortener() {
	const API_URL = process.env.REACT_APP_API_URL;

	const [urls, setUrls] = useState([{ id: 1, url: "", validity: 30, shortcode: "", result: null, error: null }])
	const [loading, setLoading] = useState(false)

	const addUrlField = () => {
		if (urls.length < 5) {
			const newId = Math.max(...urls.map((u) => u.id)) + 1
			setUrls([...urls, { id: newId, url: "", validity: 30, shortcode: "", result: null, error: null }])
		}
	}

	const removeUrlField = (id) => {
		if (urls.length > 1) {
			setUrls(urls.filter((u) => u.id !== id))
		}
	}

	const updateUrl = (id, field, value) => {
		setUrls(urls.map((u) => (u.id === id ? { ...u, [field]: value, error: null } : u)))
	}

	const validateUrl = (url) => {
		try {
			new URL(url)
			return true
		} catch {
			return false
		}
	}

	const validateInputs = async () => {
		let hasErrors = false
		const updatedUrls = urls.map((urlObj) => {
			const errors = []

			if (!urlObj.url.trim()) {
				errors.push("URL is required")
			} else if (!validateUrl(urlObj.url)) {
				errors.push("Invalid URL format")
			}

			if (urlObj.validity && (!Number.isInteger(Number(urlObj.validity)) || Number(urlObj.validity) <= 0)) {
				errors.push("Validity must be a positive integer")
			}

			if (urlObj.shortcode && (!/^[a-zA-Z0-9]+$/.test(urlObj.shortcode) || urlObj.shortcode.length > 20)) {
				errors.push("Shortcode must be alphanumeric and max 20 characters")
			}

			if (errors.length > 0) {
				hasErrors = true
				return { ...urlObj, error: errors.join(", ") }
			}

			return { ...urlObj, error: null }
		})

		setUrls(updatedUrls)
		return !hasErrors
	}

	const shortenUrls = async () => {
		const isValid = await validateInputs()
		if (!isValid) return

		setLoading(true)

		const promises = urls.map(async (urlObj) => {
			try {
				const response = await axios.post(`${API_URL}/shorturls`, {
					url: urlObj.url,
					validity: Number(urlObj.validity) || 30,
					shortcode: urlObj.shortcode || undefined,
				})

				return { ...urlObj, result: response.data, error: null }
			} catch (error) {
				return {
					...urlObj,
					result: null,
					error: error.response?.data?.error || "Failed to shorten URL",
				}
			}
		})

		const results = await Promise.all(promises)
		setUrls(results)
		setLoading(false)
	}

	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text)
		} catch (error) {
			// no-op
		}
	}

	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				URL Shortener
			</Typography>
			<Typography variant="body1" color="text.secondary" paragraph>
				Shorten up to 5 URLs concurrently. Provide the original URL, optional validity period (in minutes), and optional
				custom shortcode.
			</Typography>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Grid container spacing={3}>
					{urls.map((urlObj, index) => (
						<Grid item xs={12} key={urlObj.id}>
							<Card variant="outlined">
								<CardContent>
									<Box display="flex" alignItems="center" mb={2}>
										<Typography variant="h6" sx={{ flexGrow: 1 }}>
											URL #{index + 1}
										</Typography>
										{urls.length > 1 && (
											<IconButton onClick={() => removeUrlField(urlObj.id)} color="error" size="small">
												<Delete />
											</IconButton>
										)}
									</Box>

									<Grid container spacing={2}>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Original URL"
												value={urlObj.url}
												onChange={(e) => updateUrl(urlObj.id, "url", e.target.value)}
												placeholder="https://example.com/very-long-url"
												error={!!urlObj.error}
											/>
										</Grid>
										<Grid item xs={12} md={3}>
											<TextField
												fullWidth
												label="Validity (minutes)"
												type="number"
												value={urlObj.validity}
												onChange={(e) => updateUrl(urlObj.id, "validity", e.target.value)}
												inputProps={{ min: 1 }}
											/>
										</Grid>
										<Grid item xs={12} md={3}>
											<TextField
												fullWidth
												label="Custom Shortcode (optional)"
												value={urlObj.shortcode}
												onChange={(e) => updateUrl(urlObj.id, "shortcode", e.target.value)}
												placeholder="mycode123"
											/>
										</Grid>
									</Grid>

									{urlObj.error && (
										<Alert severity="error" sx={{ mt: 2 }}>
											{urlObj.error}
										</Alert>
									)}

									{urlObj.result && (
										<Box sx={{ mt: 2 }}>
											<Alert severity="success">
												<Box display="flex" alignItems="center" gap={1}>
													<Typography variant="body2">
														<strong>Short URL:</strong> {urlObj.result.shortLink}
													</Typography>
													<Tooltip title="Copy to clipboard">
														<IconButton size="small" onClick={() => copyToClipboard(urlObj.result.shortLink)}>
															<ContentCopy fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
												<Typography variant="body2" sx={{ mt: 1 }}>
													<strong>Expires:</strong> {new Date(urlObj.result.expiry).toLocaleString()}
												</Typography>
											</Alert>
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>

				<Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
					<Button variant="contained" onClick={shortenUrls} disabled={loading} size="large">
						{loading ? "Shortening..." : "Shorten URLs"}
					</Button>

					{urls.length < 5 && (
						<Button variant="outlined" startIcon={<Add />} onClick={addUrlField}>
							Add URL ({urls.length}/5)
						</Button>
					)}

					<Chip label={`${urls.length}/5 URLs`} color={urls.length === 5 ? "warning" : "default"} />
				</Box>
			</Paper>
		</Box>
	)
}

export default URLShortener
