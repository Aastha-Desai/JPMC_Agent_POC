import { useMemo, useState } from "react";
import {useLocation, useNavigate, useParams} from "react-router";
import { mockCases } from "../data/mockCases";
import "../styles/aemReview.css";

function getReviewScore(caseItem) {
    if(typeof caseItem?.reviewScore === "number") {
        return caseItem.reviewScore;
    }

    const errorCount = Number(caseItem?.errorCount || 0);

    return Math.max(55,96 - errorCount *4);
}

function getDisplayValue(value,fallback = "Not available") {
    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return fallback;
    }
    return value;

}

function createIssues(caseItem) {
    if (
        Array.isArray(caseItem?.issues) &&
        caseItem.issues.length > 0
    ) {
        return caseItem.issues;
    }

    const errorCount = Number(caseItem?.errorCount || 0);

    if(errorCount === 0){
        return [
            {
                id: "review-ready",
                severity: "low",
                category: "Content Review",
                title: "No blocking issues identified",
                description:
                    "The automated checks completed without finding any blocking content or structure problems.",
                location: "Entire document",
            },
        ];
    }

    const defaultIssues = [
        {
            id: "missing-alt-text",
            severity:"high",
            category: "Digital Assets",
            title: "Missing alternative text",
            description:
                "One or more digital assets require descriptive alternative text before publication.",
            location:"Hero image",
        },
        {
            id:"heading-order",
            severity:"medium",
            category:"Page Structure",
            title:"Heading structure should be reviewed",
            description:
                "A heading level may be out of sequance and should be reviewed for accessibility.",
            location:"Press release body",
        },
        {
            id:"metadata-review",
            severity:"medium",
            category:"Page Metadata",
            title:"Metadata is incomplete",
            description:
                "The page description or social sharing metadata may need additional information.",
            location:"Page properties",
        },
        {
            id:"fragment-reference",
            severity:"low",
            category:"Content Fragments",
            title:"Content fragment reference should be confirmed",
            description:
                "Confirm that the referenced content fragment is the approved version.",
            location:"Related content",
        },
        {
            id:"asset-format",
            severity:"low",
            category:"Digital Assets",
            title:"Asset optimization recommended",
            description:
                "An uploaded asset could be optimized to reduce its file size.",
            location:"Supporting image",
        },
    ];
    return defaultIssues.slice(
        0,
        Math.min(errorCount, defaultIssues.length),
    );
}

function getStageLabel(caseItem){
    return (
        caseItem?.reviewStage ||
        caseItem?.stage ||
        caseItem?.statusMessage ||
        caseItem?.status ||
        "Requestor Review"
    );
}

function AemReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { caseId } = useParams();

    const caseFromNavigation = location.state?.caseItem;

    const caseFromMockData = useMemo(
        () =>
            mockCases.find(
                (caseItem)=>
                    String(caseItem.id).toLowerCase() ===
                    String(caseId).toLowerCase(),
            ),
        [caseId],
    );

    const caseItem = 
        caseFromNavigation ||
        caseFromMockData || {
            id:caseId,
            title: "Press Release Review",
            locale: "en-US",
            lob: "Corporate Communications",
            statusMessage: "Ready for review",
            processingState: "completed",
            errorCount:0,
        };
    const [activeContentTab, setActiveContentTab] = useState("pages");
    const [activePriority, setActivePriority] = useState("all");
    const [approvalStatus, setApprovalStatus] = useState("pending");
    const [showAllContent, setShowAllContent] = useState(false);

    const reviewScore = getReviewScore(caseItem);
    const issues = createIssues(caseItem);

    const filteredIssues = issues.filter((issue) => {
        if(activePriority === "all") {
            return true;
        }
        return issue.severity === activePriority;
    });
    const highCount = issues.filter((issue)=> issue.severity === "high",).length;
    const mediumCount = issues.filter((issue)=> issue.severity === "medium",).length;
    const lowCount = issues.filter((issue)=>issue.severity === "low" ,).length;
    
    function handleBackToDashboard() {
        navigate("/");
    }

    function handleApprove() {
        setApprovalStatus ("approved");
    }

    function handleRequestChanges() {
        setApprovalStatus("changes-requested");
    }

    const documentText =
        caseItem.documentText ||
        caseItem.sourceText ||
        caseItem.description ||
        `JPMorganChase today announced ${caseItem.title}.
        The organization continues to invest in scalable digital experiences, intelligent automation, and streamlined publishing workflows.
        This press release was processed through automated validation, and authoring checks. The content is now available for human review before proceeding to the next approval stage.
        Additional information, supporting assets, and publication metadata can be reviewed in the case summary and automated issue panel.`;

        return (
            <div className = "aem-review-page">
                <header className = "aem-review-header">
                    <button 
                        type="button"
                        className = "aem-review-header__back"
                        onClick = {handleBackToDashboard}
                    >
                        <span aria-hidden="true">←</span>
                        Back to Dashboard
                    </button>
                    <div vlassName = "aem-review-header__actions">
                        <button    
                            type ="button"
                            className ="aem-review-secondary-button"
                            onClick={handleRequestChanges}
                        >
                            Request Changes
                        </button>

                        <button 
                            type="button"
                            className="aem-review-approve-button"
                            onClick={handleApprove}
                            disabled = {approvalStatus === "approved"}
                        >
                            {approvalStatus === "approved"
                                ? "Approved"
                                : "Approve"}
                        </button>
                    </div>
                </header>
                <main className = "aem-review-main">
                    <section className = "aem-review-title-row">
                        <div>
                            <div className = "aem-review-eyebrow">
                                AEM REVIEW
                            </div>
                            <h1>{getDisplayName(caseItem.title)}</h1>
                            <div className ="aem-review-title-meta">
                                <span>{getDisplayValue(caseItem.Id)}</span>
                                <span aria-hidden="true">•</span>
                                <span>{getStageLabel(caseItem)}</span>
                            </div>
                        </div>
                        <div
                            className = {`aem-review-decision aem-review-decision--${approvalStatus}`}
                        >
                            {approvalStatus === "approved" && (
                                <>
                                    <strong>Approved</strong>
                                    <span>
                                        This case can continue in the next workflow stage.
                                    </span>
                                </>
                            )}

                            {approvalStatus === "changes-requested" && (
                                <>
                                    <strong>Changes requested</strong>
                                    <span>
                                        The case should return to the author for revision.
                                    </span>
                                </>
                            )}

                            {approvalStatus === "pending" && (
                                <>
                                    <strong>Approval pending</strong>
                                    <span>
                                        Review the page and automated findings.
                                    </span>
                                </>
                            )}
                        </div>
                    </section>
                    <section className="aem-review-content">
                        <div className="aem-review-workspace">
                            <div className = "aem-review-content-tabs">
                                <button    
                                    type="button"
                                    className={
                                        activeContentTab === "pages"
                                            ? "aem-review-content-tab aem-review-content-tab--active"
                                            : "aem-review-content-tab"
                                    }
                                    onClick={() => setActiveContentTab("pages")}
                                >
                                    Pages
                                    <span>1</span>
                                </button>
                                <button
                                    type="button"
                                    className={
                                        activeContentTab === "fragments"
                                            ? "aem-review-content-tab aem-review-content-tab--active"
                                            : "aem-review-content-tab"
                                    }
                                    onClick={()=>
                                        setActiveContentTab("fragments")
                                    }
                                >
                                    Content Fragments
                                    <span>{caseItem.fragmentCount || 2}</span>
                                </button>

                                <button 
                                    type="button"
                                    className={
                                        activeContentTab === "assets"
                                            ? "aem-review-content-tab aem-review-content-tab--active"
                                            :"aem-review-content-tab"
                                    }
                                    onClick={()=>setActiveContentTab("assets")}
                                >
                                    Digital Assets
                                    <span>{caseItem.assetCount || 3}</span>
                                </button>
                                    
                            </div>
                            {activeContentTab === "pages" && (
                                <div className ="aem-review-document-shell">
                                    <div className = "aem-review-document-toolbar">
                                        <div>
                                            <span className = "aem-review-document-icon">
                                                P
                                            </span>
                                            <div>
                                                <strong>
                                                    {getDisplayValue(caseItem.title)}
                                                </strong>
                                                <span>
                                                    /content/jpmc/press-releases/
                                                    {String(caseItem.id).toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button">Open in AEM</button>
                                    </div>
                                    <article className = "aem-review-document">
                                        <div className="aem-review-document__brand">
                                            JPMorganChase
                                        </div>
                                        <div className="aem-review-document__category">
                                            NEWS &amp; STORIES
                                        </div>
                                        <h2>{getDisplayValue(caseItem.title)}</h2>
                                        <p className = "aem-review-document__subtitle">
                                            Automated press release preview for{" "}
                                            {getDisplayValue(caseItem.lob)}
                                        </p>

                                        <div className = "aem-review-document__metadata">
                                            <span>
                                                {getDisplayValue (
                                                    caseItem.location,
                                                    "New York",
                                                )}
                                            </span>
                                            <span aria-hidden="true">|</span>

                                            <span>
                                                {getDisplayValue(
                                                    caseItem.date,
                                                    "July 2026",
                                                )}
                                            </span>
                                        </div>
                                        <div 
                                            className ={
                                                showAllContent
                                                    ? "aem-review-document__body aem-review-document__body--expanded"
                                                    : "aem-review-document__body"
                                            }
                                        >
                                            {documentText
                                                .split("\n")
                                                .filter((paragraph)=>paragraph.trim())
                                                .map((paragraph,index)=>(
                                                    <p key={`${paragraph}-${index}`}>
                                                        {paragraph}
                                                    </p>
                                                ))}
                                        </div>
                                        <button     
                                            type="button"
                                            className = "aem-review-document__expand"
                                            onClick={() =>
                                                setShowAllContent((current)=>!current)
                                            }
                                        >
                                            {showAllContent
                                                ? "Show less"
                                                : "View full page content"}
                                        </button>
                                    </article>
                                </div>
                            )}

                            {activeContentTab === "fragments" && (
                                <div className ="aem-review-resource-list">
                                    <div className = "aem-review-resource-card">
                                        <div className="aem-review-resource-card__icon">
                                            CF
                                        </div>
                                        <div>
                                            <strong>Press Release Metadata</strong>
                                            <span>
                                                Title, publication date, locale, and line of business
                                            </span>
                                        </div>

                                        <span className="aem-review-resource-status">
                                            Valid
                                        </span>
                                    </div>
                                    <div className = "aem-review-resource-card">
                                        <div className = "aem-review-resource-card__icon">
                                            CF
                                        </div>
                                        <div>
                                            <strong>Content Information</strong>
                                            <span>
                                                Media contact and organizational information
                                            </span>
                                        </div>
                                        <span className="aem-review-resource-status">
                                            Review
                                        </span>
                                    </div>
                                </div>
                            )}
                            {activeContentTab === "assets" && (
                                <div className = "aem-review-assets">
                                    <div className = "aem-review-assts-card">
                                        <div className = "aem-review-asset-preview">
                                            Hero
                                        </div>
                                        <strong>Press Release hero image</strong>
                                        <span>JPEG . 2400 x 1350</span>
                                    </div>
                                    <div className="aem-review-asset-card">
                                        <div className ="aem-review-asset-preview">
                                            Logo
                                        </div>
                                        <strong>Corporate logo</strong>
                                        <span>SVG . Vector</span>
                                    </div>
                                    <div className="aem-review-asset-card">
                                        <div className="aem-review-asset-preview">
                                            PDF
                                        </div>
                                        <strong>Supporting document</strong>
                                        <span>PDF . 2 pages</span>
                                    </div>
                                </div>
                            )}

                        </div>
                        <aside className = "aem-review-sidebar">
                            <section className="aem-review-score-card">
                                <div className = "aem-review-score-card__top">
                                    <div>
                                        <span>Review Score</span>
                                        <strong>{reviewScore}%</strong>
                                    </div>
                                    <div className="aem-review-score-ring" style={{"--review-score":`${reviewScore * 3.6}deg`,}}>
                                        <span>{reviewScore}</span>
                                    </div>
                                </div>
                                <div className = "aem-review-score-progress">
                                    <span style={{width:`${reviewScore}%`,}}/>
                                </div>
                                <p>Automated structure, content, metadata, and accessibility checks.</p>
                            </section>
                            <section className="aem-review-summary-card">
                                <div className="aem-review-sidebar-heading">
                                    <h2>Case Summary</h2>
                                </div>
                                <dl>
                                    <div>
                                        <dt>Case ID</dt>
                                        <dd>{getDisplayValue(caseItem.id)}</dd>
                                    </div>
                                    <div>
                                        <dt>Status</dt>
                                        <dd>{getStageLabel(caseItem)}</dd>
                                    </div>
                                    <div>
                                        <dt>Locale</dt>
                                        <dd>{getDisplayValue(caseItem.locale, "en-US")}</dd>
                                    </div>
                                    <div>
                                        <dt>Line of Business</dt>
                                        <dd>{getDisplayValue(caseItem.lob,"Corporate Communications",)}</dd>
                                    </div>
                                    <div>
                                        <dt>Requester</dt>
                                        <dd>{getDisplayValue(caseItem.requester, "Someone Name",)}</dd>
                                    </div>
                                    <div>
                                        <dt>Last Updated</dt>
                                        <dd>{getDisplayValue(caseItem.lastUpdated, "Recently",)}</dd>
                                    </div>
                                </dl>
                            </section>
                        </aside>
                    </section>
                    <section className = "aem-review-issues-section">
                        <div className="aem-review-issues-header">
                            <div>
                                <span className="aem-review-eyebrow">
                                    AUTOMATED REVIEW
                                </span>
                                <h2>Issues and Recommendations</h2>
                            </div>
                            <div className="aem-review-priority-tabs">
                                <button 
                                    type="button"
                                    className={
                                        activePriority === "all"
                                            ? "aem-review-priority-tab aem-review-priority-tab--active"
                                            : "aem-review-priority-tab"
                                    }
                                    onClick={()=>setActivePriority("all")}
                                >
                                    All
                                    <span>{issues.length}</span>
                                </button>
                                <button 
                                    type="button"
                                    className={
                                        activePriority === "high"
                                            ? "aem-review-priority-tab aem-review-priority-tab--active"
                                            : "aem-review-priority-tab"
                                    }
                                    onClick={()=>setActivePriority("high")}
                                >
                                    High
                                    <span>{highCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={
                                        activePriority === "medium"
                                            ? "aem-review-priority-tab aem-review-priority-tab--active"
                                            : "aem-review-priority-tab"
                                    }
                                    onClick={()=> setActivePriority("medium")}
                                >
                                    Medium
                                    <span>{mediumCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={
                                        activePriority === "low"
                                            ? "aem-review-priority-tab aem-review-priority-tab--active"
                                            : "aem-review-priority-tab"
                                    }
                                    onClick={()=> setActivePriority("low")}
                                >
                                    Low
                                    <span>{lowCount}</span>
                                </button>
                            </div>
                        </div>
                        {filteredIssues.length>0 ? (
                            <div className="aem-review-issue-grid">
                                {filteredIssues.map((issue)=>(
                                    <article
                                        key={issue.id}
                                        className={`aem-review-issue-card aem-review-issue-card--${issue.severity}`}
                                    >
                                        <div className="aem-review-issue-card__top">
                                            <span className={`aem-review-severity aem-review-severity--${issue.severity}`}
                                        >
                                            {issue.severity}
                                        </span>
                                        <span>{issue.category}</span>
                                        </div>
                                        <h3>{issue.title}</h3>
                                        <p>{issue.description}</p>

                                        <div className = "aem-review-issue-card__location">
                                            <strong>Location</strong>
                                            <span>{issue.location}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="aem-review-empty-issues">
                                No issues match the selected priority.
                            </div>
                        )}
                    </section>
                </main>
            </div>
        )
}