import { useState, useEffect } from "react";
import { SERVER } from "./helper/Consts";
import './App.css';

const LOADING = 0
const READY = 1

function PlayGolf(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [course, setCourseOpts] = useState();
    const [hole, setCourseSel] = useState(1);
    const [shot, setTeeSel] = useState(0);

    useEffect(() => {
        loadRound();
    }, []);

    function loadRound() {
        fetch(SERVER + "/load-round-status", {
            method: 'POST',
            body: JSON.stringify({
                user: props.user.name,
                round: props.round,
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onRoundLoaded(data));
    }

    function onRoundLoaded(data) {
        setPageState(READY);
    }

    if (pageState === LOADING) {
        return (
            <div className="narrow center">
                ... LASTER ...
            </div>
        )
    }

    return (
        <div className="">
            Playing Golf! Round ID = {props.round}
        </div>
    );
}

export default PlayGolf;
