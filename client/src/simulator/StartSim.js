import { useState, useEffect } from "react";
import { SERVER, IMG } from "./../helper/Consts";
import PlaySim from "./PlaySim";
import './../App.css';
import StringInput from "../helper/StringInput";

const LOADING = 0
const SHOW_MENU = 1
const PLAY_GOLF = 2

function StartSim(props) {

    const [pageState, setPageState] = useState(LOADING);
    const [playerSel, setPlayerSel] = useState([]);
    const [nameAdd, setNameAdd] = useState("");
    const [naErr, setNAerr] = useState("");

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
        if (data.sim_state.score_cards.length === 0)
            setPageState(SHOW_MENU);
        else
            setPageState(PLAY_GOLF);
    }

    function createNewRound() {
        var players = [{
            name: props.user.name,
            hcp: 0 //TODO
        }]
        playerSel.forEach(name => {
            players.push({
                name: name,
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
        setPageState(PLAY_GOLF);
    }

    function onClickShowMenu() {
        setPageState(SHOW_MENU);
    }

    function onClickPlay() {
        createNewRound();
    }

    function onNameChange(newValue) {
        if (playerSel.includes(newValue) || newValue == props.user.name) {
            setNAerr("Navnet er i bruk");
        } else {
            setNAerr("");
        }
        if (newValue.length > 12) return;
        setNameAdd(newValue);
    }
    function onAddPlayer() {
        if (nameAdd === "") return;
        if (playerSel.includes(nameAdd) || nameAdd == props.user.name) {
            return;
        }
        var nps = playerSel.concat();
        nps.push(nameAdd);
        setPlayerSel(nps);
        setNameAdd("");
        setNAerr("");
    }
    function onRemovePlayer(index) {
        var nps = playerSel.concat();
        nps.splice(index, 1);
        setPlayerSel(nps);
    }
    function renderAddPlayer() {
        function showAddBtn() {
            if (naErr === "") {
                return (
                    <div className="f1 cp" onClick={() => onAddPlayer()}>
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
            <div className="row">
                <div className="f6">
                <StringInput
                    description={""}
                    type="text"
                    editVal={nameAdd}
                    errorMsg={""}
                    onChange={(newValue) => onNameChange(newValue)}
                    onEnterDown={(e) => { e.preventDefault(); onAddPlayer() }}
                />
                </div>
                {showAddBtn()}
            </div>
        )
    }

    function renderPlayerNames() {
        var players = [];
        players.push(
            <div key={-1} className="row">
                <div className="f6 txt-left">{props.user.name}</div>
                <div className='f1'>
                </div>
            </div>
        )
        for (const [i, p] of playerSel.entries()) {
            players.push(
                <div key={i} className="row">
                    <div className="f6 txt-left">{p}</div>
                    <div className='f1 cp' onClick={() => onRemovePlayer(i)}>
                        <img className="icon" src={IMG["minus"]} alt="minus" />
                    </div>
                </div>
            )
        }
        return (
            <div>
                <div>{players}</div>
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
                    onFinish={() => onClickShowMenu()}
                />
            </div>
        )
    }

    return (
        <div className="narrow col">
            <h3>Spillere</h3>
            {renderPlayerNames()}
            {renderAddPlayer()}
            <div className="mtb2 cp brd" onClick={() => onClickPlay()}>
                Start
            </div>
            <div className="center cp brd" onClick={() => props.onExit()}>
                Logg ut
            </div>
        </div>
    );
}

export default StartSim;
