function toSgf(b, d, gtype) {
    var f = b[0]
        , g = b[1]
        , h = d.moves.length
        , l = d.moves[h - 1].s
        , e = 0;
    b = "(;GM[1]" + ("SZ[" + ("go9" == gtype ? 9 : "go13" == gtype ? 13 : 19) + "]");
    l && l.match(/^SCORE:([0-9\.\-]+)/) && (e = Number(RegExp.$1));
    0 != e && (b += "RE[" + (0 > e ? "W" : "B") + "+" + Math.abs(e) + "]");
    b = b + "KM[7.0]RU[Chinese]\n" + ("PB[" + f["name"] + "(" + Math.floor(f["oldR"]) + ")]\n");
    b += "PW[" + g["name"] + "(" + Math.floor(g["oldR"]) + ")]\n";
    if (d.handicap)
        for (g = d.handicap.split(":"),
            f = 0; f < g.length; f++)
            b += ";",
                b += "B[" + g[f] + "]",
                b += "W[]";
    for (f = 0; f < h; f++)
        g = d.moves[f],
            g.m && (b += ";",
                b += g.m);
    return b + ")"
}

function getFileName(game) {

    let isBlack = game.args[0].players[0].name == process.env.GQ_PROFILE_NAME;

    let size = game.args[0].gtype.replace("go", "");
    let sizeStr = size + "x" + size;
    let created = new Date(game.args[0].created).toLocaleTimeString();

    let opening = game.args[0].attrs[2];
    if (!isBlack) {
        opening = game.args[0].attrs[4];
    }
    console.log(created, opening, size);

    if (opening && opening.includes("opening:")) {
        opening = opening.replace("opening:", "") + " - ";
    } else {
        opening = "";
    }

    return opening + sizeStr + " - " + created;
}

module.exports = {
    "toSgf": toSgf,
    "getFileName": getFileName
};
