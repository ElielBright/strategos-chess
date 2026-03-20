"use client";
import "./globals.css";
import { useState, useEffect, createContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const UserContext = createContext(null);

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("strategos_username");
    if (stored) {
      setUsername(stored);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  const handleSetUsername = () => {
    const name = inputName.trim();
    if (name) {
      localStorage.setItem("strategos_username", name);
      setUsername(name);
      setShowUsernameModal(false);
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: "🏛️" },
    { href: "/play", label: "Play", icon: "♟️" },
    { href: "/lobby", label: "Online", icon: "🌐" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <html lang="en">
      <head>
        <title>Strategos — Chess Strategist</title>
        <meta name="description" content="A Greek-themed AI-powered chess game" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <UserContext.Provider value={{ username, setUsername, setShowUsernameModal }}>
          {/* Navbar */}
          <nav className="navbar">
            <Link href="/" className="navbar-logo">
              <img src="/logo.png" alt="Strategos" />
              <span>STRATEGOS</span>
            </Link>

            <ul className="navbar-links">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={pathname === item.href ? "active" : ""}
                  >
                    <span className="btn-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <button
              className="navbar-user"
              onClick={() => setShowUsernameModal(true)}
            >
              <span className="avatar">
                {username ? username[0].toUpperCase() : "?"}
              </span>
              {username || "Set Username"}
            </button>
          </nav>

          <main className="main-content">{children}</main>

          {/* Username Modal */}
          {showUsernameModal && (
            <div className="modal-overlay" onClick={() => username && setShowUsernameModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="username-modal-content">
                  <img src="/logo.png" alt="Strategos" className="logo-small" />
                  <h2>Welcome, Strategist</h2>
                  <p>Choose your name to enter the arena</p>
                  <input
                    type="text"
                    placeholder="Enter your username..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
                    autoFocus
                  />
                  <div className="modal-actions" style={{ marginTop: 20 }}>
                    {username && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => setShowUsernameModal(false)}
                      >
                        Cancel
                      </button>
                    )}
                    <button className="btn btn-primary" onClick={handleSetUsername}>
                      ⚔️ Enter Arena
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </UserContext.Provider>
      </body>
    </html>
  );
}
