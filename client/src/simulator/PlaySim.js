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

    function renderPlayerData(index, score_card) {
        const hole = score_card.holes.length;
        const shot = score_card.holes[hole - 1].shots.length + 1
        var lie = shot === 1 ? "Tee" : score_card.holes[hole - 1].shots[shot - 2].land_at;

        const land_at = ["Rough", "Fairway", "Bunker", "Green", "Green", "Hole"];

        return (
            <div className="col" key={index}>
                <div>{score_card.player + ": " + score_card.points + " poeng"}</div>
                <div>{"Hole " + hole + " shot " + shot + " from " + lie}</div>
                <div className="brd cp" onClick={() => setRegShot(score_card.player)}>
                    Registrer slag
                </div>
            </div>
        )
    }

    function renderSimState() {
        var player_view = [];
        for (const [i, s] of simState.score_cards.entries()) {
            player_view.push(renderPlayerData(i, s));
        }
        return (
            <div>{player_view}</div>
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
        for(const [i,lie] of LIES.entries()){
            lie_opt_row.push(
                <div className="brd cp" key={i} onClick={() => addShot(regShot, {land_at : lie})}>
                    {lie}
                </div>
            )
        }

        return (
            <div className="center">
                <div>Hvor landet ballen?</div>
                {lie_opt_row}
            </div>
        )
    }

    return (
        <div className="">
            {renderSimState()}
        </div>
    );
}

export default PlaySim;
