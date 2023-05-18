import { useState, useEffect } from "react";
//import { SERVER } from "./helper/Consts";
//import Cookies from "universal-cookie";
import './App.css';

const LOADING = 0
const SHOW_BAG = 1
const SAVING = 2

function BagEdit(props) {
    //    const cookies = new Cookies();

    const [pageState, setPageState] = useState(SHOW_BAG);
    const [clubs, setClubs] = useState(props.user.bag);

    function onClickSave() {
        setPageState(SAVING);
    }

    if (pageState === LOADING) {
        return (
            <div className="narrow center">
                ... LASTER ...
            </div>
        )
    }

    function renderBag(){
        var bg = [];
        bg.push(
            <div key={-1} className="row">
                <div className="f1">
                    <b>Navn</b>
                </div>
                <div className="f1">
                    <b>Lengde</b>
                </div>
            </div>
        )
        for (const [i, club] of clubs.entries()) {
            bg.push(
                <div key={i} className="row">
                    <div className="f1">
                        {club.club}
                    </div>
                    <div className="f1">
                        {club.dist}m
                    </div>
                </div>
            )
        };
        return (
            <div className="">
                <div className="mtb2">Din Bag har {props.user.bag.length} køller:</div>
                {bg}
                <div className="center mtb2 cp brd" onClick={() => props.onBack()}>
                    Tilbake
                </div>
            </div>
        )
    }

    if (pageState === SAVING) {
        return (
            <div className="">
                ... LAGRER ...
            </div>
        )
    }

    return (
        <div className="">
            {renderBag()}
        </div>
    );
}

export default BagEdit;
