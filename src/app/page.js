"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-hero">
      <img src="/logo.png" alt="Strategos" className="hero-logo" />
      <h1 className="hero-title">STRATEGOS</h1>
      <p className="hero-subtitle">
        Master the ancient art of strategy. Play against friends, challenge the
        Oracle AI, or test your skills online — all powered by the wisdom of
        the ancients.
      </p>

      <div className="hero-actions">
        <Link href="/play" className="btn btn-primary btn-lg">
          <span className="btn-icon">⚔️</span>
          Start Game
        </Link>
        <Link href="/lobby" className="btn btn-secondary btn-lg">
          <span className="btn-icon">🌐</span>
          Play Online
        </Link>
      </div>

      <div className="modes-grid">
        <Link href="/play?mode=local" className="mode-card">
          <span className="mode-icon">👥</span>
          <h3>Local Match</h3>
          <p>Two players, one board. Challenge a friend sitting beside you in a classic duel of minds.</p>
        </Link>

        <Link href="/play?mode=computer" className="mode-card">
          <span className="mode-icon">🤖</span>
          <h3>Vs Computer</h3>
          <p>Face the engine at four difficulty levels — from Novice to the all-knowing Oracle.</p>
        </Link>

        <Link href="/lobby" className="mode-card">
          <span className="mode-icon">🌍</span>
          <h3>Online Arena</h3>
          <p>Create or join a game room. Play anyone, anywhere with real-time sync.</p>
        </Link>
      </div>
    </div>
  );
}
