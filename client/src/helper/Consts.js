export const images = {
    "host" : "https://rygg-gaard.no/quiz/img/HostBtn.png",
    "join" : "https://rygg-gaard.no/quiz/img/JoinBtn.png",
    "back" : "https://rygg-gaard.no/quiz/img/BackBtn.png",
    "moveup" : "https://rygg-gaard.no/quiz/img/UpBtn.png",
    "save" : "https://rygg-gaard.no/quiz/img/SaveBtn.png",
    "add" : "https://rygg-gaard.no/quiz/img/AddBtn.png",
    "minus" : "https://rygg-gaard.no/quiz/img/MinusBtn.png",
    "edit" : "https://rygg-gaard.no/quiz/img/EditBtn.png",
    "del" : "https://rygg-gaard.no/quiz/img/DeleteBtn.png",
    "play" : "https://rygg-gaard.no/quiz/img/PlayBtn.png",
    "bet1" : "https://rygg-gaard.no/quiz/img/Bet1Btn.png",
    "bet-1" : "https://rygg-gaard.no/quiz/img/Undo1Btn.png",
    "riclient" : "https://rygg-gaard.no/quiz/img/RangeIndicatorClient.png",
    "rihost" : "https://rygg-gaard.no/quiz/img/RangeIndicatorHost.png",
    "wait" : "https://rygg-gaard.no/quiz/img/Coin.png",
    "coin" : "https://rygg-gaard.no/quiz/img/Coin.png",
    "coinfffac8" : "https://rygg-gaard.no/quiz/img/Coin_fffac8.png",
    "coinffe119" : "https://rygg-gaard.no/quiz/img/Coin_ffe119.png",
    "coinff9a00" : "https://rygg-gaard.no/quiz/img/Coin_ff9a00.png",
    "coinfabed4" : "https://rygg-gaard.no/quiz/img/Coin_fabed4.png",
    "coine6194b" : "https://rygg-gaard.no/quiz/img/Coin_e6194B.png",
    "coine3d055" : "https://rygg-gaard.no/quiz/img/Coin_e3d055.png",
    "coine14eff" : "https://rygg-gaard.no/quiz/img/Coin_e14eff.png",
    "coindcbeff" : "https://rygg-gaard.no/quiz/img/Coin_dcbeff.png",
    "coinbdbdbd" : "https://rygg-gaard.no/quiz/img/Coin_bdbdbd.png",
    "coinaaffc3" : "https://rygg-gaard.no/quiz/img/Coin_aaffc3.png",
    "coin8f7c31" : "https://rygg-gaard.no/quiz/img/Coin_8f7c31.png",
    "coin80ffe3" : "https://rygg-gaard.no/quiz/img/Coin_80ffe3.png",
    "coin50bde3" : "https://rygg-gaard.no/quiz/img/Coin_50bde3.png",
    "coin4363d8" : "https://rygg-gaard.no/quiz/img/Coin_4363d8.png",
    "coin3cb44b" : "https://rygg-gaard.no/quiz/img/Coin_3cb44b.png",
    "norsk" : "https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg",
    "engelsk" : "https://upload.wikimedia.org/wikipedia/commons/3/30/Flag_of_the_United_Kingdom_%283-2_aspect_ratio%29.svg",
};

//Color of range indicator is #f9e7a2

//export const SERVER = "http://localhost:3018";
//export const SERVER = process.env.REACT_APP_SERVER_ADDR;
export const SERVER = "/test";

export function getDistM(lat1, lon1, lat2, lon2) {
    const R = 6362.15; // Radius of the earth in km at 60 degrees north
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c * 1000; // Distance in m
    console.log("lat1 " + lat1.toFixed(4) + ", lon1 " + lon1.toFixed(4));
    console.log("lat2 " + lat2.toFixed(4) + ", lon2 " + lon2.toFixed(4));
    console.log("dLat " + dLat.toFixed(4) + ", dLon " + dLon.toFixed(4));
    console.log("a " + a.toFixed(4) + ", c " + c.toFixed(4));
    console.log("d " + d.toFixed(4));
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }