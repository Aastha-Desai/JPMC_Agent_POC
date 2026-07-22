import {useLocation, useNavigate} from "react-router";
import Header from "../components/Header";

function Processing(){
    const navigate = useNavigate();
    const location = useLocation();

    const fileName = location.state?.fileName;
    const jiraId = location.state?.jiraId;

    return(
        <div className = "app">
            <Header />

            <main className = "processing-placeholder">
                <h1>Processing Press Release</h1>

                {fileName && (
                    <p>Uploaded document: <strong>{fileName}</strong></p>
                )}
                {jiraId && (
                    <p>Jira ID: <strong>{jiraId}</strong></p>
                )}
                <p>The full processing workflow will be built in the next section.</p>
                <button 
                    type="button"
                    onClick={() => navigate("/new")}
                >
                    Back
                </button>
            </main>
        </div>
    );
}

export default Processing;