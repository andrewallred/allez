// To parse this data:
//
//   const Convert = require("./file");
//
//   const goQuestProfile = Convert.toGoQuestProfile(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toGoQuestProfile(json) {
    return cast(JSON.parse(json), r("GoQuestProfile"));
}

function goQuestProfileToJson(value) {
    return JSON.stringify(uncast(value, r("GoQuestProfile")), null, 2);
}

function toArg(json) {
    return cast(JSON.parse(json), r("Arg"));
}

function argToJson(value) {
    return JSON.stringify(uncast(value, r("Arg")), null, 2);
}

function toConditions(json) {
    return cast(JSON.parse(json), r("Conditions"));
}

function conditionsToJson(value) {
    return JSON.stringify(uncast(value, r("Conditions")), null, 2);
}

function toRecord(json) {
    return cast(JSON.parse(json), r("Record"));
}

function recordToJson(value) {
    return JSON.stringify(uncast(value, r("Record")), null, 2);
}

function toSrecord(json) {
    return cast(JSON.parse(json), r("Srecord"));
}

function srecordToJson(value) {
    return JSON.stringify(uncast(value, r("Srecord")), null, 2);
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
    "GoQuestProfile": o([
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "args", js: "args", typ: u(undefined, a(r("Arg"))) },
    ], false),
    "Arg": o([
        { json: "id", js: "id", typ: u(undefined, "") },
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "bot", js: "bot", typ: u(undefined, 0) },
        { json: "gtype", js: "gtype", typ: u(undefined, "") },
        { json: "token", js: "token", typ: u(undefined, "") },
        { json: "pass", js: "pass", typ: u(undefined, "") },
        { json: "records", js: "records", typ: u(undefined, a(r("Record"))) },
        { json: "totalScore", js: "totalScore", typ: u(undefined, 0) },
        { json: "totalRank", js: "totalRank", typ: u(undefined, 0) },
        { json: "totalNum", js: "totalNum", typ: u(undefined, 0) },
        { json: "rating", js: "rating", typ: u(undefined, 0) },
        { json: "hiddenR", js: "hiddenR", typ: u(undefined, 0) },
        { json: "high", js: "high", typ: u(undefined, 0) },
        { json: "dan", js: "dan", typ: u(undefined, 0) },
        { json: "lastOpp", js: "lastOpp", typ: u(undefined, "") },
        { json: "lastGame", js: "lastGame", typ: u(undefined, "") },
        { json: "handiPref", js: "handiPref", typ: u(undefined, 0) },
        { json: "botpref", js: "botpref", typ: u(undefined, 0) },
        { json: "life", js: "life", typ: u(undefined, 0) },
        { json: "last", js: "last", typ: u(undefined, Date) },
        { json: "winSince", js: "winSince", typ: u(undefined, 0) },
        { json: "played", js: "played", typ: u(undefined, 0) },
        { json: "maxStreak", js: "maxStreak", typ: u(undefined, 0) },
        { json: "streakSince", js: "streakSince", typ: u(undefined, 0) },
        { json: "streak", js: "streak", typ: u(undefined, 0) },
        { json: "draw", js: "draw", typ: u(undefined, 0) },
        { json: "loss", js: "loss", typ: u(undefined, 0) },
        { json: "win", js: "win", typ: u(undefined, 0) },
        { json: "highDay", js: "highDay", typ: u(undefined, Date) },
        { json: "rank", js: "rank", typ: u(undefined, 0) },
        { json: "rp", js: "rp", typ: u(undefined, 3.14) },
        { json: "conditions", js: "conditions", typ: u(undefined, r("Conditions")) },
        { json: "upper", js: "upper", typ: u(undefined, 0) },
        { json: "among", js: "among", typ: u(undefined, 0) },
        { json: "srecords", js: "srecords", typ: u(undefined, a(r("Srecord"))) },
    ], false),
    "Conditions": o([
        { json: "rating", js: "rating", typ: u(undefined, 0) },
        { json: "win", js: "win", typ: u(undefined, 0) },
    ], false),
    "Record": o([
        { json: "gtype", js: "gtype", typ: u(undefined, "") },
        { json: "rating", js: "rating", typ: u(undefined, 0) },
        { json: "dan", js: "dan", typ: u(undefined, 0) },
    ], false),
    "Srecord": o([
        { json: "lastGame", js: "lastGame", typ: u(undefined, "") },
        { json: "category", js: "category", typ: u(undefined, r("Category")) },
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "rating", js: "rating", typ: u(undefined, 0) },
        { json: "streak", js: "streak", typ: u(undefined, 0) },
        { json: "draw", js: "draw", typ: u(undefined, 0) },
        { json: "loss", js: "loss", typ: u(undefined, 0) },
        { json: "win", js: "win", typ: u(undefined, 0) },
    ], false),
    "Category": [
        "opening",
        "opp",
        "teban",
    ],
};

module.exports = {
    "goQuestProfileToJson": goQuestProfileToJson,
    "toGoQuestProfile": toGoQuestProfile,
};
