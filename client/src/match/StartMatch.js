import { useState, useEffect } from "react";
import { SERVER, IMG } from "./../helper/Consts";
import PlayMatch from "./PlayMatch";
import './../App.css';

const LOADING = 0
const SHOW_MENU = 1
const ADD_OTHERS = 2
const EDIT_HCP = 3
const PLAY_GOLF = 4

function StartMatch(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [playerOpts, setPlayerOpts] = useState([]);
    const [playerSel, setPlayerSel] = useState([]);
    const [courseOpts, setCourseOpts] = useState([]);
    const [courseSel, setCourseSel] = useState(0);
    const [userHcp, setUserHcp] = useState(props.user.hcp);
    const [teeSel, setTeeSel] = useState(0);
    const [holeSel, setHoleSel] = useState(1);
    const [round, setRound] = useState(-1);
    const [match, setMatch] = useState({hole: 0});

    useEffect(() => {
        loadMatchData();
    }, []);

    function loadMatchData() {
        fetch(SERVER + "/load-match", {
            method: 'POST',
            body: JSON.stringify({
                test: true
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onMatchDataLoaded(data));
    }

    function onMatchDataLoaded(data) {
        setMatch(data.match_state);
        if(data.match_state.hole < 1)
            loadPlayerCourseData();
        else
            setPageState(PLAY_GOLF);
    }

    function loadPlayerCourseData() {
        fetch(SERVER + "/load-course-players", {
            method: 'POST',
            body: JSON.stringify({
                user: props.user.name
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onDataLoaded(data));
    }

    function onDataLoaded(data) {
        setPlayerOpts(data.users);
        setCourseOpts(data.courses);

        if(match.hole < 1){
            setPageState(SHOW_MENU);
        }
        else{
            setPageState(PLAY_GOLF);
        }
    }

    function createNewRound() {
        var players = [{
            name: props.user.name,
            hcp: userHcp
        }]
        playerSel.forEach(id => {
            players.push({
                name: playerOpts[id].name,
                hcp: playerOpts[id].hcp
            });
        })
        fetch(SERVER + "/start-match", {
            method: 'POST',
            body: JSON.stringify({
                players: players,
                course: courseOpts[courseSel].name,
                tee_id: teeSel,
                length: 18,
                start_at: holeSel
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onRoundCreated(data));
    }

    function onRoundCreated(data) {
        setRound(data.match_state);
        setPageState(PLAY_GOLF);
    }

    function onClickShowMenu() {
        setPageState(SHOW_MENU);
    }

    function onClickPlay() {
        createNewRound();
    }

    function renderCourseOpts() {
        var c_btns = [];
        for (const [i, c] of courseOpts.entries()) {
            const sel = courseSel === i ? " sel" : ""
            c_btns.push(
                <div
                    key={i}
                    className={"mlr3 f1 brd cp" + sel}
                    onClick={() => {
                        if (courseSel === i) return;
                        setCourseSel(i);
                        setTeeSel(0);
                        setHoleSel(1);
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

    function renderTeeOpts() {
        if(courseOpts.length === 0) return null;
        var t_btns = [];
        for (const [i, t] of courseOpts[courseSel].tees.entries()) {
            var dist = 0;
            courseOpts[courseSel].holes.forEach(hole => {
                dist += hole.length[i];
            });
            const sel = teeSel === i ? " sel" : ""
            t_btns.push(
                <div
                    key={i}
                    className={"f1 brd mlr3 cp" + sel}
                    onClick={() => setTeeSel(i)}>
                    {t} <br /> {dist}
                </div>
            )
        }
        return (
            <div className="mtb2">
                Tee:
                <div className="row">
                    {t_btns}
                </div>
            </div>
        )
    }

    function renderHoleOpts() {
        if (courseOpts[courseSel].holes.length <= 9) return;

        const h_opts = [1, 10];
        var h_btns = [];

        for (const [i, h] of h_opts.entries()) {
            const sel = holeSel === h ? " sel" : ""
            h_btns.push(
                <div
                    key={i}
                    className={"f1 brd mlr3 cp" + sel}
                    onClick={() => setHoleSel(h)}>
                    {h}
                </div>
            )
        }
        return (
            <div className="mtb2">
                Start fra hull:
                <div className="row">
                    {h_btns}
                </div>
            </div>
        )
    }

    function onHcpPluss(p_id) {
        if (p_id < 0) {
            setUserHcp(userHcp+0.1);
            return;
        }
        var po = playerOpts.concat();
        po[p_id].hcp = Number(po[p_id].hcp) + 0.1;
        setPlayerOpts(po);
    }

    function onHcpMinus(p_id) {
        if (p_id < 0) {
            if (userHcp <= 0) return;
            setUserHcp(userHcp-0.1);
            return;
        }
        if (playerOpts[p_id].hcp <= 0.0) return;
        var po = playerOpts.concat();
        po[p_id].hcp = Number(po[p_id].hcp) - 0.1;
        setPlayerOpts(po);
    }

    function editPlayerHcp(i) {
        return (
            <div className='row f1'>
                <div className='f1 cp' onClick={() => onHcpMinus(i)}>
                    <img className="icon" src={IMG["minus"]} alt="minus" />
                </div>
                <div className='f1 sqr cp'>
                    {i<0? userHcp.toFixed(1) : playerOpts[i].hcp.toFixed(1)}
                </div>
                <div className='f1 cp' onClick={() => onHcpPluss(i)}>
                    <img className="icon" src={IMG["pluss"]} alt="pluss" />
                </div>
            </div>
        )
    }

    function renderEditHcp() {
        var p_btns = [];
        p_btns.push(
            <div key={-1} className="row mtb2">
            <div className="f1"> {props.user.name} </div>
            { editPlayerHcp(-1) }
            </div>
        )
        for (const [i, p] of playerOpts.entries()) {
            p_btns.push(
                <div key={i} className="row mtb2">
                <div className="f1"> {p.name} </div>
                { editPlayerHcp(i) }
                </div>
            )
        }
        return (
            <div className="mtb2">
                Edit Hcp:
                <div className="narrow center">
                    {p_btns}
                </div>
            </div>
        )
    }

    function renderPlayerOpts() {
        var p_btns = [];
        for (const [i, p] of playerOpts.entries()) {
            const sel = playerSel.includes(i) ? " sel" : "";
            p_btns.push(
                <div
                    key={i}
                    className={"f1 mtb2 brd cp" + sel}
                    onClick={() => {
                        var nps = playerSel.concat();
                        if (sel === " sel") nps.splice(nps.indexOf(i), 1);
                        else nps.push(i);
                        setPlayerSel(nps);
                    }}>
                    {p.name}
                </div>
            )
        }
        return (
            <div className="mtb2">
                Inviter andre:
                <div className="narrow center">
                    {p_btns}
                </div>
            </div>
        )
    }

    if (pageState === LOADING) {
        return (
            <div className="narrow center">
                ... LASTER ...
            </div>
        )
    }

    if (pageState === ADD_OTHERS) {
        return (
            <div className="">
                {renderPlayerOpts()}
                <div className="mtb2 cp brd" onClick={() => setPageState(EDIT_HCP)}>
                    Neste
                </div>
                <div className="center cp brd" onClick={() => onClickShowMenu()}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === EDIT_HCP) {
        return (
            <div className="">
                {renderEditHcp()}
                <div className="mtb2 cp brd" onClick={() => onClickPlay()}>
                    Start
                </div>
                <div className="center cp brd" onClick={() => setPageState(ADD_OTHERS)}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === PLAY_GOLF) {
        return (
            <div className="">
                <PlayMatch
                    onFinish={onClickShowMenu}
                />
            </div>
        )
    }

    return (
        <div className="">
            <h3>Spill Match!</h3>
            {renderCourseOpts()}
            {renderTeeOpts()}
            {renderHoleOpts()}
            <div className="mtb2 cp brd" onClick={() => setPageState(ADD_OTHERS)}>
                Neste
            </div>
        </div>
    );
}

export default StartMatch;
