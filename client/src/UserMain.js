import { useState, useEffect } from "react";
import './App.css';
import StartRound from "./StartRound";
import BagEdit from "./BagEdit";
import EditCourse from "./EditCourse";

const LOADING = 0
const SHOW_MENU = 1
const SHOW_BAG = 2
const PLAY_GOLF = 3
const SHOW_STATS = 4
const EDIT_COURSE = 5

function UserMain(props) {

    const [pageState, setPageState] = useState(SHOW_MENU);

    function onClickShowMenu() {
        setPageState(SHOW_MENU);
    }

    function onClickBag() {
        setPageState(SHOW_BAG);
    }

    function onClickPlay() {
        setPageState(PLAY_GOLF);
    }

    function onClickStats() {
        setPageState(SHOW_STATS);
    }

    function onClickEditCourse() {
        setPageState(EDIT_COURSE);
    }

    if (pageState === LOADING) {
        return (
            <div className="narrow center">
                ... LASTER ...
            </div>
        )
    }

    if (pageState === SHOW_BAG) {
        return (
            <BagEdit
                user={props.user}
                onBack={() => onClickShowMenu()}
            />
        )
    }

    if (pageState === PLAY_GOLF) {
        return (
            <div className="">
                <StartRound
                    user={props.user}
                />
                <div className="center cp brd" onClick={() => onClickShowMenu()}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === SHOW_STATS) {
        return (
            <div className="">
                Din statistikk!
                <div className="center cp brd" onClick={() => onClickShowMenu()}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === EDIT_COURSE) {
        return (
            <div className="">
                <div className="mtb2">
                    <h3>Registrer Tee og Green</h3>
                </div>
                <EditCourse/>                    
                <div className="center cp brd" onClick={() => onClickShowMenu()}>
                    Tilbake
                </div>
            </div>
        )
    }

    function renderEditCourse(){
        if(props.user.name !== "Steinar") return;

        return(
            <div className="mtb2 cp brd" onClick={() => onClickEditCourse()}>
                Posisjonering
            </div>
        )
    }

    return (
        <div className="">
            <div className="mtb2 cp brd" onClick={() => onClickBag()}>
                Golfbag
            </div>
            <div className="mtb2 cp brd" onClick={() => onClickStats()}>
                Dine Stats
            </div>
            <div className="mtb2 cp brd" onClick={() => onClickPlay()}>
                Spill Golf
            </div>
            {renderEditCourse()}
        </div>
    );
}

export default UserMain;
