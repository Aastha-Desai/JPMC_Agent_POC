import {useMemo, useState} from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Tabs from "../components/Tabs";
import FilterBar from "../components/FilterBar";
import CardGrid from "../components/CardGrid";
import { mockCases } from "../data/mockCases";

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedLocale, setSelectedLocale] = useState("all");
  const [selectedLob, setSelectedLob] = useState("all");
  const [selectedErrors, setSelectedErrors] = useState("all");
  
  const filteredCases = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return mockCases.filter((caseItem) => {
      const matchesSearch =
        normalizedSearch === "" ||
        caseItem.id.toLowerCase().includes(normalizedSearch) ||
        caseItem.title.toLowerCase().includes(normalizedSearch) ||
        caseItem.locale.toLowerCase().includes(normalizedSearch) ||
        caseItem.lob.toLowerCase().includes(normalizedSearch) ||
        caseItem.statusMessage.toLowerCase().includes(normalizedSearch);
      
      const matchesLocale =
        selectedLocale === "all" || caseItem.locale === selectedLocale;
      const matchesLob =
        selectedLob === "all" || caseItem.lob === selectedLob;
      const matchesErrors =
        selectedErrors === "all" || 
        (selectedErrors === "withErrors" && caseItem.errorCount > 0) ||
        (selectedErrors === "no-errors" && caseItem.errorCount === 0);


      return (matchesSearch && matchesLocale && matchesLob && matchesErrors);
    });
  }, [searchQuery, selectedLocale, selectedLob, selectedErrors]);

  const completedCases = filteredCases.filter((caseItem) => caseItem.processingState === "completed");
  const processingCases = filteredCases.filter((caseItem) => caseItem.processingState === "processing");

  function handleStartNewPressRelease(){
    console.log("Start New Press Release clicked");
  }
  function handleCardClick(caseItem){
    console.log("Selected Case:", caseItem.id);
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

        <section className="dashboard-controls">
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            queueCount={7}
          />
          <FilterBar
            selectedLocale={selectedLocale}
            selectedLob={selectedLob}
            selectedErrors={selectedErrors}
            onLocaleChange={setSelectedLocale}
            onLobChange={setSelectedLob}
            onErrorsChange={setSelectedErrors}
          />
        </section>

        {activeTab === "queue" ? (
          <div className="queue-content">
            <CardGrid
              title="Processing Completed"
              cases={completedCases}
              onCardClick={handleCardClick}
            />
            <CardGrid
              title="Currently Processing"
              cases={processingCases}
              onCardClick={handleCardClick}
            />  
          </div>
        ) : (
          <div className="tab-placeholder">
            <h2>
              {activeTab==="reports" ? "Reports": "History"}
            </h2>
            <p>This section will be built later.</p>
          </div>
        )}


      </main>

    </div>

  );

}

export default Dashboard;