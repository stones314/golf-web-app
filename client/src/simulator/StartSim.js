import { useState, useEffect } from "react";
import { SERVER } from "./../helper/Consts";
import PlaySim from "./PlaySim";
import './../App.css';

const LOADING = 0
const SHOW_MENU = 1
const PLAY_GOLF = 2

function StartSim(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [playerOpts, setPlayerOpts] = useState([]);
    const [playerSel, setPlayerSel] = useState([]);
    const [holeSel, setHoleSel] = useState(1);
    const [gameState, setGameState] = useState({ score_cards : [] });

    useEffect(() => {
        loadSimData()
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

    function onSimDataLoaded(data) {
        setGameState(data.sim_state);
        if (data.sim_state.score_cards.length === 0)
            loadPlayerData();
        else
            setPageState(PLAY_GOLF);
    }

    function loadPlayerData() {
        fetch(SERVER + "/load-players", {
            method: 'POST',
            body: JSON.stringify({
                user: props.user.name
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onPlayersLoaded(data));
    }

    function onPlayersLoaded(data) {
        setPlayerOpts(data.users);

        if (gameState.score_cards.length === 0) {
            setPageState(SHOW_MENU);
        }
        else {
            setPageState(PLAY_GOLF);
        }
    }

    function createNewRound() {
        var players = [{
            name: props.user.name,
            hcp: 0 //TODO
        }]
        playerSel.forEach(id => {
            players.push({
                name: playerOpts[id].name,
                hcp: 0 //TODO
            });
        })
        fetch(SERVER + "/start-sim", {
            method: 'POST',
            body: JSON.stringify({
                players: players,
                length: 18,
            }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.json())
            .then((data) => onRoundCreated(data));
    }

    function onRoundCreated(data) {
        setGameState(data.sim_state);
        setPageState(PLAY_GOLF);
    }

    function onClickShowMenu() {
        setPageState(SHOW_MENU);
    }

    function onClickPlay() {
        createNewRound();
    }

    function renderPlayerOpts() {
        var p_btns = [];
        for (const [i, p] of playerOpts.entries()) {
            const sel = playerSel.includes(i) ? " sel" : "";
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
                    {p.name}
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

    if (pageState === PLAY_GOLF) {
        return (
            <div className="">
                <PlaySim
                    onFinish={onClickShowMenu}
                />
            </div>
        )
    }

    return (
        <div className="">
            <h3>Simulator!</h3>
            {renderPlayerOpts()}
            <div className="mtb2 cp brd" onClick={() => onClickPlay()}>
                Start
            </div>
            <div className="center cp brd" onClick={() => onClickShowMenu()}>
                Tilbake
            </div>
        </div>
    );
}

export default StartSim;
