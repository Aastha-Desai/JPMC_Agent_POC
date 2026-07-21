function FilterBar({
    selectedLocale,
    selectedLob,
    selectedErrors,
    onLocaleChange,
    onLobChange,
    onErrorsChange,
}){
    return (
        <div className="filter-bar">
            <span className="filter-bar__label">Filter By:</span>

            <label className="filter-select">
                <span className="sr-only">Filter by locale</span>

                <select
                    value={selectedLocale}
                    onChange={(event) => onLocaleChange(event.target.value)}
                >
                    <option value="all">Locale (ALL)</option>
                    <option value = "EN-US">EN-US</option>
                    <option value = "EN-CA">EN-CA</option>
                    <option value = "GLOBAL">Global</option>
                    <option value = "EN-EU">EN-EU</option>

                </select>
                <span className="filter-select__arrow">▼</span>
            </label>

            <label className="filter-select">
                <span className ="sr-only">Filter by line of business</span>
                
                <select
                    value={selectedLob}
                    onChange={(event) => onLobChange(event.target.value)}
                >
                    <option value="all">LoB (ALL)</option>
                    <option value = "Retail">Retail</option>
                    <option value = "Digital">Digital</option>
                    <option value = "Corporate">Corporate</option>
                    <option value = "Lifestyle">Lifestyle</option>
                    <option value = "Enterprise">Enterprise</option>
                </select>
                <span className="filter-select__arrow">▼</span>
            </label>

            <label className="filter-select">
                <span className="sr-only">Filter by errors</span>
                <select
                    value={selectedErrors}
                    onChange={(event) => onErrorsChange(event.target.value)}
                >
                    <option value="all">Errors (ALL)</option>
                    <option value = "with-errors">With Errors</option>
                    <option value = "no-errors">No Errors</option>
                </select>
                <span className="filter-select__arrow">▼</span>
            </label>
        </div>
    );
}

export default FilterBar;