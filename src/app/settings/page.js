"use client";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/app/layout";
import {
  getAccessList,
  isAdmin,
  grantAccess,
  revokeAccess,
} from "@/lib/accessControl";
import { checkOllamaStatus } from "@/lib/ollamaClient";

export default function SettingsPage() {
  const { username, setShowUsernameModal } = useContext(UserContext);
  const [accessList, setAccessList] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [message, setMessage] = useState("");

  const userIsAdmin = isAdmin(username);

  useEffect(() => {
    setAccessList(getAccessList());
    checkOllamaStatus().then(setOllamaStatus);
  }, []);

  const handleGrant = () => {
    if (!newUsername.trim()) return;
    const result = grantAccess(username, newUsername.trim());
    if (result.success) {
      setAccessList(getAccessList());
      setNewUsername("");
      setMessage(`✅ Granted access to "${newUsername.trim()}"`);
    } else {
      setMessage(`⚠️ ${result.error}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRevoke = (target) => {
    const result = revokeAccess(username, target);
    if (result.success) {
      setAccessList(getAccessList());
      setMessage(`🗑️ Revoked access from "${target}"`);
    } else {
      setMessage(`⚠️ ${result.error}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="settings-container">
      <h1>⚙️ Settings</h1>

      {message && (
        <div
          className="status-bar"
          style={{ marginBottom: 20, fontSize: "0.9rem" }}
        >
          {message}
        </div>
      )}

      {/* Profile */}
      <div className="settings-section">
        <h2>👤 Profile</h2>
        <div className="settings-row">
          <label>Username</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--gold-primary)", fontWeight: 600 }}>
              {username || "Not set"}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowUsernameModal(true)}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Ollama Status */}
      <div className="settings-section">
        <h2>🧠 Oracle (AI Engine)</h2>
        <div className="settings-row">
          <label>Ollama Status</label>
          <span style={{ color: ollamaStatus?.available ? "var(--green)" : "var(--red)" }}>
            {ollamaStatus?.available ? "🟢 Connected" : "🔴 Not Available"}
          </span>
        </div>
        {ollamaStatus?.available && (
          <>
            <div className="settings-row">
              <label>Qwen 2.5:3b Model</label>
              <span style={{ color: ollamaStatus?.hasQwen ? "var(--green)" : "var(--red)" }}>
                {ollamaStatus?.hasQwen ? "✅ Installed" : "❌ Not Found"}
              </span>
            </div>
            <div className="settings-row">
              <label>Available Models</label>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {ollamaStatus?.models?.join(", ") || "None"}
              </span>
            </div>
          </>
        )}
        {!ollamaStatus?.available && (
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              padding: "8px 0",
              lineHeight: 1.6,
            }}
          >
            To enable AI features, install and run{" "}
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--gold-primary)" }}
            >
              Ollama
            </a>
            , then run: <code style={{ color: "var(--purple)" }}>ollama pull qwen2.5:3b</code>
          </div>
        )}
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => checkOllamaStatus().then(setOllamaStatus)}
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Oracle Access Control */}
      <div className="settings-section">
        <h2>🔐 Oracle Access Control</h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: 12,
          }}
        >
          Users with access can use the &quot;Ask the Oracle&quot; feature during games.
          {!userIsAdmin && " Only admins can manage the access list."}
        </p>

        <div className="access-list">
          {accessList.map((user) => (
            <div className="access-item" key={user.username}>
              <span className="username">{user.username}</span>
              {user.isAdmin && <span className="admin-badge">👑 Admin</span>}
              {userIsAdmin && !user.isAdmin && (
                <button
                  className="remove-btn"
                  onClick={() => handleRevoke(user.username)}
                  title="Remove access"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {userIsAdmin && (
          <div className="add-access-row">
            <input
              type="text"
              placeholder="Username to grant access..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGrant()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleGrant}>
              ➕ Grant
            </button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="settings-section">
        <h2>🏛️ About Strategos</h2>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.8 }}>
          <p>
            <strong style={{ color: "var(--gold-primary)" }}>Strategos</strong>{" "}
            (Στρατηγός) — Greek for &quot;strategist&quot; or &quot;general&quot;.
          </p>
          <p style={{ marginTop: 4 }}>
            A chess application built with the wisdom of the ancients and the power
            of modern AI. Play locally, challenge the Oracle, or compete online.
          </p>
          <p style={{ marginTop: 8, color: "var(--text-dim)" }}>
            Version 1.0.0 • Made with ♟️ and 🧠
          </p>
        </div>
      </div>
    </div>
  );
}
