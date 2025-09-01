import { useEffect, useState } from "react"
import {
	Typography,
	Box,
	Card,
	CardContent,
	Grid,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Alert,
	IconButton,
	Tooltip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	CircularProgress,
	Stack,
	Snackbar,
} from "@mui/material"
import { OpenInNew, ExpandMore, Schedule, Mouse, Language, Warning, Delete } from "@mui/icons-material"
import MuiAlert from "@mui/material/Alert"
import axios from "axios"

function Statistics() {
	const API_URL = process.env.REACT_APP_API_URL;

	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [deleting, setDeleting] = useState(null)
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

	const formatDate = (dateString) => new Date(dateString).toLocaleString()

	const getStatusChip = (isExpired) => {
		return (
			<Chip
				label={isExpired ? "Expired" : "Active"}
				color={isExpired ? "error" : "success"}
				size="small"
				icon={isExpired ? <Warning /> : <Schedule />}
			/>
		)
	}

	const fetchAll = async () => {
		try {
			setLoading(true)
			setError(null)
			const { data } = await axios.get(`${API_URL}/shorturls`)
			setItems(data)
		} catch (e) {
			setError(e.response?.data?.error || e.message || "Failed to load statistics")
		} finally {
			setLoading(false)
		}
	}

	const deleteShortUrl = async (shortcode) => {
		const target = items.find((i) => i.shortcode === shortcode)
		if (!target) return
		if (!target.isExpired) return

		try {
			setDeleting(shortcode)
			await axios.delete(`${API_URL}/shorturls/${shortcode}`)
			setItems((prev) => prev.filter((i) => i.shortcode !== shortcode))
			setSnackbar({
				open: true,
				message: `Short URL /${shortcode} deleted successfully.`,
				severity: "success"
			})
		} catch (e) {
			setSnackbar({
				open: true,
				message: e.response?.data?.error || e.message || "Failed to delete short URL",
				severity: "error"
			})
		} finally {
			setDeleting(null)
		}
	}

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false })
	}

	useEffect(() => {
		fetchAll()
	}, [])

	return (
		<Box>
			<Typography variant="h4" gutterBottom>
				URL Statistics
			</Typography>

			{loading && (
				<Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
					<CircularProgress size={20} />
					<Typography variant="body2">Loading...</Typography>
				</Stack>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{!loading && items.length === 0 && !error && (
				<Alert severity="info" sx={{ mb: 3 }}>
					No shortened URLs found. Create some on the URL Shortener page.
				</Alert>
			)}

			<Grid container spacing={3}>
				{items.map((item) => (
					<Grid item xs={12} key={item.shortcode}>
						<Card>
							<CardContent>
								<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
									<Box display="flex" alignItems="center" gap={2}>
										<Typography variant="h6">/{item.shortcode}</Typography>
										{getStatusChip(item.isExpired)}
									</Box>
									<Box display="flex" alignItems="center" gap={1}>
										{item.isExpired && (
											<Tooltip title="Delete expired short URL">
												<span>
													<IconButton
														color="error"
														onClick={() => deleteShortUrl(item.shortcode)}
														disabled={deleting === item.shortcode}
													>
														<Delete />
													</IconButton>
												</span>
											</Tooltip>
										)}
									</Box>
								</Box>

								<Grid container spacing={2} sx={{ mb: 2 }}>
									<Grid item xs={12}>
										<Typography variant="body2" color="text.secondary">
											Short URL:
										</Typography>
										<Box display="flex" alignItems="center" gap={1}>
											<Typography variant="body2" sx={{ wordBreak: "break-all" }}>
												{item.shortLink}
											</Typography>
											<Tooltip title="Open short URL">
												<IconButton size="small" onClick={() => {
													if (item.isExpired) {
														setSnackbar({
															open: true,
															message: `Short URL /${item.shortcode} is expired and cannot be opened.`,
															severity: "error"
														})
													} else {
														window.open(item.shortLink, "_blank")
													}
												}}>
													<OpenInNew fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="body2" color="text.secondary">
											Original URL:
										</Typography>
										<Box display="flex" alignItems="center" gap={1}>
											<Typography variant="body2" sx={{ wordBreak: "break-all" }}>
												{item.originalUrl}
											</Typography>
											<Tooltip title="Open original URL">
												<IconButton size="small" href={item.originalUrl} target="_blank">
													<OpenInNew fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									</Grid>
								</Grid>

								<Grid container spacing={2} sx={{ mb: 2 }}>
									<Grid item xs={12} sm={6}>
										<Typography variant="body2" color="text.secondary">
											Created:
										</Typography>
										<Typography variant="body2">{formatDate(item.createdAt)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Typography variant="body2" color="text.secondary">
											Expires:
										</Typography>
										<Typography variant="body2">{formatDate(item.expiresAt)}</Typography>
									</Grid>
								</Grid>

								<Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
									<Chip icon={<Mouse />} label={`${item.totalClicks} clicks`} color="primary" variant="outlined" />
								</Box>

								<Accordion>
									<AccordionSummary expandIcon={<ExpandMore />}>
										<Typography variant="subtitle2">Click Details ({item.clicks.length})</Typography>
									</AccordionSummary>
									<AccordionDetails>
										{item.clicks.length === 0 ? (
											<Typography variant="body2" color="text.secondary">
												No clicks yet.
											</Typography>
										) : (
											<TableContainer>
												<Table size="small">
													<TableHead>
														<TableRow>
															<TableCell>Timestamp</TableCell>
															<TableCell>Referrer</TableCell>
															<TableCell>Location</TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{item.clicks.map((click, index) => (
															<TableRow key={index}>
																<TableCell>{formatDate(click.timestamp)}</TableCell>
																<TableCell>
																	{click.referrer === "direct" ? (
																		<Chip label="Direct" size="small" />
																	) : (
																		<Typography variant="body2" sx={{ wordBreak: "break-all" }}>
																			{click.referrer}
																		</Typography>
																	)}
																</TableCell>
																<TableCell>
																	<Box display="flex" alignItems="center" gap={1}>
																		<Language fontSize="small" />
																		<Typography variant="body2">
																			{click.location?.city || "Unknown"}, {click.location?.region || "Unknown"},{" "}
																			{click.location?.country || "Unknown"}
																		</Typography>
																	</Box>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</TableContainer>
										)}
									</AccordionDetails>
								</Accordion>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
					{snackbar.message}
				</MuiAlert>
			</Snackbar>
		</Box>
	)
}

export default Statistics
