import {useEffect, useState} from "react";
import { useTimer } from "../Time/TimerContext.js";
import { useLocation} from "react-router-dom";
import "./Injects.css";

const formatTime = (seconds) =>{
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600)/60);
    const s = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function importAll(r) { //This function processes inject pdfs and names them inject 1..2..3
    return r.keys().map((file, index) => ({
        id: index + 1,
        name: `Inject ${index + 1}`,
        file: r(file)
    }));
}

const tutorialInjects = importAll( //Pulls injects for tut. mode
    require.context("../TutorialMode", false, /\.pdf$/)
);

const competitionInjects = importAll( //Pulls injects for comp. mode
    require.context("../CompetitionMode", false, /\.pdf$/)
);

export default function Injects() {
    const {secondsLeft, isRunning } = useTimer();
    const location = useLocation();
    const currentMode = location.state?.currentMode || 1; //Determines difficulty mode with 1 as tut. 2 as comp.
    const activeInjects = currentMode === 1 ? tutorialInjects : competitionInjects; //Selects what folder it pulls injects from.
    const difficultyTimeSettings = {
        1: { injectAddTime: 600, deadline: 1800}, //Tutorial Mode
        2: { injectAddTime: 5, deadline: 15}
    };
    const currentTimeSettings = difficultyTimeSettings[currentMode]; //Pulls timing settings for adding injects and deadlines
    const [displayedInjects, setInjects] = useState([]); //Holds injects added to the page
    const [submittedInjects, setSubmittedInjects] = useState({}); //Checks whether inject has been completed
    const [injectDeadline, setInjectDeadline] = useState({});

    useEffect(() => { //Loads page data.
        const savedInjects = JSON.parse(localStorage.getItem("savedInjectsIds"));
        const saveSubmitted = JSON.parse(localStorage.getItem("savedSubmitted"));
        const savedDeadline = JSON.parse(localStorage.getItem("injectDeadline"));
        if (savedInjects) setInjects(savedInjects);
        if (saveSubmitted) setSubmittedInjects(saveSubmitted);
        if (savedDeadline) setInjectDeadline(savedDeadline);
    }, []);

    useEffect(() => { //Uses reset button to clear injects
        const saved = JSON.parse(localStorage.getItem("labTimer"));
        if (!isRunning && saved?.endTime === 0 && secondsLeft === 600){
            setInjects([]);
            setSubmittedInjects({});
            setInjectDeadline({});
            localStorage.clear();
            window.location.reload();
        }
    },[secondsLeft, isRunning]);

    function addInjects() { //Call this to add more injects
        if (displayedInjects.length < activeInjects.length) {
            const nextInject = activeInjects[displayedInjects.length];
            const injectList = [...displayedInjects, nextInject];
            setInjects(injectList);
            localStorage.setItem("savedInjectsIds", JSON.stringify(injectList));
            const newDeadline = {
                ...injectDeadline,
                [nextInject.id]: secondsLeft - currentTimeSettings.deadline
            };
            setInjectDeadline(newDeadline);
            localStorage.setItem("injectDeadline", JSON.stringify(newDeadline));
        }
    }

    useEffect(() => { //This function controls the timing of when injects are deployed
        if (isRunning && secondsLeft > 0 && secondsLeft % currentTimeSettings.injectAddTime === 0) { //Current set to deploy every 10 seconds for testing.
            addInjects();
        }
    }, [secondsLeft, isRunning]);

    function handleCheckbox(injectId, checked) { //This is how users check off a task
        const expired = secondsLeft <=  injectDeadline[injectId];
        if (expired) return;
            const newSubmission = {
                ...submittedInjects,
                [injectId]: checked
            };
            setSubmittedInjects(newSubmission);
            localStorage.setItem("savedSubmitted", JSON.stringify(newSubmission));
    }

    return (
        <div className = "injectsContainer">
            <img
            src="Header.png" alt="IUS CCDC Banner" className="center">
            </img>
            <h1 className= "topHeader">Inject List
            </h1>
            <div className="injectsBox">
                <ul className="injectsList">
                    <li className="injectHeader">
                        <span>Name</span>
                        <span>Time Left</span>
                        <span>Completion</span>
                    </li>
                    {displayedInjects.map((inj) => {
                        const expired = secondsLeft <= injectDeadline[inj.id];
                        let rowClass = "injectRow";
                        if (expired){
                            rowClass += submittedInjects[inj.id] ? " injectComplete" : " injectFailed";
                        }
                        return (
                            <li key={inj.id} className={rowClass}>
                                <span
                                    onClick={() => window.open(inj.file, "_blank")}
                                    className="injectLink"
                                >
                                    {inj.name}
                                </span>
                                <span className="injectTimer">
                                    {expired ? "Time Up" : `${formatTime(secondsLeft - injectDeadline[inj.id])}`}
                                </span>
                                <input
                                    type="checkbox"
                                    className="injectCheckbox"
                                    checked={!!submittedInjects[inj.id]}
                                    disabled={expired}
                                    onChange={(e) => handleCheckbox(inj.id, e.target.checked)}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}