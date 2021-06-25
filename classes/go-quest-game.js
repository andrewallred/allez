// To parse this data:
//
//   const Convert = require("./file");
//
//   const goQuestGame = Convert.toGoQuestGame(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toGoQuestGame(json) {
    return cast(JSON.parse(json), r("GoQuestGame"));
}

function goQuestGameToJson(value) {
    return JSON.stringify(uncast(value, r("GoQuestGame")), null, 2);
}

function toArg(json) {
    return cast(JSON.parse(json), r("Arg"));
}

function argToJson(value) {
    return JSON.stringify(uncast(value, r("Arg")), null, 2);
}

function toPlayer(json) {
    return cast(JSON.parse(json), r("Player"));
}

function playerToJson(value) {
    return JSON.stringify(uncast(value, r("Player")), null, 2);
}

function toPosition(json) {
    return cast(JSON.parse(json), r("Position"));
}

function positionToJson(value) {
    return JSON.stringify(uncast(value, r("Position")), null, 2);
}

function toMove(json) {
    return cast(JSON.parse(json), r("Move"));
}

function moveToJson(value) {
    return JSON.stringify(uncast(value, r("Move")), null, 2);
}

function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "GoQuestGame": o([
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "args", js: "args", typ: u(undefined, a(r("Arg"))) },
    ], false),
    "Arg": o([
        { json: "id", js: "id", typ: u(undefined, "") },
        { json: "gtype", js: "gtype", typ: u(undefined, "") },
        { json: "position", js: "position", typ: u(undefined, r("Position")) },
        { json: "tcb", js: "tcb", typ: u(undefined, 0) },
        { json: "attrs", js: "attrs", typ: u(undefined, a("")) },
        { json: "tci", js: "tci", typ: u(undefined, 0) },
        { json: "players", js: "players", typ: u(undefined, a(r("Player"))) },
        { json: "created", js: "created", typ: u(undefined, Date) },
        { json: "finished", js: "finished", typ: u(undefined, true) },
    ], false),
    "Player": o([
        { json: "newRP", js: "newRP", typ: u(undefined, 3.14) },
        { json: "oldRP", js: "oldRP", typ: u(undefined, 3.14) },
        { json: "newD", js: "newD", typ: u(undefined, 0) },
        { json: "oldD", js: "oldD", typ: u(undefined, 0) },
        { json: "newR", js: "newR", typ: u(undefined, 3.14) },
        { json: "oldR", js: "oldR", typ: u(undefined, 3.14) },
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "id", js: "id", typ: u(undefined, "") },
        { json: "avatar", js: "avatar", typ: u(undefined, "") },
    ], false),
    "Position": o([
        { json: "moves", js: "moves", typ: u(undefined, a(r("Move"))) },
        { json: "size", js: "size", typ: u(undefined, 0) },
    ], false),
    "Move": o([
        { json: "t", js: "t", typ: u(undefined, 0) },
        { json: "m", js: "m", typ: u(undefined, "") },
        { json: "s", js: "s", typ: u(undefined, "") },
    ], false),
};

function toSgf(b, d) {
    var f = b.at(0)
        , g = b.at(1)
        , h = d.moves.length
        , l = d.moves[h - 1].s
        , e = 0;
    b = "(;GM[1]" + ("SZ[" + ("go9" == gtype ? 9 : "go13" == gtype ? 13 : 19) + "]");
    l && l.match(/^SCORE:([0-9\.\-]+)/) && (e = Number(RegExp.$1));
    0 != e && (b += "RE[" + (0 > e ? "W" : "B") + "+" + Math.abs(e) + "]");
    b = b + "KM[7.0]RU[Chinese]\n" + ("PB[" + f.get("name") + "(" + Math.floor(f.get("oldR")) + ")]\n");
    b += "PW[" + g.get("name") + "(" + Math.floor(g.get("oldR")) + ")]\n";
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

module.exports = {
    "goQuestGameToJson": goQuestGameToJson,
    "toGoQuestGame": toGoQuestGame,
    "toSgf": toSgf,
};