import {useLocation, useNavigate} from "react-router";
import Header from "../components/Header";
import WorkflowTimeline from "../components/workflow/WorkflowTimeline";

function Processing(){
    const navigate = useNavigate();
    const location = useLocation();

    const fileName = location.state?.fileName || "press-release-document.docx";
    const jiraId = location.state?.jiraId || null;

    const workflowSteps = [
        {
            id: "validation",
            title: "AI Validation",
            description:
                "The document is being reviewed for required fields, content quality, and compliance issues.",
            status:"processing",
        },
        {
            id:"authoring",
            title:"AEM Authoring",
            description:
                "The press release page and related assets will be created in AEM.",
            status:"pending",
        },
        {
            id:"approval",
            title:"Approval",
            description:
                "The completed draft will wait for review by an authorized approver.",
            status:"pending",
        },
        {
            id:"publish",
            title:"Publish",
            description:
                "The approved press release will be pusblished to the live website.",
            status:"pending",
        },
    ];

    return(
        <div className = "app">
            <Header />

            <main className = "processing-page">
                <div className ="processing-page__heading">
                    <button 
                        type="button"
                        className ="back-button"
                        onClick = {()=>navigate("/new")}
                    >
                        <span aria-hidden="true">←</span>
                        Back
                    </button>
                    <div className = "processing-page__title-row">
                        <div>
                            <h1>Processing Press Release</h1>
                            <p>AI validation and authoring are being prepared for this request.</p>
                        </div>
                        <div className ="processing-page__case-status">
                            <span>Case Status</span>
                            <strong>In Progress</strong>
                        </div>
                    </div>
                </div>
                <div className="processing-layout">
                    <section className="document-preview-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>Document Preview</h2>
                                <p>Review the uploaded source document while the workflow runs.</p>
                            </div>
                            <span className="document-type-badge">DOCX</span>
                        </div>
                        <div className = "document-information">
                            <div className = "document-information__icon">W</div>
                            <div>
                                <strong>{fileName}</strong>

                                {jiraId ? (
                                    <span>Jira ID: {jiraId}</span>
                                ) : (
                                    <span>Uploaded document</span>
                                )}
                            </div>
                        </div>

                        <div className="document-preview">
                            <div className = "document=preview__page">
                                <div className="document-preview__company">
                                    JPMorganChase
                                </div>

                                <div className="document-preview__label">
                                    PRESS RELEASE
                                </div>
                                <h3>New Business Announcement and Strategic Initiative</h3>
                                <p className = "document-preview__date">New York, July 22, 2026</p>
                                <p>JPMorgan Chase today announced a new strategic initiative designed to imporve customer experiences and modernize digital content operations.</p>
                                <p>This initiative combines automated validation, structured authoring, and human approval to support consistent and compliant publishing workflows.</p>
                                <p>Additional information will be provided following review and approval.</p>
                            </div>
                        </div>
                        <div className = "document-preview-footer">
                            <span>Preview generated from uploaded source</span>
                            <button
                                type="button"
                                onClick={()=>console.log("Open document clicked")}
                            >
                                Open Document
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
                            <span className="workflow-progress-label"> Step 1 of 4</span>
                        </div>
                        <div className="workflow-progress-bar">
                            <div className="workflow-progress-bar__fill" />
                        </div>
                        <WorkflowTimeline steps={workflowSteps}/>

                        <div className="processing-note">
                            <strong>Human approval required</strong>
                            <p>Publishing will remain pending until an authorized approver reviews and approves the draft.</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Processing;