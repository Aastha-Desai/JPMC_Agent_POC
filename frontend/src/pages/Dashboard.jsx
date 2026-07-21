import {useState} from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  function handleStartNewPressRelease(){
    console.log("Start New Press Release clicked");
  }

  return (

    <div className="app">

      <Header />

      <main className="dashboard">
        <section className = "dashboard-hero">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <button
            type = "button"
            className = "start-release-button"
            onClick={handleStartNewPressRelease}
          >
            <span>Start New Press Release</span>
            <span className="start-release-button__plus" aria-hidden="true">+</span>
          </button>
        </section>

      </main>

    </div>

  );

}

export default Dashboard;