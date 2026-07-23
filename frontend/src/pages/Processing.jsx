import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  buildBackendUrl,
  getLatestPressReleaseRequest,
} from "../api/pressReleaseApi";

function normalizeStage(requestRecord) {
  return (
    requestRecord?.review_stage ||
    requestRecord?.status ||
    "REQUESTER_REVIEW"
  ).toUpperCase();
}

function buildWorkflowSections(requestRecord, apiResult) {
  const stage = normalizeStage(requestRecord);

  const validationCompleted = [
    "REQUESTER_REVIEW",
    "PEER_REVIEW",
    "MANAGER_REVIEW",
    "READY_FOR_PUBLISH",
    "PUBLISHED",
  ].includes(stage);

  const authoringCompleted = validationCompleted;

  const requesterCompleted = [
    "PEER_REVIEW",
    "MANAGER_REVIEW",
    "READY_FOR_PUBLISH",
    "PUBLISHED",
  ].includes(stage);

  const peerCompleted = [
    "MANAGER_REVIEW",
    "READY_FOR_PUBLISH",
    "PUBLISHED",
  ].includes(stage);

  const managerCompleted = [
    "READY_FOR_PUBLISH",
    "PUBLISHED",
  ].includes(stage);

  const published = stage === "PUBLISHED";

  const approvalComplete =
    requesterCompleted &&
    peerCompleted &&
    managerCompleted;

  let approvalStatus = "Pending";

  if (
    stage === "REQUESTER_REVIEW" ||
    stage === "PEER_REVIEW" ||
    stage === "MANAGER_REVIEW"
  ) {
    approvalStatus = "Processing";
  }

  if (approvalComplete) {
    approvalStatus = "Completed";
  }

  return [
    {
      id: "validation",
      number: 1,
      title: "AI Validation",
      status: validationCompleted
        ? "Completed"
        : "Processing",
      progress: validationCompleted ? 100 : 45,
      items: [
        {
          label: "Verifying input structure",
          status: validationCompleted
            ? "completed"
            : "processing",
        },
        {
          label: "Issue identification",
          status: validationCompleted
            ? "completed"
            : "pending",
        },
      ],
    },
    {
      id: "authoring",
      number: 2,
      title: "AEM Authoring",
      status: authoringCompleted
        ? "Completed"
        : validationCompleted
          ? "Processing"
          : "Pending",
      progress: authoringCompleted
        ? 100
        : validationCompleted
          ? 50
          : 0,
      items: [
        {
          label: "Templated selection and usage",
          status: authoringCompleted
            ? "completed"
            : "pending",
        },
        {
          label: "Page path generation",
          status: authoringCompleted
            ? "completed"
            : "pending",
        },
        {
          label: "Preview Link",
          status: authoringCompleted
            ? "completed"
            : "pending",
        },
        {
          label: "Timestamp marking",
          status: authoringCompleted
            ? "completed"
            : "pending",
        },
        {
          label: "Issue identification",
          status: authoringCompleted
            ? "completed"
            : "pending",
        },
      ],
      notice:
        apiResult?.workflow_result?.agent_2?.errors?.length > 0
          ? `${apiResult.workflow_result.agent_2.errors.length} Errors: Resolve Failed Asset Mapping`
          : null,
    },
    {
      id: "approval",
      number: 3,
      title: "Approval",
      status: approvalStatus,
      progress: approvalComplete
        ? 100
        : stage === "MANAGER_REVIEW"
          ? 70
          : stage === "PEER_REVIEW"
            ? 45
            : stage === "REQUESTER_REVIEW"
              ? 22
              : 0,
      items: [
        {
          label: "Approver 1: Requester Review",
          status: requesterCompleted
            ? "completed"
            : stage === "REQUESTER_REVIEW"
              ? "processing"
              : "pending",
        },
        {
          label: "Approver 2: Peer Review",
          status: peerCompleted
            ? "completed"
            : stage === "PEER_REVIEW"
              ? "processing"
              : "pending",
        },
        {
          label: "Approver 3: Manager Review",
          status: managerCompleted
            ? "completed"
            : stage === "MANAGER_REVIEW"
              ? "processing"
              : "pending",
        },
        {
          label: "Comments collected",
          status: approvalComplete
            ? "completed"
            : "pending",
        },
      ],
    },
    {
      id: "publish",
      number: 5,
      title: "Publish",
      status: published
        ? "Completed"
        : managerCompleted
          ? "Processing"
          : "Pending",
      progress: published
        ? 100
        : managerCompleted
          ? 35
          : 0,
      items: [],
    },
  ];
}

