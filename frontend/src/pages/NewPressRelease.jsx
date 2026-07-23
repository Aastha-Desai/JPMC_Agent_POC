import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { createPressReleaseRequest } from "../api/pressReleaseApi";

const WORKFLOW_STEPS = [
  {
    id: "validation",
    number: 1,
    title: "AI Validation",
    items: [
      "Verifying input structure",
      "Issue identification",
    ],
  },
  {
    id: "authoring",
    number: 2,
    title: "AEM Authoring",
    items: [
      "Template selection and usage",
      "Page path generation",
      "Preview link",
      "Timestamp marking",
      "Issue identification",
    ],
  },
  {
    id: "approval",
    number: 3,
    title: "Approval",
    items: [
      "Approver 1: Susan Jennings",
      "Approver 2: Karl Korn",
      "Comments collected",
    ],
  },
  {
    id: "publish",
    number: 5,
    title: "Publish",
    items: [],
  },
];

function NewPressRelease() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [jiraId, setJiraId] = useState("");
  const [showJiraInput, setShowJiraInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleUploadButtonClick() {
    if (isSubmitting) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    setErrorMessage("");

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      setErrorMessage(
        "Please select a valid .docx Word document.",
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    await submitRequest({
      file,
      prompt: "",
    });
  }

  function handleJiraButtonClick() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setShowJiraInput(true);
  }

  async function handleJiraSubmit(event) {
    event.preventDefault();

    const cleanedJiraId = jiraId.trim();

    if (!cleanedJiraId) {
      setErrorMessage("Enter a Jira ID before continuing.");
      return;
    }

    await submitRequest({
      file: null,
      prompt: `Create a press release for Jira request ${cleanedJiraId}.`,
    });
  }

  async function submitRequest({ file, prompt }) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const apiResult = await createPressReleaseRequest({
        file,
        prompt,
      });

      navigate("/processing", {
        state: {
          apiResult,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process the press release request.",
      );

      setIsSubmitting(false);
    }
  }

  return (
    <main className="ux-upload-page">
      <section className="ux-upload-main">
        <button
          type="button"
          className="ux-back-link"
          onClick={() => navigate("/")}
          disabled={isSubmitting}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <div className="ux-document-frame">
          <div className="ux-upload-center">
            {!isSubmitting && !showJiraInput && (
              <>
                <h1>Add Press Release Document</h1>

                <p>Accepted files are pdf, docx.</p>

                <div className="ux-upload-divider" />

                <div className="ux-upload-buttons">
                  <button
                    type="button"
                    className="ux-primary-button"
                    onClick={handleUploadButtonClick}
                  >
                    Upload Document
                    <span aria-hidden="true">↥</span>
                  </button>

                  <button
                    type="button"
                    className="ux-primary-button"
                    onClick={handleJiraButtonClick}
                  >
                    Enter JIRA ID
                    <span aria-hidden="true">⊙</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  className="ux-hidden-file-input"
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                />
              </>
            )}

            {showJiraInput && !isSubmitting && (
              <form
                className="ux-jira-form"
                onSubmit={handleJiraSubmit}
              >
                <h1>Enter JIRA ID</h1>

                <p>
                  Enter the Jira issue associated with the press
                  release.
                </p>

                <input
                  type="text"
                  value={jiraId}
                  onChange={(event) =>
                    setJiraId(event.target.value)
                  }
                  placeholder="Example: PR-2026-104"
                  autoFocus
                />

                <div className="ux-jira-actions">
                  <button
                    type="button"
                    className="ux-secondary-button"
                    onClick={() => {
                      setShowJiraInput(false);
                      setJiraId("");
                      setErrorMessage("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="ux-primary-button"
                  >
                    Continue
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            )}

            {isSubmitting && (
              <div
                className="ux-processing-state"
                role="status"
              >
                <span className="ux-processing-spinner" />

                <h1>Processing Press Release</h1>

                <p>
                  {selectedFile
                    ? `Uploading ${selectedFile.name} and running the agent workflow.`
                    : "Retrieving the Jira request and running the agent workflow."}
                </p>

                <span className="ux-processing-note">
                  This may take a moment.
                </span>
              </div>
            )}

            {errorMessage && !isSubmitting && (
              <div className="ux-upload-error" role="alert">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="ux-workflow-sidebar">
        {WORKFLOW_STEPS.map((step) => (
          <WorkflowSection
            key={step.id}
            step={step}
          />
        ))}
      </aside>
    </main>
  );
}

function WorkflowSection({ step }) {
  return (
    <section className="ux-workflow-section">
      <div className="ux-workflow-heading">
        <div className="ux-workflow-title">
          <span className="ux-pending-icon">
            ◷
          </span>

          <strong>
            Step {step.number} {step.title}
          </strong>
        </div>

        <span className="ux-workflow-status">
          Pending
        </span>
      </div>

      {step.items.length > 0 && (
        <div className="ux-workflow-substeps">
          {step.items.map((item) => (
            <div
              className="ux-workflow-substep"
              key={item}
            >
              <span aria-hidden="true">◷</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ux-workflow-line" />
    </section>
  );
}

export default NewPressRelease;