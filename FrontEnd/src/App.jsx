import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  )
}
