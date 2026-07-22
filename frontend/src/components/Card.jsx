function Card({ caseItem, onClick }) {
  const isProcessing = caseItem.confidence === null;

  let confidenceClass = "case-card__confidence--low";

  if (caseItem.confidence >= 80) {
    confidenceClass = "case-card__confidence--high";
  } else if (caseItem.confidence >= 60) {
    confidenceClass = "case-card__confidence--medium";
  }

  return (
    <button
      type="button"
      className="case-card"
      onClick={() => onClick(caseItem)}
      aria-label={`Open ${caseItem.id}: ${caseItem.title}`}
    >
      <div className="case-card__header">
        <div className="case-card__title">
          <h3>{caseItem.id}</h3>
          <p>{caseItem.title}</p>
        </div>

        {isProcessing ? (
          <span className="case-card__pending">Pending</span>
        ) : (
          <span className={`case-card__confidence ${confidenceClass}`}>
            {caseItem.confidence}%
          </span>
        )}
      </div>

      <div className="case-card__divider" />

      <div className="case-card__details">
        <span>
          <strong>Locale</strong>
          {caseItem.locale}
        </span>

        <span>
          <strong>LoB</strong>
          {caseItem.lob}
        </span>
      </div>

      <div
        className={`case-card__status case-card__status--${caseItem.statusType}`}
      >
        {!isProcessing && (
          <strong>
            {caseItem.errorCount}{" "}
            {caseItem.errorCount === 1 ? "Error" : "Errors"}:
          </strong>
        )}

        <span>{caseItem.statusMessage}</span>
      </div>
    </button>
  );
}

export default Card;