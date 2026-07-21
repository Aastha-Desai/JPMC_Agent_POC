import Card from "./Card";

function CardGrid({title, cases, onCardClick}){
    return(
        <section className="card-section">
            <h2>
                {title} ({cases.length})
            </h2>

            {cases.length>0 ? (
                <div className="card-grid">
                    {cases.map((caseItem) => (
                        <Card
                            key={caseItem.id}
                            caseItem={caseItem}
                            onClick={onCardClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    No press releases match your search and filters.
                </div>
            )}
        </section>
    );
}