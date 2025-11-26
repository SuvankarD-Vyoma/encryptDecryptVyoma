import { useState } from "react";
import { encryptData, decryptData, encryptAESGCM, decryptAESGCM, DEFAULT_SECRET_KEY } from "./utils";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("cryptojs"); 
  
  // Tab 1: CryptoJS States
  const [secretKey, setSecretKey] = useState(DEFAULT_SECRET_KEY);
  const [cjInput, setCjInput] = useState("");
  const [cjOutput, setCjOutput] = useState("");
  const [cjError, setCjError] = useState("");

  // Tab 2: AES-GCM States
  const [gcmInput, setGcmInput] = useState("");
  const [gcmOutput, setGcmOutput] = useState("");
  const [gcmError, setGcmError] = useState("");

  // --- Handlers for CryptoJS ---
  const handleCjEncrypt = () => {
    setCjError("");
    try {
      let data = cjInput;
      try { data = JSON.parse(cjInput); } catch (e) {} // Try parsing JSON
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

  // --- Handlers for AES-GCM ---
  const handleGcmEncrypt = async () => {
    setGcmError("");
    try {
      let data = gcmInput;
      try { data = JSON.parse(gcmInput); } catch (e) {} // Try parsing JSON
      const res = await encryptAESGCM(data);
      setGcmOutput(res);
    } catch (err) { setGcmError(err.message); }
  };

  const handleGcmDecrypt = async () => {
    setGcmError("");
    const res = await decryptAESGCM(gcmInput);
    if(res.startsWith("Error") || res.startsWith("GCM")) {
       setGcmError(res);
       setGcmOutput("");
    } else {
       setGcmOutput(res);
    }
  };

  return (
    <div className="container">
      <h1>🔐 Encryption Utility</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === "cryptojs" ? "active" : ""} 
          onClick={() => setActiveTab("cryptojs")}
        >
          CryptoJS (App Data)
        </button>
        <button 
          className={activeTab === "aesgcm" ? "active" : ""} 
          onClick={() => setActiveTab("aesgcm")}
        >
          AES-GCM (Special)
        </button>
      </div>

      {/* ================= TAB 1: CryptoJS ================= */}
      {activeTab === "cryptojs" && (
        <div className="panel">
          <div className="input-group">
            <label>Secret Key (from .env):</label>
            <input 
              type="text" 
              value={secretKey} 
              onChange={(e) => setSecretKey(e.target.value)} 
              className="key-input"
            />
          </div>

          <div className="converter-box">
            <div className="column">
              <label>Input (JSON or Ciphertext)</label>
              <textarea 
                value={cjInput} 
                onChange={(e) => setCjInput(e.target.value)}
                placeholder='Paste JSON to Encrypt OR Ciphertext to Decrypt...' 
              />
            </div>

            <div className="actions">
              <button onClick={handleCjEncrypt} className="btn encrypt">Encrypt ➡</button>
              <button onClick={handleCjDecrypt} className="btn decrypt">⬅ Decrypt</button>
            </div>

            <div className="column">
              <label>Output</label>
              <textarea 
                value={cjOutput} 
                readOnly 
                className={cjError ? "error-border" : ""}
                placeholder="Result..."
              />
              {cjError && <span className="error-msg">{cjError}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AES-GCM ================= */}
      {activeTab === "aesgcm" && (
        <div className="panel">
           <p className="hint">
             <strong>Note:</strong> Uses Fixed IV and Hardcoded HEX Key.
           </p>

           <div className="converter-box">
            <div className="column">
              <label>Input (JSON or Base64 Ciphertext)</label>
              <textarea 
                value={gcmInput} 
                onChange={(e) => setGcmInput(e.target.value)}
                placeholder='Paste JSON to Encrypt OR Base64 String to Decrypt...' 
              />
            </div>

            <div className="actions">
              <button onClick={handleGcmEncrypt} className="btn encrypt">Encrypt ➡</button>
              <button onClick={handleGcmDecrypt} className="btn decrypt">⬅ Decrypt</button>
            </div>

            <div className="column">
              <label>Output</label>
              <textarea 
                value={gcmOutput} 
                readOnly 
                className={gcmError ? "error-border" : ""}
                placeholder="Result..."
              />
              {gcmError && <span className="error-msg">{gcmError}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;