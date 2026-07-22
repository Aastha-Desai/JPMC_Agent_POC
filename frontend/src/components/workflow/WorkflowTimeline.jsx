import WorkflowStep from "./WorkflowStep";

function WorkflowTimeline({ steps }) {
  return (
    <div className="processing-workflow">
      {steps.map((step, index) => (
        <WorkflowStep
          key={step.id}
          number={index + 1}
          title={step.title}
          description={step.description}
          status={step.status}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
}

export default WorkflowTimeline;