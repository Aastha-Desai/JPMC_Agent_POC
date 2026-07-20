function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2>JPMorganChase</h2>

        <nav>
          <button>Dashboard</button>
          <button>Profile</button>
          <button>Settings</button>
        </nav>
      </div>

      <div className="header-right">
        AEM Press Release Manager
      </div>
    </header>
  );
}

export default Header;