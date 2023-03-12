import { NextFunction } from "express";
import fetch from "node-fetch";
import {DateTime, Settings} from "luxon";
import crypto from "crypto";
import { TYPE_REQ, TYPE_RES } from "./app";


type TYPE_check_json = {
    data: string
}

const secret: NodeJS.ProcessEnv = process.env;



async function check(req_from_app: TYPE_REQ, res_to_app: TYPE_RES , next: NextFunction): Promise<undefined> {

    Settings.defaultLocale = "ja";
    Settings.defaultZone = "Asia/Tokyo"; 

    const ip: string = <string>req_from_app.ip;

    console.log(ip);

    //付けたほうがいい

    /* if (ip !== secret.ip) {
        res_to_app.status(403).send("Request denied").end();
        return;
    } */

    const json_from_app: TYPE_check_json = req_from_app.body;

    const roomauth_regex: RegExp = /^RoomAuth:\d+\/\w+$/;

    let decode_str: string;

    try {

        let hash = crypto.createHash("sha224");

        hash = hash.update(secret.encrypt_key!);

        const key = hash.digest().slice(0, 16);

        const iv = Buffer.from(secret.encrypt_iv!);
        const decoder = crypto.createDecipheriv("aes-128-cbc", key, iv);
        const decode = decoder.update(Buffer.from(json_from_app.data, "hex"));
        const decode_con = Buffer.concat([decode, decoder.final()]);
        decode_str = decode_con.toString();
    } catch (e) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "無効なQRコードです。"
        });
        return;
    }

    if (!roomauth_regex.test(decode_str!)) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "無効なQRコードです。"
        });
        return;
    }
    decode_str = decode_str.replace("RoomAuth:", "");
    const id_and_pass: string[] = decode_str.split("/");
    const id = id_and_pass[0];
    const pass = id_and_pass[1];

    try {

    const res_from_sql = await fetch(secret.mysql_url!, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: `select pass, enter_at, status from submitted_users where id=${id}`
    });

    if (!res_from_sql.ok) {
        res_to_app.sendStatus(500).end();
        return;
    }

    const mysql_json = await res_from_sql.json();

    if (!mysql_json) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "無効なQRコードです。"
        });
        return;
    }

    if (mysql_json[0][2] === "entered") {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "このQRコードはすでに使用済みです。"
        });
        return;
    }

    if (mysql_json[0][0] !== pass) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "無効なQRコードです。"
        });
        return;
    }

    if (!(mysql_json[0][2] === "accepted" || mysql_json[0][2] === "master")) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "無効なQRコードです。"
        });
        return;
    }

    //masterは時刻無視
    if (mysql_json[0][2] === "master") {
        res_to_app.render("check_result.ejs", {
            accept: "true",
            message: "管理者"
        });
        return;
    }
    

    const now: DateTime = DateTime.local().setZone("Asia/Tokyo");

    const enter_at: DateTime = DateTime.fromSQL(mysql_json[0][1]).setZone("Asia/Tokyo");

    const diff: number = now.diff(enter_at, "hours").hours;

    if (diff > 2) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "このQRコードは期限切れです。"
        });
        return;
    }

    if (diff < 0) {
        res_to_app.render("check_result.ejs", {
            accept: "false",
            message: "このQRコードは入室時刻になるまで使用できません。"
        });
        return;
    }

    //認証突破！

    const res_mysql = await fetch(secret.mysql_url!, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: `update submitted_users set pass=NULL, status="entered" where id=${id}`
    });

    if (!res_mysql.ok) {
        res_to_app.sendStatus(500).end();
        return;
    }

    

    res_to_app.render("check_result.ejs", {
        accept: "true",
        message: "どうぞお入りください。"
    });
    
    return;




    } catch (e) {
        next(e);
    }
}

export default check;