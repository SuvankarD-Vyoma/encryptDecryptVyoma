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
                    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJzZWxmIiwic3ViIjoic3RhdGVhZG1pbiIsImV4cCI6MTc2NDIyMDk2MSwiaWF0IjoxNzY0MTM0NTYxLCJzY29wZSI6IlJPTEVfVVNFUiJ9.NBOn07FCaI0u24t6GNr7RHt2tWWug7yXDQQgb2dG-PsDbQc4qNbGDYrrdDzN1K0mMzBUtV3WE7HZI_qvZ-pDOQTowZaswunPuojzxd8WIsbLNiMQKD95HyEW0rIqPO7G_ky8khuId3rYwpwjaBKWVOTtuM_zs50L77fCtkzN-2QMIzvvlrmUTNEL5UzaXbAZAqRu0slyqrk2hjS5fIm0iYSuthbWy72SHnik_yhjnbtxG77xJaRy-DIc-fltVJdpmQl0aDr17D2xgk4U6iWucrJOB6ufx1Oy1SEmizdOxjK5oETzJTog0yj4ElojzHrIGKiUipDAZl3K5SLju1q7LIKZqDo-dXzS6eNzYM3YTL1lfnXbGbk8xPOYSRmsM6Sg8-j48yi6gw19EjR7eT5q6_izJCRAkF6sUCew-ewY448zF383Awx58By0NuJw8hfZpTInC5Dz70I7liqF3QkqIRTgKxNOi3hF262iOT7NCIK6G0P2QAAW4_W0zDKPhhs4Ox0R_od6twxyBp6L7g_3ejamJP3jTggHdPPFSWcrBfi3vpQ1Z8a7jFf_GzOOASwRJ6sDMJoCcA4OSqsgvn34fejrDd-IEhag8095a-UZzVYA-l_X42-L56wKXWoaAJwwHhWhN525l0tfzsZyaojcVWtTBp4HPBEtLW5Z8ZsobeI',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enc_data: encryptedData })
            });

            const result = await response.json();

            if (result.status === 0 && result.data) {
                let userData;
                try {
                    userData = await decryptAESGCM(result.data);
                    console.log("Decrypted user data:", JSON.stringify(userData));
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