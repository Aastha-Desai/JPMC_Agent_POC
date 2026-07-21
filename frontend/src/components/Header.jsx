function Header() {
  return (
    <header className="header">

      <div className="header-left">

        <div className="logo">
          JPMorganChase
        </div>

        <nav className="nav">
          <button className="active">
            Dashboard
          </button>

          <button>
            Profile
          </button>

          <button>
            Settings
          </button>
        </nav>

      </div>


      <div className="header-title">
        AEM Press Release Manager
      </div>

    </header>
  );
}

export default Header;