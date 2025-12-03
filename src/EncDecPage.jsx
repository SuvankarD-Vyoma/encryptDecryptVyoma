import { useState } from "react";
import { DEFAULT_SECRET_KEY, encryptData, decryptData, encryptAESGCM, decryptAESGCM, generateRandomIV, setGCMKey, getGCMKey } from "./utils";

function EncDecPage({ onLogout }) {
    const [activeTab, setActiveTab] = useState("cryptojs");
    const [secretKey, setSecretKey] = useState(DEFAULT_SECRET_KEY);
    const [cjInput, setCjInput] = useState("");
    const [cjOutput, setCjOutput] = useState("");
    const [cjError, setCjError] = useState("");
    const [gcmInput, setGcmInput] = useState("");
    const [gcmOutput, setGcmOutput] = useState("");
    const [gcmError, setGcmError] = useState("");
    const [gcmKey, setGcmKeyState] = useState(getGCMKey());
    const [gcmIV, setGcmIV] = useState("aabbccddeeff001122334455");
    const [showGcmIV, setShowGcmIV] = useState(false);
    const [showGcmKey, setShowGcmKey] = useState(false);

    const handleGcmKeyChange = (e) => {
        const newKey = e.target.value;
        setGcmKeyState(newKey);
        setGCMKey(newKey);
    };

    const handleCjEncrypt = () => {
        setCjError("");
        try {
            let data = cjInput;
            try { data = JSON.parse(cjInput); } catch (e) { }
            const res = encryptData(data, secretKey);
            setCjOutput(res);
        } catch (err) { setCjError(err.message); }
    };

    const handleCjDecrypt = () => {
        setCjError("");
        try {
            const res = decryptData(cjInput, secretKey);
            if (typeof res === "object") setCjOutput(JSON.stringify(res, null, 2));
            else setCjOutput(res);
        } catch (err) { setCjError(err.message); }
    };

    const handleGcmEncrypt = async () => {
        setGcmError("");
        try {
            let data = gcmInput;
            try { data = JSON.parse(gcmInput); } catch (e) { }
            const res = await encryptAESGCM(data, gcmIV);
            setGcmOutput(res);
        } catch (err) { setGcmError(err.message); }
    };

    const handleGcmDecrypt = async () => {
        setGcmError("");
        try {
            const res = await decryptAESGCM(gcmInput, gcmIV);
            if (typeof res === "object") setGcmOutput(JSON.stringify(res, null, 2));
            else setGcmOutput(res);
        } catch (err) {
            setGcmError(err.message);
            setGcmOutput("");
        }
    };

    const handleRandomizeIV = () => {
        const newIV = generateRandomIV();
        setGcmIV(newIV);
    };

    return (
        <div style={{ minHeight: "100vh", minWidth: "95vw", background: "#f0f2f5", padding: "2rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                    padding: "1rem",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <h1 style={{ color: "#333", margin: 0, fontSize: "1.75rem" }}>🔐 Encryption Utility</h1>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: "0.625rem 1.25rem",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => setActiveTab("cryptojs")}
                        style={{
                            padding: "0.875rem 1.75rem",
                            background: activeTab === "cryptojs" ? "#667eea" : "white",
                            color: activeTab === "cryptojs" ? "white" : "#333",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                        }}
                    >
                        CryptoJS (App Data)
                    </button>
                    <button
                        onClick={() => setActiveTab("aesgcm")}
                        style={{
                            padding: "0.875rem 1.75rem",
                            background: activeTab === "aesgcm" ? "#667eea" : "white",
                            color: activeTab === "aesgcm" ? "white" : "#333",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                        }}
                    >
                        AES-GCM (Special)
                    </button>
                </div>

                {activeTab === "cryptojs" && (
                    <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                Secret Key:
                            </label>
                            <input
                                type="text"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "8px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "start" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                    Input
                                </label>
                                <textarea
                                    value={cjInput}
                                    onChange={(e) => setCjInput(e.target.value)}
                                    placeholder="JSON or Ciphertext..."
                                    style={{
                                        width: "100%",
                                        minHeight: "200px",
                                        padding: "0.875rem",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        fontFamily: "monospace",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center" }}>
                                <button
                                    onClick={handleCjEncrypt}
                                    style={{
                                        padding: "0.875rem 1.5rem",
                                        background: "#27ae60",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Encrypt ➡
                                </button>
                                <button
                                    onClick={handleCjDecrypt}
                                    style={{
                                        padding: "0.875rem 1.5rem",
                                        background: "#3498db",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    ⬅ Decrypt
                                </button>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                    Output
                                </label>
                                <textarea
                                    value={cjOutput}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        minHeight: "200px",
                                        padding: "0.875rem",
                                        border: cjError ? "2px solid #e74c3c" : "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        fontFamily: "monospace",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Result..."
                                />
                                {cjError && <div style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.5rem" }}>{cjError}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "aesgcm" && (
                    <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <div style={{ background: "#fff3cd", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", color: "#856404" }}>
                            <strong>Note:</strong> Uses Dynamic HEX Key with Dynamic IV.
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                Encryption Key (HEX):
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showGcmKey ? "text" : "password"}
                                    value={gcmKey}
                                    onChange={handleGcmKeyChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        paddingRight: "3rem",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        boxSizing: "border-box",
                                        fontFamily: "monospace"
                                    }}
                                />
                                <button
                                    onClick={() => setShowGcmKey(!showGcmKey)}
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "1.2rem",
                                        padding: "0.25rem"
                                    }}
                                    title={showGcmKey ? "Hide Key" : "Show Key"}
                                >
                                    {showGcmKey ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", color: "#555", fontWeight: "600", gap: "0.5rem" }}>
                                Initialization Vector (IV):
                                <button
                                    onClick={handleRandomizeIV}
                                    style={{
                                        padding: "0.375rem 0.75rem",
                                        background: "#9b59b6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                        fontWeight: "600"
                                    }}
                                    title="Generate Random IV"
                                >
                                    🎲 Randomize
                                </button>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showGcmIV ? "text" : "password"}
                                    value={gcmIV}
                                    onChange={(e) => setGcmIV(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        paddingRight: "3rem",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        boxSizing: "border-box",
                                        fontFamily: "monospace"
                                    }}
                                />
                                <button
                                    onClick={() => setShowGcmIV(!showGcmIV)}
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "1.2rem",
                                        padding: "0.25rem"
                                    }}
                                    title={showGcmIV ? "Hide IV" : "Show IV"}
                                >
                                    {showGcmIV ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "start" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                    Input
                                </label>
                                <textarea
                                    value={gcmInput}
                                    onChange={(e) => setGcmInput(e.target.value)}
                                    placeholder="JSON or Base64..."
                                    style={{
                                        width: "100%",
                                        minHeight: "200px",
                                        padding: "0.875rem",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        fontFamily: "monospace",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center" }}>
                                <button
                                    onClick={handleGcmEncrypt}
                                    style={{
                                        padding: "0.875rem 1.5rem",
                                        background: "#27ae60",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Encrypt ➡
                                </button>
                                <button
                                    onClick={handleGcmDecrypt}
                                    style={{
                                        padding: "0.875rem 1.5rem",
                                        background: "#3498db",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    ⬅ Decrypt
                                </button>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#555", fontWeight: "600" }}>
                                    Output
                                </label>
                                <textarea
                                    value={gcmOutput}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        minHeight: "200px",
                                        padding: "0.875rem",
                                        border: gcmError ? "2px solid #e74c3c" : "2px solid #e0e0e0",
                                        borderRadius: "8px",
                                        fontFamily: "monospace",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Result..."
                                />
                                {gcmError && <div style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.5rem" }}>{gcmError}</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EncDecPage;