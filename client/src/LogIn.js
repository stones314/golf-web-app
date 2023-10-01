import { useState, useEffect } from "react";
import { SERVER, getDistM } from "./helper/Consts";
import StringInput from "./helper/StringInput";
import Cookies from "universal-cookie";
import UserMain from "./UserMain";
import StartMatch from "./match/StartMatch";
import StartSim from "./simulator/StartSim";
import './App.css';

const LOADING = 0
const ENTER_CREDENTIALS = 1;
const LOGGED_IN = 2;
const MATCH = 3;

function LogIn() {
  const cookies = new Cookies();

  const [pageState, setPageState] = useState(LOADING);
  const [name, setName] = useState(cookies.get("golf_User") ? cookies.get("golf_User") : "");
  const [pwd, setPwd] = useState(cookies.get("golf_Pwd") ? cookies.get("golf_Pwd") : "");
  const [nErr, setNerr] = useState("");
  const [pErr, setPerr] = useState("");
  const [test, setTest] = useState("");
  const [userData, setUserData] = useState(null);
  const [pos, setPos] = useState({
    lat: 0,
    long: 0,
    acc: 0,
    dist : 0
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    var old_session = cookies.get("golf_Type") ? cookies.get("golf_Type") : "";
    var session = LOGGED_IN;
    if (old_session === "match") session = MATCH;
    
    if (name !== "" && pwd !== "")
      onClickLogin(session);
    else
      setPageState(ENTER_CREDENTIALS);
  }, []);

  function onNameChange(newValue) {
    if (newValue.length > 10) return;
    setName(newValue);
  }

  function onPwdChange(newValue) {
    setPwd(newValue);
  }

  function onClickLogin(to_state) {
    if (name === "") {
      setNerr("Skriv inn navn");
      setPerr("");
      return;
    }
    fetch(SERVER + "/log-in", {
      method: 'POST',
      body: JSON.stringify({
        user: name.trim(),
        pwd: pwd
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then((data) => onResponse(data, to_state));
  }

  function onClickLogout() {
    cookies.set("golf_User", "", { path: "/" });
    cookies.set("golf_Pwd", "", { path: "/" });
    cookies.set("golf_Type", "", { path: "/" });
    setName("");
    setPwd("");
    setUserData(null);
    setPageState(ENTER_CREDENTIALS);
  }

  function onResponse(data, to_state) {
    if (data.ok === 0) {
      const session = to_state === MATCH ? "match" : "stats";
      cookies.set("golf_User", name, { path: "/" });
      cookies.set("golf_Pwd", pwd, { path: "/" });
      cookies.set("golf_Type", session, { path: "/" });
      setNerr("");
      setPerr("");
      setUserData(data.user);
      setPageState(to_state);
      return;
    }

    if (pageState === LOADING) {
      cookies.set("golf_User", "", { path: "/" });
      cookies.set("golf_Pwd", "", { path: "/" });
      cookies.set("golf_Type", "", { path: "/" });
      setPageState(ENTER_CREDENTIALS);
      return;
    }

    if (data.ok === 1) {
      setNerr("Ukjent brukernavn!");
      setPerr("");
    }
    else if (data.ok === 2) {
      setNerr("");
      setPerr("Feil passord!");
    }
  }

  function renderLogIn() {
    return (
      <div className="narrow center trans-mid">
        <h3>{"Log På"}</h3>
        <div className={"narrow"}>
          <div className="mtb2">{"Kontakt Steinar for å lage bruker!"}</div>
          <StringInput
            description={"Navn:"}
            type="text"
            editVal={name}
            errorMsg={nErr}
            onChange={(newValue) => onNameChange(newValue)}
            onEnterDown={(e) => { e.preventDefault(); onClickLogin(LOGGED_IN) }}
          />
          <StringInput
            type="password"
            description={"Passord:"}
            editVal={pwd.toString()}
            errorMsg={pErr}
            onChange={(newValue) => onPwdChange(newValue)}
            onEnterDown={(e) => { e.preventDefault(); onClickLogin(LOGGED_IN) }}
          />
        </div>
        <div className="row mtb2">
          <div className="trans-mid cp brd" onClick={() => onClickLogin(LOGGED_IN)}>
            Logg På
          </div>
        </div>
        <div className="row mtb2">
          <div className="trans-mid cp brd" onClick={() => onClickLogin(MATCH)}>
            Spill Simulator
          </div>
        </div>
        <div className="row mtb2">
          <div className="trans-mid cp brd" onClick={onClickLogPos}>
            Pos?
          </div>
        </div>
        {renderLastPos()}
        {renderTest()}
      </div>
    )
  }


  function onClickLogPos() {
    setPageState(LOADING);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onPosFetched, showError);
    } else {
      setErr("Geolocation is not supported by this browser.");
    }
  }

  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setErr("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        setErr("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        setErr("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        setErr("An unknown error occurred.")
        break;
    }
  }

  function onPosFetched(p) {
    const my_pos = {
      lat: p.coords.latitude,
      long: p.coords.longitude,
      acc: p.coords.accuracy,
      dist: 0
    }
    if(pos.lat !== 0)
      my_pos.dist = getDistM(pos.lat, pos.long, my_pos.lat, my_pos.long);

    setPos(my_pos);
    setErr("");
    setPageState(ENTER_CREDENTIALS);
  }

  function renderLastPos() {
    if (pos.lat === 0.0) return;
    if (err !== "")
      return (
        <div className="mtb2">
          Pos Err: <br />{err}
        </div>
      )
    return (
      <div className="mtb2">
        Pos: <br />{pos.lat.toFixed(2)}/{pos.long.toFixed(2)} +/- {pos.acc.toFixed(2)}m, dist from last: {pos.dist.toFixed(2)}m
      </div>
    )
  }


  function onClickTest() {
    setPageState(LOADING);
    fetch("/rsh/store-data", {
      method: 'POST',
      body: JSON.stringify({
        id: "test",
        pwd: "TEST",
        data: 1234
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then((data) => onTestRes(data));
  }

  function onTestRes(data) {
    setTest(data.ok.toString());
    setPageState(ENTER_CREDENTIALS);
  }

  function renderTest() {
    return (
      <div className="mtb2">
        <div className="row mtb2">
          <div className="trans-mid cp brd" onClick={onClickTest}>
            Test
          </div>
        </div>
        {test}
      </div>
    )
  }


  if (pageState === LOADING) {
    return (
      <div className="narrow center trans-mid">
        ... LASTER ...
      </div>
    )
  }

  if (pageState === ENTER_CREDENTIALS) {
    return (
      renderLogIn()
    )
  }

  if (pageState === MATCH) {
    return (
      <div className="narrow col center trans-mid">
      <div className="narrow row center">
        <div>Logget inn som <b>{name}</b></div>
        <div className="cp brd mlr3" onClick={onClickLogout}>Logg ut</div>
      </div>
      <StartSim
        user={userData}
        onExit={() => setPageState(ENTER_CREDENTIALS)}
      />

    </div>
    )
  }

  return (
    <div className="narrow col center trans-mid">
      <div className="narrow row center">
        <div>Logget inn som <b>{name}</b></div>
        <div className="cp brd mlr3" onClick={onClickLogout}>Logg ut</div>
      </div>
      <UserMain
        user={userData}
      />

    </div>
  );
}

export default LogIn;
