import { useState, useEffect } from "react";
import { SERVER } from "./helper/Consts";
import PlayGolf from "./PlayingGolf";
import './App.css';

const LOADING = 0
const SELECT_COURSE = 1
const EDIT_COURSE = 2

function EditCourse(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [courseOpts, setCourseOpts] = useState([]);
    const [courseSel, setCourseSel] = useState(0);
    const [editState, setEditState] = useState({
        course: "",
        logged_pos: 0,
        wanted_pos: 0,
        next_pos: ""
    });
    const [lastPos, setLastPos] = useState({
        lat: 0.0,
        long: 0.0,
        acc: 0.0
    });
    const [err, setErr] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        fetch(SERVER + "/load-ce", {
            method: 'POST',
            body: JSON.stringify({
                test: "test"
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onDataLoaded(data));
    }

    function onDataLoaded(data) {
        if (data.ce_state.course === "") {
            setCourseOpts(data.courses);
            setPageState(SELECT_COURSE);
            return;
        }
        StartEdit(data.ce_state);
    }

    function onClickStartEdit() {
        setPageState(LOADING);
        fetch(SERVER + "/start-ce", {
            method: 'POST',
            body: JSON.stringify({
                course: courseOpts[courseSel].name
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => StartEdit(data.ce_state));
    }

    function StartEdit(ce_state) {
        setEditState(ce_state);
        setPageState(EDIT_COURSE);
    }

    function onClickLogPos() {
        setPageState(LOADING);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onPosFetched, showError);
        } else {
            setErr("Geolocation is not supported by this browser.");
        }
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setErr("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                setErr("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                setErr("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                setErr("An unknown error occurred.")
                break;
        }
    }

    function onPosFetched(pos) {
        const my_pos = {
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
            acc: pos.coords.accuracy,
        }
        setLastPos(my_pos);
        fetch(SERVER + "/log-ce-pos", {
            method: 'POST',
            body: JSON.stringify({
                pos: my_pos
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => StartEdit(data.ce_state));
    }

    function StartEdit(ce_state) {
        setEditState(ce_state);
        setErr("");
        setPageState(EDIT_COURSE);
    }


    function renderCourseOpts() {
        var c_btns = [];
        for (const [i, c] of courseOpts.entries()) {
            const sel = courseSel === i ? " sel" : ""
            c_btns.push(
                <div
                    key={i}
                    className={"f1 brd cp" + sel}
                    onClick={() => {
                        if (courseSel === i) return;
                        setCourseSel(i);
                    }}>
                    {c.name}
                </div>
            )
        }
        return (
            <div className="mtb2">
                Bane:
                <div className="row">
                    {c_btns}
                </div>
            </div>
        )
    }

    if (pageState === LOADING) {
        return (
            <div className="narrow center">
                ... LASTER ...<br />{err}
            </div>
        )
    }

    if (pageState === SELECT_COURSE) {
        return (
            <div className="">
                {renderCourseOpts()}
                <div className="mtb2 cp brd" onClick={() => onClickStartEdit()}>
                    Start
                </div>
            </div>
        )
    }

    function renderLastPos() {
        if (lastPos.lat === 0.0) return;
        return (
            <div className="mtb2">
                Forige: <br />{lastPos.lat.toFixed(2)}/{lastPos.long.toFixed(2)} +/- {lastPos.acc.toFixed(2)}m
            </div>
        )
    }

    function renderEditState() {
        if (editState.next_pos === "Ferdig!") {
            return (
                <div className="mtb2">
                    Ferdig!
                </div>
            )
        }
        return (
            <div className="">
                <div className="mtb2">
                    {editState.logged_pos + "/" + editState.wanted_pos} steder
                </div>
                {renderLastPos()}
                <div className="mtb2">
                    Neste: <br /> <b>{editState.next_pos}</b>
                </div>
                <div className="mtb2 cp brd" onClick={() => onClickLogPos()}>
                    <b>Registrer</b>
                </div>
            </div>
        )

    }

    return (
        <div className="">
            {renderEditState()}
        </div>
    );
}

export default EditCourse;
