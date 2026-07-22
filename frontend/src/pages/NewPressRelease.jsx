import { useState } from "react";
import {useNavigate} from "react-router";
import Header from "../components/Header";

function NewPressRelease() {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const[jiraId, setJireId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function handleFileChange(event){
        const file = event.target.files?.[0];

        setErrorMessage("");

        if(!file){
            setSelectedFile(null);
            return;
        }

        const isWordDocument = 
            file.name.toLowerCase().endsWith(".docx") ||
            file.name.toLowerCase().endsWith(".doc");
        
        if(!isWordDocument){
            setSelectedFile(null);
            setErrorMessage("Please upload a word document.");

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    }

    function handleRemoveFile(){
        setSelectedFile(null);
    }

    function handleStartProcessing(){
        setErrorMessage("");

        if(!selectedFile && jireId.trim() === ""){
            setErrorMessage("Upload a Word document or enter a Jira ID before continuing.",);
            return;
        }
        navigate("/processing", {
            state:{
                fileName:selectedFile?.name || null,
                jiraId: jiraId.trim() || null,
            },
        });
    }

    return (
        <div className="app">
            <Header />

            <main className="new-release-page">
                <div className = "new-release-heading">
                    <button 
                        type = "button"
                        className = "back-button"
                        onClick = {() => navigate("/")}
                    >
                        <span aria-hidden = "true">←</span>
                        Back to Dashboard
                    </button>
                    <h1>Start New Press Release</h1>
                    <p> Upload a press release content document or enter its Jira ID to begin validation and authoring.</p>
                </div>

                <div className="new-release-layout">
                    <section className="release-input-panel">
                        <h2>Press Release Content</h2>
                        <p className="panel-description">Select one of the following methods to provide the press release.</p>
                        <div className = "upload-area">
                            <div className="upload-icon" aria-hidden = "true">↑</div>
                            <h3>Upload Word Document</h3>
                            <p>Drag and drop a file here, or select a file from your computer.</p>

                            <label className="choose-file-button">
                                Choose File

                                <input 
                                    type="file"
                                    accept = ".doc,.docx"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <span className="file-requirement">
                                Accepted formates: .doc and .docx
                            </span>
                        </div>

                        {selectedFile && (
                            <div className = "selected-file">
                                <div className = "selected-file__information">
                                    <span className = "selected-file__icon" aria-hidden = "true"> W </span>

                                    <div>
                                        <strong>{selectedFile.name}</strong>

                                        <span>
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type = "button"
                                    className = "remove-file-button"
                                    onClick = {handleRemoveFile}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div className = "method-divider">
                            <span>OR</span>
                        </div>

                        <div className = "jira-section">
                            <label htmlFor = "jira-id">Enter Jira ID</label>

                            <input 
                                id="jira-id"
                                type = "text"
                                value = {jiraId}
                                onChange={(event) => setJiraId(event.target.value)}
                                placeholder = "Example: PR-2026-104"
                            />
                            <p> Enter the Jira issue containing the press release information.</p>
                        </div>

                        {errorMessage && (
                            <div className = "form-error" role="alert">
                                {errorMessage}
                            </div>
                        )}

                        <div className = "release-actions">
                            <button 
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate("/")}
                            >
                                Cancel
                            </button>

                            <button 
                                type="button"
                                className = "process-button"
                                onClick = {handleStartProcessing}
                            >
                                Start Processing
                                <span aria-hidden = "true">→</span>
                            </button>
                        </div>
                    </section>

                    <aside className="workflow-panel">
                        <div className="workflow-panel__heading">
                            <h2>Workflow</h2>

                            <span>All steps pending</span>
                        </div>

                        <div className = "workflow-list">
                            <WorkflowStep 
                                number="1"
                                title="AI Validation"
                                description = "Validate content, required fields, and compliance."
                            />
                            <WorkflowStep
                                number="2"
                                title = "AEM Authoring"
                                description="Create the draft press release page and assets."
                            />
                            <WorkflowStep 
                                number="3"
                                title="Approval"
                                description = "Wait for review and approval from the authorized person."
                            />
                            <WorkflowStep
                                number="4"
                                title = "Publish"
                                description = "Publish the approved press release in AEM."
                                isLast
                            />
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
}

function WorkflowStep({
    number,
    title, 
    description,
    isLast = false,
}) {
    return (
        <div className="workflow-step">
            <div className = "workflow-step__marker-column">
                <div className = "workflow-step__number">{number}</div>

                {!isLast && <div className = "workflow-step__line"/>}
            </div>
            <div className = "workflow-step__content">
                <div className = "workflow-step__title-row">
                    <h3>{title}</h3>
                    <span className = "workflow-status workflow-status--pending"> Pending </span>
                </div>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default NewPressRelease;