function Processing() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationResult =
    location.state?.apiResult || null;

  const [apiResult, setApiResult] =
    useState(navigationResult);

  const [isLoading, setIsLoading] = useState(
    !navigationResult,
  );

  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (navigationResult) {
      return;
    }

    async function loadLatestRequest() {
      try {
        const result =
          await getLatestPressReleaseRequest();

        setApiResult(result);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load the latest request.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLatestRequest();
  }, [navigationResult]);

  const requestRecord = apiResult?.request || null;

  const sourceText =
    apiResult?.source?.text ||
    "The extracted source content is unavailable after refreshing this page.";

  const workflowSections = useMemo(
    () =>
      buildWorkflowSections(
        requestRecord,
        apiResult,
      ),
    [requestRecord, apiResult],
  );

  const draftUrl = buildBackendUrl(
    apiResult?.draft_link,
  );

  if (isLoading) {
    return (
      <main className="ux-processing-page ux-processing-page--centered">
        <div className="ux-processing-loading">
          <span className="ux-processing-spinner" />

          <h1>Loading Press Release</h1>

          <p>
            Retrieving workflow information from Flask.
          </p>
        </div>
      </main>
    );
  }

  if (loadError || !apiResult) {
    return (
      <main className="ux-processing-page ux-processing-page--centered">
        <div className="ux-processing-error">
          <h1>Unable to Load Request</h1>

          <p>
            {loadError || "No request was found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/new")}
          >
            Start New Request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="ux-processing-page">
      <section className="ux-processing-document-area">
        <button
          type="button"
          className="ux-processing-back-link"
          onClick={() => navigate("/")}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <div className="ux-processing-document-frame">
          <article className="ux-processing-document-page">
            <div className="ux-processing-document-content">
              {sourceText
                .split("\n")
                .filter((line) => line.trim())
                .map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph.slice(0, 20)}`}
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </article>
        </div>

        {draftUrl && (
          <div className="ux-processing-document-footer">
            <span>
              Request{" "}
              {requestRecord?.request_id ||
                "Unavailable"}
            </span>

            <a
              href={draftUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Preview Link
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </section>

      <aside className="ux-processing-sidebar">
        {workflowSections.map((section) => (
          <WorkflowSection
            key={section.id}
            section={section}
          />
        ))}
      </aside>
    </main>
  );
}

function WorkflowSection({ section }) {
  const normalizedStatus =
    section.status.toLowerCase();

  return (
    <section
      className={`ux-processing-workflow-section ux-processing-workflow-section--${normalizedStatus}`}
    >
      <div className="ux-processing-workflow-heading">
        <div className="ux-processing-workflow-title">
          <StatusIcon status={normalizedStatus} />

          <strong>
            Step {section.number} {section.title}
          </strong>
        </div>

        <span
          className={`ux-processing-workflow-status ux-processing-workflow-status--${normalizedStatus}`}
        >
          {section.status}
        </span>
      </div>

      {section.items.length > 0 && (
        <div className="ux-processing-substeps">
          {section.items.map((item) => (
            <div
              className="ux-processing-substep"
              key={item.label}
            >
              <SubstepIcon status={item.status} />

              <p>{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {section.notice && (
        <div className="ux-processing-warning">
          {section.notice}
        </div>
      )}

      <div className="ux-processing-progress-track">
        <div
          className={`ux-processing-progress-fill ux-processing-progress-fill--${normalizedStatus}`}
          style={{
            width: `${section.progress}%`,
          }}
        />
      </div>
    </section>
  );
}

function StatusIcon({ status }) {
  if (status === "completed") {
    return (
      <span className="ux-processing-status-icon ux-processing-status-icon--completed">
        ✓
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="ux-processing-status-icon ux-processing-status-icon--processing">
        ◷
      </span>
    );
  }

  return (
    <span className="ux-processing-status-icon ux-processing-status-icon--pending">
      ◷
    </span>
  );
}

function SubstepIcon({ status }) {
  if (status === "completed") {
    return (
      <span className="ux-processing-substep-icon ux-processing-substep-icon--completed">
        ✓
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="ux-processing-substep-icon ux-processing-substep-icon--processing">
        ◷
      </span>
    );
  }

  return (
    <span className="ux-processing-substep-icon ux-processing-substep-icon--pending">
      ◷
    </span>
  );
}

export default Processing;