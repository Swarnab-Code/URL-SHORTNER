import { Routes, Route } from "react-router-dom"
import { Container, AppBar, Toolbar, Typography, Box } from "@mui/material"
import Navigation from "./components/Navigation"
import URLShortener from "./pages/URLShortener"
import Statistics from "./pages/Statistics"

function App() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						URL Shortener
					</Typography>
					<Navigation />
				</Toolbar>
			</AppBar>

			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				<Routes>
					<Route path="/" element={<URLShortener />} />
					<Route path="/statistics" element={<Statistics />} />
				</Routes>
			</Container>
		</Box>
	)
}

export default App
