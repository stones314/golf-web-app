import { useState, useEffect } from "react";
import { SERVER } from "./helper/Consts";
import PlayGolf from "./PlayingGolf";
import './App.css';

const LOADING = 0
const SHOW_MENU = 1
const ADD_OTHERS = 2
const PLAY_GOLF = 3

function StartRound(props) {
    //    const cookies = new Cookies();

    const [pageState, setPageState] = useState(LOADING);
    const [playerOpts, setPlayerOpts] = useState([]);
    const [playerSel, setPlayerSel] = useState([]);
    const [courseOpts, setCourseOpts] = useState([]);
    const [courseSel, setCourseSel] = useState(0);
    const [teeSel, setTeeSel] = useState(0);
    const [holeSel, setHoleSel] = useState(1);
    const [round, setRound] = useState(-1);

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        fetch(SERVER + "/load-new-round", {
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
        if(data.user_state.in_round < 0){
            setPlayerOpts(data.users);
            setCourseOpts(data.courses);
            setPageState(SHOW_MENU);
            return;
        }

        setRound(data.user_state.in_round);
        setPageState(PLAY_GOLF);
    }

    function createNewRound() {
        var unames = [props.user.name]
        playerSel.forEach(id => {
            unames.push(playerOpts[id].name);
        })
        fetch(SERVER + "/create-new-round", {
            method: 'POST',
            body: JSON.stringify({
                users: unames,
                course: courseOpts[courseSel].name,
                tee: teeSel,
                hole: holeSel
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onRoundCreated(data));
    }

    function onRoundCreated(data) {
        setRound(data.round);
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
                    className={"f1 brd cp" + sel}
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

        const h_opts = [1, 9];
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

    function renderPlayerOpts() {
        var p_btns = [];
        for (const [i, p] of playerOpts.entries()) {
            const sel = playerSel.includes(i) ? " sel" : "";
            const in_game = p.in_round < 0 ? "ledig" : "optatt";
            p_btns.push(
                <div
                    key={i}
                    className={"f1 brd cp" + sel}
                    onClick={() => {
                        var nps = playerSel.concat();
                        if (sel === " sel") nps.splice(nps.indexOf(i), 1);
                        else nps.push(i);
                        setPlayerSel(nps);
                    }}>
                    {p.name} <br /> {in_game}
                </div>
            )
        }
        return (
            <div className="mtb2">
                Inviter andre:
                <div className="">
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
                <div className="mtb2 cp brd" onClick={() => onClickPlay()}>
                    Start
                </div>
                <div className="center cp brd" onClick={() => onClickShowMenu()}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === PLAY_GOLF) {
        return (
            <div className="">
                <PlayGolf
                    round={round}
                    user={props.user}
                />
            </div>
        )
    }

    return (
        <div className="">
            {renderCourseOpts()}
            {renderTeeOpts()}
            {renderHoleOpts()}
            <div className="mtb2 cp brd" onClick={() => setPageState(ADD_OTHERS)}>
                Neste
            </div>
        </div>
    );
}

export default StartRound;
