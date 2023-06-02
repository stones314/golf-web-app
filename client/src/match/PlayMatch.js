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
                <div className='row mtb2 f6'>

                </div>
            )
        }
        return (
            <div className='row mtb2 f5'>
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

    function renderPoints(points) {
        if (points === 0) {
            return (<div className="small-txt f1"></div>)
        }
        return (
            <div className="small-txt f1">{points}p</div>
        )
    }

    function renderShotsUsed(used, given, won, points) {
        return (
            <div className={"row center f2"}>
                <div className="f1"></div>
                <div className="small-txt f1">{given}</div>
                <div className={"f1" + won}>{used}</div>
                {renderPoints(points)}
                <div className="f1"></div>
            </div>
        )
    }

    function renderHoleStatus(hole_data, hole_no) {
        var sel = match.hole === hole_no ? " brd" : "";
        var given = [];
        var used = [];
        for (const [i, p] of hole_data.shots.entries()) {
            const won = p.won === 1 ? " sel" : "";
            const u_txt = p.used > 0 ? p.used.toString() : "-";
            used.push(
                renderShotsUsed(u_txt, p.given, won, p.points)
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
                {used}
            </div>
        )
    }

    function renderShotSummary(shot_sum, given_sum, points_sum, id) {
        var name = "Total";
        if (id === 19) name = "Front";
        else if (id === 20) name = "Back";
        return (
            <div
                key={id} className={"row f1"}>
                <div className="f1">{name}</div>
                <div className="f1">{shot_sum.par}</div>
                <div className="f1"></div>
                {renderShotsUsed(shot_sum.sn, given_sum.sn, "", points_sum.sn)}
                {renderShotsUsed(shot_sum.shø, given_sum.shø, "", points_sum.shø)}
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
    *        used  how many shots the player used (-1 => not yet played this hole)
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
                <div className="f2">SN</div>
                <div className="f2">SHØ</div>
            </div>
        )
        //Sum: three arrays, first nine, last nine and all 18
        //     each array has three numbers, index 0 = SN, 1 = SHØ, 2 = course par
        //var sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        var shot_sum = { front: { sn: 0, shø: 0, par: 0 }, back: { sn: 0, shø: 0, par: 0 }, total: { sn: 0, shø: 0, par: 0 } };
        var given_sum = { front: { sn: 0, shø: 0 }, back: { sn: 0, shø: 0 }, total: { sn: 0, shø: 0, par: 0 } };
        var point_sum = { front: { sn: 0, shø: 0 }, back: { sn: 0, shø: 0 }, total: { sn: 0, shø: 0, par: 0 } };
        for (const [i, s] of match.score_card.entries()) {
            scores.push(
                renderHoleStatus(s, i + 1)
            )
            const fb = s.hole < 10 ? "front" : "back";
            shot_sum[fb].par += s.par;
            for (const [i, p] of match.players.entries()) {
                const p_name = i === 0 ? "sn" : "shø";
                if (s.shots[i].used > 0)
                    shot_sum[fb][p_name] += s.shots[i].used;
                given_sum[fb][p_name] += s.shots[i].given;
                point_sum[fb][p_name] += s.shots[i].points;
            }
            if (s.hole === 9)
                scores.push(renderShotSummary(shot_sum.front, given_sum.front, point_sum.front, 19))
        }
        scores.push(renderShotSummary(shot_sum.back, given_sum.back, point_sum.back, 20))

        for (const [i, id] of ["sn", "shø", "par"].entries()) {
            shot_sum.total[id] = shot_sum.front[id] + shot_sum.back[id];
            given_sum.total[id] = given_sum.front[id] + given_sum.back[id];
            point_sum.total[id] = point_sum.front[id] + point_sum.back[id];
        }
        scores.push(renderShotSummary(shot_sum.total, given_sum.total, point_sum.total, 21))
        return (
            <div className="narrow mtb2">
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
