import { useState } from "react";
import LoginPage from "./Login";
import EncDecPage from "./EncDecPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return isAuthenticated ? (
    <EncDecPage onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;