function Tabs({ activeTab, onTabChange, queueCount }){
    return(
        <div className="tabs" role="tablist">
            <button 
                type="button"
                role="tab"
                className={activeTab === "queue" ? "active": ""}
                aria-selected={activeTab === "queue"}
                onClick={() => onTabChange("queue")}
            >
                Current Queue ({queueCount})
            </button>

            <button
                type="button"
                role="tab"
                className={activeTab === "reports" ? "active": ""}
                aria-selected={activeTab === "reports"}
                onClick={() => onTabChange("reports")}
            >
                Reports
            </button>

            <button
                type="button"
                role="tab"
                className={activeTab === "history" ? "active": ""}
                aria-selected={activeTab === "history"}
                onClick={() => onTabChange("history")}
            >
                History
            </button>

        </div>
    );
}

export default Tabs;