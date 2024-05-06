import { useState, useEffect } from "react";
import { SERVER, IMG } from "./../helper/Consts";
import './../App.css';

const LOADING = 0
const PLAYING = 1

function PlaySim(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [simState, setSimState] = useState({});
    const [regShot, setRegShot] = useState("");

    useEffect(() => {
        loadSimData();
    }, []);

    function loadSimData() {
        fetch(SERVER + "/load-sim", {
            method: 'POST',
            body: JSON.stringify({
                test: true
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onSimDataLoaded(data));
    }

    function addShot(player, shot_data) {
        setPageState(LOADING);
        setRegShot("");
        fetch(SERVER + "/add-sim-shot", {
            method: 'POST',
            body: JSON.stringify({
                player: player,
                shot_data: shot_data
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onSimDataLoaded(data));
    }

    function onSimDataLoaded(data) {
        setSimState(data.sim_state);
        // if (data.sim_state.hole <= 18) {
        //     var hs = [];
        //     for (const [i, p] of data.sim_state.players.entries()) {
        //         hs.push(data.sim_state.score_card[data.sim_state.hole - 1].par);
        //     }
        //     setHoleShots(hs);
        // }
        setPageState(PLAYING);
    }

    /*
     * Req data:
     * 
     * Res data:
     *  ok: ok
     */
    function EndSim() {
        fetch(SERVER + "/end-sim", {
            method: 'POST',
            body: JSON.stringify({
                end: true
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => props.onFinish());
    }

    function renderScoreCard() {

        var shot_sum = []
        var header = [];
        const FP = "f2";
        for (const [i, s] of simState.score_cards.entries()) {
            header.push(
                <div className={FP + " col brd-left"} key={i}>
                    <div className="f1"><b>{s.player}</b></div>
                    <div className={"f1 row"} key={i}>
                        <div className="f1">
                            <b>S</b>
                        </div>
                        <div className="f1">
                            <b>P</b>
                        </div>
                    </div>
                </div>
            );
            shot_sum.push(0);
        }

        var holes = [];
        holes.push(
            <div className="row brd-btm" key={-1}>
                <div className="f1">
                    <b>Hull</b>
                </div>
                {header}
            </div>
        )
        for (var h = 0; h < simState.hole; h++) {
            var scores = [];
            const H = h + 1;
            for (const [i, s] of simState.score_cards.entries()) {
                scores.push(
                    <div className={FP + " row brd-left"} key={i}>
                        <div className="f1">
                            {s.holes[h].shots.length}
                        </div>
                        <div className="f1">
                            {s.holes[h].points}
                        </div>
                    </div>
                );
                shot_sum[i] += s.holes[h].shots.length;
            }
            const brd = simState.hole === H ? " sel" : ""
            holes.push(
                <div className={"row" + brd} key={h}>
                    <div className="f1">
                        <b>{H}</b>
                    </div>
                    {scores}
                </div>
            )
        }

        var add = [];
        for (const [i, s] of simState.score_cards.entries()) {
            function renderAddBtn() {
                if (s.holes.length === simState.hole) {
                    return (
                        <div className={FP + " brd-left center cp"} onClick={() => setRegShot(s.player)}>
                            <img className="icon mtb2" src={IMG["pluss"]} alt="pluss" />
                        </div>
                    )
                }
                return (
                    <div className={FP  + " brd-left"}>

                    </div>
                )
            }
            add.push(renderAddBtn());
        }
        holes.push(
            <div className="row brd-btm" key={100}>
                <div className="f1">

                </div>
                {add}
            </div>
        )

        var summary = [];
        for (const [i, s] of simState.score_cards.entries()) {
            summary.push(
                <div className={FP + " row brd-left"} key={i}>
                    <div className="f1">
                        <b>{shot_sum[i]}</b>
                    </div>
                    <div className="f1">
                        <b>{s.points}</b>
                    </div>
                </div>
            );
        }
        holes.push(
            <div className="row" key={101}>
                <div className="f1">
                    <b>Sum</b>
                </div>
                {summary}
            </div>
        )

        return (
            <div className="mtop1">
                {holes}
            </div>
        )

    }

    function renderPlayerData(index, score_card) {
        const hole = score_card.holes.length;
        const shot = score_card.holes[hole - 1].shots.length + 1
        var lie = shot === 1 ? "Tee" : score_card.holes[hole - 1].shots[shot - 2].land_at;

        function renderAddBtn() {
            if (hole === simState.hole) {
                return (
                    <div className="f1 cp" onClick={() => setRegShot(score_card.player)}>
                        <img className="icon" src={IMG["pluss"]} alt="pluss" />
                    </div>
                )
            }
            return (
                <div className="f1">

                </div>
            )
        }

        return (
            <div className="row" key={index}>
                <div className="f2"></div>
                <div className="f3 txt-left">{score_card.player}</div>
                {renderAddBtn()}
                <div className="f2"></div>
            </div>
        )
    }

    function renderSimState() {
        var player_view = [];
        for (const [i, s] of simState.score_cards.entries()) {
            player_view.push(renderPlayerData(i, s));
        }
        return (
            <div className="narrow mtop1">
                <b>Registrer Slag:</b>
                {player_view}
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

    if (regShot !== "") {
        const LIES = [
            "Tee",
            "Fairway",
            "Rough",
            "Green",
            "Hole",
            "Bunker",
            "Woods",
            "Rocks",
            "Hazard",
            "OB",
        ]
        var lie_opt_row = []
        for (const [i, lie] of LIES.entries()) {
            lie_opt_row.push(
                <div className="brd cp" key={i} onClick={() => addShot(regShot, { land_at: lie })}>
                    {lie}
                </div>
            )
        }
        lie_opt_row.push(
            <div className="brd cp mtop1" key={lie_opt_row.length + 3} onClick={() => setRegShot("")}>
                Lukk
            </div>
        )

        return (
            <div className="center">
                <div className="mtop1">Registrer slag for {regShot}?</div>
                <div>Hvor landet ballen?</div>
                {lie_opt_row}
            </div>
        )
    }

    return (
        <div className="narrow col">
            {renderScoreCard()}
            <div className="col center">
            <div className="center cp brd mtop1 wfit" onClick={() => EndSim()}>
                Avslutt
            </div>
            </div>
        </div>
    );
}

export default PlaySim;
