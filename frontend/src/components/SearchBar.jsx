function SearchBar({searchQuery, onSearchChange}){
    return(
        <div className = "search-bar">
            <label htmlFor="dashboard-search" className="sr-only">
                Search press releases
            </label>

            <input 
                id="dashboard-search"
                type="search"
                value={searchQuery}
                onChange={(event)=> onSearchChange(event.target.value)}
                placeholder="Enter case ID, name, LoB, locale, etc to search"
            />
        </div>
    );
}

export default SearchBar