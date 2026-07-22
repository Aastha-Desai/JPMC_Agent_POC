import StatusBadge from "./StatusBadge";

function WorkflowStep({
    number,
    title,
    description,
    status,
    isLast = false,
}) {
    const normalizedStatus = status.toLowerCase();

    return (
        <div className = {`processing-step processing-step--${normalizedStatus}`}>
            <div className = "processing-step__marker-column">
                <div className ="processing-step__marker">
                    {normalizedStatus === "completed" ? "✓" : number}
                </div>
                {!isLast && <div className = "processing-step__line"/>}
            </div>

            <div className="processing-step__content">
                <div className="processing-step__heading">
                    <h3>{title}</h3>

                    <StatusBadge status={status}/>
                </div>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default WorkflowStep;