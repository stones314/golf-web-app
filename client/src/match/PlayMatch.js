import { useState, useEffect } from "react";
import { SERVER, IMG } from "./../helper/Consts";
import './../App.css';

const LOADING = 0
const PLAYING = 1

function PlayMatch(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [match, setMatch] = useState({});
    const [holeShots, setHoleShots] = useState([]);
    const [saving, setSaving] = useState(false);

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
        if (data.match_state.hole <= 18) {
            var hs = [];
            for (const [i, p] of data.match_state.players.entries()) {
                hs.push(data.match_state.score_card[data.match_state.hole - 1].par);
            }
            setHoleShots(hs);
        }
        setPageState(PLAYING);
    }

    function onShotPluss(p_id) {
        var hs = holeShots.concat();
        hs[p_id] = Number(hs[p_id] + 1);
        setHoleShots(hs);
    }

    function onShotMinus(p_id) {
        if (holeShots <= 0) return;
        var hs = holeShots.concat();
        hs[p_id] = Number(hs[p_id] - 1);
        setHoleShots(hs);
    }

    function renderEditShot(i) {
        if (match.hole > 18) {
            return (
                <div className='row f6'>

                </div>
            )
        }
        return (
            <div className='row f5'>
                <div className='f1 cp' onClick={() => onShotMinus(i)}>
                    <img className="icon" src={IMG["minus"]} alt="minus" />
                </div>
                <div className='f1 sqr cp'>
                    {holeShots[i]}
                </div>
                <div className='f1 cp' onClick={() => onShotPluss(i)}>
                    <img className="icon" src={IMG["pluss"]} alt="pluss" />
                </div>
            </div>
        )
    }

    function renderRegBtn() {
        if (match.hole > 18) {
            return (
                <div className='row mtb2'>

                </div>
            )
        }
        return (
            <div className="row mtb2">
                <div className='mtb2 brd cp trans-mid' onClick={() => SendShotInfo()}>
                    Registrer
                </div>
            </div>
        )
    }

    function renderRegisterShorts() {
        if (saving) {
            return (
                <div className='mtb2'>
                    Lagrer...
                </div>
            );
        }

        const diff = match.players[0].holes_won - match.players[1].holes_won;
        var p_txt = ["   ", "   "];
        if (diff > 0) p_txt[0] = diff + "UP";
        else if (diff < 0) p_txt[1] = (-diff).toString() + "UP";
        var reg_shots = [];
        for (const [i, p] of match.players.entries()) {
            reg_shots.push(
                <div className='mid row' key={i}>
                    <div className='f2'>
                        {p_txt[i]}
                    </div>
                    <div className='f5'>
                        {p.name}
                    </div>
                    {renderEditShot(i)}
                    <div className='f1'>

                    </div>
                </div>
            )
        }
        return (
            <div className='mtb2'>
                {reg_shots}
                {renderRegBtn()}
            </div>
        );
    }

    /*
     * Req data:
     *  hole    hole number
     *  shots   array of number of shots used for each player
     * 
     * Res data:
     *  match_state  stored match state
     */
    function SendShotInfo() {
        setSaving(true);
        fetch(SERVER + "/log-match-hole", {
            method: 'POST',
            body: JSON.stringify({
                hole: match.hole,
                shots: holeShots
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onShotsSaved(data));
    }

    function onShotsSaved(data) {
        setMatch(data.match_state);
        if (data.match_state.hole <= 18) {
            var hs = [];
            for (const [i, p] of data.match_state.players.entries()) {
                hs.push(data.match_state.score_card[data.match_state.hole - 1].par);
            }
            setHoleShots(hs);
        }
        setSaving(false);
    }

    /*
     * Req data:
     * 
     * Res data:
     *  ok: ok
     */
    function EndMatch() {
        setSaving(true);
        fetch(SERVER + "/end-match", {
            method: 'POST',
            body: JSON.stringify({
                end: true
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => props.onFinish());
    }

    function renderHoleStatus(hole_data, hole_no) {
        var sel = match.hole === hole_no ? " brd" : "";
        var given = [];
        var used = [];
        for (const [i, p] of hole_data.shots.entries()) {
            given.push(
                <div className="f1" key={i}>{p.given}</div>
            )
            const won = p.won === 1 ? " sel" : "";
            const u = hole_no < match.hole ? p.used.toString() : "-";
            used.push(
                <div className={"f1" + won} key={i}>{u}</div>
            )
        }

        return (
            <div
                key={hole_no}
                className={"row f1" + sel}
            >
                <div className="f1">{hole_data.hole}</div>
                <div className="f1">{hole_data.par}</div>
                <div className="f1">{hole_data.hcp}</div>
                {given}
                {used}
            </div>
        )
    }

    /*
    *  match_state   initial match state object with
    *    hole        current hole
    *    course      course selected
    *    length      number of holes to go
    *    tee_id      index of tee to use
    *    players     array of player objects, with:
    *      name      name of player
    *      hcp       hcp in match
    *      shots_given how many shots gained
    *      holes_won number of holes won
    *    score_card  array with data about score and course
    *      hole    hole number
    *      par     par for hole
    *      hcp     hcp index for hole
    *      shots   array of shot data for each player
    *        used  how many shots the player used (-1 => not yet played this hole, -2 conceded hole)
    *        given how many shots player was given on hole
    *        won   0 => player did not have best score, 1 => this player had best score
    */
    function renderMatchState() {
        const diff = match.players[0].holes_won - match.players[1].holes_won;
        var p_txt = ["", ""];
        if (diff > 0) p_txt[0] = diff + " UP";
        else if (diff < 0) p_txt[1] = (-diff).toString() + " UP";
        var p_data = [];
        for (const [i, p] of match.players.entries()) {
            p_data.push(
                <div key={i} className={"row f1"}>
                    <div className={"f1"}>{p.name}</div>
                    <div className={"f1"}>{p_txt[i]}</div>
                </div>
            )
        }
        var scores = [];
        scores.push(
            <div
                key={-1}
                className={"row f1"}
            >
                <div className="f1">Hull</div>
                <div className="f1">Par</div>
                <div className="f1">Hcp</div>
                <div className="f1">SN gitt</div>
                <div className="f1">SHØ gitt</div>
                <div className="f1">SN slag</div>
                <div className="f1">SHØ slag</div>
            </div>
        )
        var sum = [0, 0, 0];
        for (const [i, s] of match.score_card.entries()) {
            scores.push(
                renderHoleStatus(s, i + 1)
            )
            sum[2] += s.par;
            for (const [i, p] of match.players.entries()) {
                if (s.shots[i].used > 0)
                    sum[i] += s.shots[i].used;
            }
        }
        scores.push(
            <div
                key={19}
                className={"row f1"}
            >
                <div className="f1"></div>
                <div className="f1">{sum[2]}</div>
                <div className="f1"></div>
                <div className="f1"></div>
                <div className="f1"></div>
                <div className="f1">{sum[0]}</div>
                <div className="f1">{sum[1]}</div>
            </div>
        )
        return (
            <div className="mtb2">
                <div className="mtb2">
                    {match.course}
                </div>
                <div className="mtb2">
                    Hull {match.hole}
                </div>
                {renderRegisterShorts()}
                <div className="col">
                    {scores}
                </div>
                <div className="row mtb2">
                    <div className='mtb2 brd cp trans-mid' onClick={() => EndMatch()}>
                        Avslutt
                    </div>
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

    return (
        <div className="">
            {renderMatchState()}
        </div>
    );
}

export default PlayMatch;
