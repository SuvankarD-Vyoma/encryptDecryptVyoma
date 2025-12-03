import { useState } from "react";
import { encryptAESGCM, decryptAESGCM } from "./utils";

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const credentials = { username, password };
            const encryptedData = await encryptAESGCM(credentials);

            const response = await fetch('http://115.187.62.16:8005/ICMSRestAPI/api/user/authentication', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoic3RhdGVhZG1pbiIsImV4cCI6MTc2NDMwODYyOSwiaWF0IjoxNzY0MjIyMjI5LCJzY29wZSI6IlJPTEVfVVNFUiJ9.jMrPY8p-lhF66a80tlWK7-jMeft81M84DJMgAXn0nlz4VtRTCpVyLMg9Hu6vwO1GOe8wzupOwM8XZ3LxbdkUwSIF9Mh213209oV5ksfSs8qL5sGDmALA0Wf8YUbWGYf-VjQTLQGLDfm71JFzEDV7aPG4OhN1WY9b-KgK4ET8HkMPjTZ7blR2_vA4r7pYaJ5Gne9VXmI6-x5OmJYZB2RJOjVm7JXznXFtxAgoapY0z4fYFpoGrgOAERniWxSk_aYJFM6luFx5e3nFgnGUwWl6jHXKlXVydfj9HABfhECJqs2Z8Ox5quRxBBeu5HqaOBUUT5YZqk9WH2PO8Za7c6UktV-shn5Xu6Sd0-fWlsdyCWxfpr9GdkZTaj12AbNHo9BYwAorMcqS4vfa8TBPvte0x7M8yBUlGaudlkHjaeS9EGHbSxAzU0cTCMPxvUuYrrQj6LyKR3FTkaseZxp1lA6fvEYozVWdANfFCLHMxm1vB3_onxnlJUZkQe2XhAWmFs6bTjf_7wwWdsxARmKDrOCfZP6CJjkSuk8HqMFQf8AxEzn-T7zNQDZHebs73GsUemMAWu4C_1BOoSoO1igPIk9d65c0IFw6gzYlgfbIdFuW-U996CRs1BFzYdfj3oPJbh01XTDt1uHN8HijodsHgS9T2tbLBgGcw6i0FwEbiUv4KI4',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enc_data: encryptedData })
            });

            const result = await response.json();

            if (result.status === 0 && result.data) {
                let userData;
                try {
                    userData = await decryptAESGCM(result.data);
                    console.log("Decrypted user data:" , JSON.stringify(userData));
                } catch (decryptError) {
                    console.error("Decryption error:", decryptError);
                    userData = result.data;
                }

                document.cookie = `authData=${result.data}; path=/; max-age=86400; SameSite=Strict`;
                document.cookie = `username=${username}; path=/; max-age=86400; SameSite=Strict`;

                if (userData && typeof userData === 'object') {
                    document.cookie = `userData=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Strict`;
                }

                if (onLogin) onLogin(userData);
                setError("");
            } else {
                setError(result.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            minWidth: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}>
            <div style={{
                background: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                width: "90%",
                maxWidth: "420px"
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#333", fontSize: "1.8rem" }}>
                    🔐 Secure Login
                </h2>
                <div>
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500" }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                boxSizing: "border-box"
                            }}
                            placeholder="Enter username"
                            disabled={loading}
                        />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "500" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.875rem",
                                border: "2px solid #e0e0e0",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                boxSizing: "border-box"
                            }}
                            placeholder="Enter password"
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <div style={{
                            color: "#e74c3c",
                            marginBottom: "1rem",
                            padding: "0.75rem",
                            background: "#ffe6e6",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            textAlign: "center"
                        }}>
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "0.875rem",
                            background: loading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "1.05rem",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
                <div style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    color: "#999",
                    padding: "0.75rem",
                    background: "#f9f9f9",
                    borderRadius: "6px"
                }}>
                    <strong>Demo:</strong> admin / admin@123
                </div>
            </div>
        </div>
    );
}

export default LoginPage;