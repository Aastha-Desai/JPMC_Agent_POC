import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import Header from "../components/Header";
import WorkflowTimeline from "../components/workflow/WorkflowTimeline";

const INITIAL_STEPS = [
  {
    id: "validation",
    title: "AI Validation",
    description:
      "The uploaded request is being checked for required fields, content quality, and compliance issues.",
    status: "processing",
  },
  {
    id: "authoring",
    title: "AEM Authoring",
    description:
      "The press release draft and supporting page content will be created.",
    status: "pending",
  },
  {
    id: "approval",
    title: "Approval",
    description:
      "The generated draft will wait for review by an authorized approver.",
    status: "pending",
  },
  {
    id: "publish",
    title: "Publish",
    description:
      "The approved press release will be published to the live website.",
    status: "pending",
  },
];

function Processing() {
  const navigate = useNavigate();
  const location = useLocation();

  const fileName =
    location.state?.fileName || "press-release-document.docx";

  const jiraId = location.state?.jiraId || null;

  const [workflowSteps, setWorkflowSteps] =
    useState(INITIAL_STEPS);

  const [activityMessages, setActivityMessages] = useState([
    {
      id: "request-received",
      text: "Press release request received.",
      time: new Date(),
    },
    {
      id: "validation-started",
      text: "AI Validation started.",
      time: new Date(),
    },
  ]);

  const [isWorkflowWaiting, setIsWorkflowWaiting] =
    useState(false);

  const addActivityMessage = useCallback((text) => {
    setActivityMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        time: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    const validationTimer = window.setTimeout(() => {
      setWorkflowSteps((currentSteps) =>
        currentSteps.map((step) => {
          if (step.id === "validation") {
            return {
              ...step,
              status: "completed",
              description:
                "Validation completed. Required fields, document structure, and compliance checks passed.",
            };
          }

          if (step.id === "authoring") {
            return {
              ...step,
              status: "processing",
              description:
                "The Author Agent is creating the press release draft and AEM page structure.",
            };
          }

          return step;
        }),
      );

      addActivityMessage(
        "AI Validation completed successfully.",
      );

      addActivityMessage("AEM Authoring started.");
    }, 3000);

    const authoringTimer = window.setTimeout(() => {
      setWorkflowSteps((currentSteps) =>
        currentSteps.map((step) => {
          if (step.id === "authoring") {
            return {
              ...step,
              status: "completed",
              description:
                "The draft press release and AEM page structure were created successfully.",
            };
          }

          if (step.id === "approval") {
            return {
              ...step,
              status: "waiting",
              description:
                "The generated draft is ready and waiting for review by an authorized approver.",
            };
          }

          return step;
        }),
      );

      addActivityMessage("AEM Authoring completed.");

      addActivityMessage(
        "The request is waiting for human approval.",
      );

      setIsWorkflowWaiting(true);
    }, 6500);

    return () => {
      window.clearTimeout(validationTimer);
      window.clearTimeout(authoringTimer);
    };
  }, [addActivityMessage]);

  const completedStepCount = useMemo(() => {
    return workflowSteps.filter(
      (step) => step.status === "completed",
    ).length;
  }, [workflowSteps]);

  const processingStepCount = useMemo(() => {
    return workflowSteps.filter(
      (step) => step.status === "processing",
    ).length;
  }, [workflowSteps]);

  const waitingStepCount = useMemo(() => {
    return workflowSteps.filter(
      (step) => step.status === "waiting",
    ).length;
  }, [workflowSteps]);

  const activeStepIndex = useMemo(() => {
    const processingIndex = workflowSteps.findIndex(
      (step) => step.status === "processing",
    );

    if (processingIndex !== -1) {
      return processingIndex;
    }

    const waitingIndex = workflowSteps.findIndex(
      (step) => step.status === "waiting",
    );

    if (waitingIndex !== -1) {
      return waitingIndex;
    }

    return 0;
  }, [workflowSteps]);

  const progressPercent = useMemo(() => {
    const progressValue = workflowSteps.reduce(
      (total, step) => {
        if (step.status === "completed") {
          return total + 1;
        }

        if (
          step.status === "processing" ||
          step.status === "waiting"
        ) {
          return total + 0.5;
        }

        return total;
      },
      0,
    );

    return Math.min(
      100,
      (progressValue / workflowSteps.length) * 100,
    );
  }, [workflowSteps]);

  const caseStatus = useMemo(() => {
    if (isWorkflowWaiting) {
      return {
        label: "Waiting for Approval",
        className: "waiting",
      };
    }

    return {
      label: "In Progress",
      className: "processing",
    };
  }, [isWorkflowWaiting]);

  return (
    <div className="app">
      <Header />

      <main className="processing-page">
        <div className="processing-page__heading">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/new")}
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <div className="processing-page__title-row">
            <div>
              <h1>Processing Press Release</h1>

              <p>
                Follow the validation, authoring, and approval
                workflow for this request.
              </p>
            </div>

            <div
              className={`processing-page__case-status processing-page__case-status--${caseStatus.className}`}
            >
              <span>Case Status</span>
              <strong>{caseStatus.label}</strong>
            </div>
          </div>
        </div>

        <div className="processing-layout">
          <section className="document-preview-panel">
            <div className="panel-heading">
              <div>
                <h2>Source Document</h2>

                <p>
                  This panel will display content extracted from the
                  uploaded document.
                </p>
              </div>

              <span className="document-type-badge">
                {jiraId ? "JIRA" : "DOCX"}
              </span>
            </div>

            <div className="document-information">
              <div className="document-information__icon">
                {jiraId ? "J" : "W"}
              </div>

              <div>
                <strong>
                  {jiraId
                    ? `Jira Request ${jiraId}`
                    : fileName}
                </strong>

                {jiraId ? (
                  <span>Content will be retrieved from Jira.</span>
                ) : (
                  <span>Uploaded source document</span>
                )}
              </div>
            </div>

            <div className="document-preview">
              <div className="document-preview__page document-preview__page--placeholder">
                <div className="source-preview-placeholder">
                  <div
                    className="source-preview-placeholder__icon"
                    aria-hidden="true"
                  >
                    {jiraId ? "J" : "W"}
                  </div>

                  <h3>Source document received</h3>

                  <p>
                    {jiraId
                      ? `The application received Jira ID ${jiraId}.`
                      : `The application received ${fileName}.`}
                  </p>

                  <p>
                    The real document text will appear here after the
                    React frontend is connected to the Flask backend.
                  </p>

                  <div className="source-preview-placeholder__details">
                    <span>
                      <strong>Current mode:</strong> Simulated frontend
                    </span>

                    <span>
                      <strong>Part 3:</strong> Flask document extraction
                    </span>

                    <span>
                      <strong>Final preview:</strong> Generated AEM draft
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="document-preview-footer">
              <span>
                The uploaded file has not been sent to Flask yet.
              </span>

              <button
                type="button"
                onClick={() =>
                  console.log("Open source document clicked")
                }
              >
                Open Source
              </button>
            </div>
          </section>

          <aside className="processing-workflow-panel">
            <div className="panel-heading">
              <div>
                <h2>Workflow Progress</h2>

                <p>
                  Follow the current status of each processing step.
                </p>
              </div>

              <span className="workflow-progress-label">
                Step {activeStepIndex + 1} of{" "}
                {workflowSteps.length}
              </span>
            </div>

            <div
              className="workflow-progress-bar"
              aria-label={`${Math.round(
                progressPercent,
              )}% workflow progress`}
            >
              <div
                className="workflow-progress-bar__fill"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <div className="workflow-summary">
              <span>
                <strong>{completedStepCount}</strong>
                completed
              </span>

              <span>
                <strong>{processingStepCount}</strong>
                processing
              </span>

              <span>
                <strong>{waitingStepCount}</strong>
                waiting
              </span>
            </div>

            <WorkflowTimeline steps={workflowSteps} />

            <div className="processing-activity">
              <div className="processing-activity__heading">
                <h3>Processing Activity</h3>

                {!isWorkflowWaiting && (
                  <span className="live-indicator">
                    <span className="live-indicator__dot" />
                    Live
                  </span>
                )}
              </div>

              <div className="processing-activity__list">
                {activityMessages.map((message) => (
                  <div
                    className="processing-activity__item"
                    key={message.id}
                  >
                    <span className="processing-activity__marker" />

                    <div>
                      <p>{message.text}</p>

                      <time>
                        {message.time.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="processing-note">
              <strong>Human approval required</strong>

              <p>
                The Publish Agent will not run until an authorized
                person approves the generated draft.
              </p>
            </div>

            {isWorkflowWaiting && (
              <div className="processing-actions">
                <button
                  type="button"
                  className="return-dashboard-button"
                  onClick={() => navigate("/")}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Processing;