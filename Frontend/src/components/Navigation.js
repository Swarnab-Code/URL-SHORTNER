import { useNavigate, useLocation } from "react-router-dom"
import { Tabs, Tab } from "@mui/material"

function Navigation() {
	const navigate = useNavigate()
	const location = useLocation()

	const currentPath = location.pathname.startsWith("/statistics") 
		? "/statistics" 
		: "/"

	const handleChange = (event, newValue) => {
		navigate(newValue)
	}

	return (
		<Tabs value={currentPath} onChange={handleChange} textColor="inherit" indicatorColor="secondary">
			<Tab label="URL Shortener" value="/" />
			<Tab label="Statistics" value="/statistics" />
		</Tabs>
	)
}

export default Navigation
