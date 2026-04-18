import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { RecoilProvider } from "./components/RecoilProvider";
import "./styles.css";
import App from "./app.tsx";
createRoot(document.getElementById("root")!).render(
	<RecoilProvider>
		<Router>
			<App />
		</Router>
	</RecoilProvider>,
);
