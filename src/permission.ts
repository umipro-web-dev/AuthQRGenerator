import express, { NextFunction } from "express";
import qrcode from "qrcode";
import { randomString } from "./random";
import fetch from "node-fetch";
import crypto from "crypto";
import { TYPE_REQ, TYPE_RES } from "./app";

const secret: NodeJS.ProcessEnv = process.env;

async function permission(req:TYPE_REQ, res_to_master: TYPE_RES, next: NextFunction) {

async function ac(id: string) {

    let user_name: string = "";
    let user_mail: string = "";

    try {

        const res_get_name = await fetch(secret.mysql_url!, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            },
            body: `select name, mail from submitted_users where id=${id} and status="not_yet"`
        });

        if (!res_get_name.ok) {
            res_to_master.status(400).send("Invaild id").end();
            return;
        }

        const name_json = await res_get_name.json();

        if (!name_json) {
            res_to_master.status(400).send("すでに送信済みです。").end();
            return;
        }

        user_name = <string>name_json[0][0];
        user_mail = <string>name_json[0][1];


    } catch(e) {
        next(e);
        return;
    }

    const pass:string = randomString(30);

    const qr_str = `RoomAuth:${id}/${pass}`;

    let hash = crypto.createHash("sha224");
    hash = hash.update(secret.encrypt_key!);
    const key = hash.digest().slice(0, 16);

    const encoder = crypto.createCipheriv("aes-128-cbc", key, Buffer.from(secret.encrypt_iv!));
    const encoded = encoder.update(qr_str);
    const encoded_con = Buffer.concat([encoded, encoder.final()]);
    const encoded_str = encoded_con.toString("hex");

    let qr = await qrcode.toDataURL(encoded_str, {
        width: 700
    });

    qr = qr.replace(/^.*,/, "");



    try {
    const res_from_mail = await fetch(secret.accept_mail_url!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
            name: user_name,
            mail: user_mail,
            qr: qr
            })
        })

        if (!res_from_mail.ok) {
            res_to_master.sendStatus(500).end();
            return;
        }

    } catch(e) {
        next(e);
        return;
    }

    try {
        const res_update_status = await fetch(secret.mysql_url!, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            },
            body: `update submitted_users set status="accepted", pass="${pass}" where id=${id}`
        });

        if (!res_update_status.ok) {
            res_to_master.sendStatus(500).end();
            return;
        }

    } catch (e) {
        next(e);
        return;
    };

    res_to_master.render("permission.ejs");
}

async function re(id: string) {
    let user_name: string = "";
    let user_mail: string = "";
    try {

        const res_get_name = await fetch(secret.mysql_url!, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            },
            body: `select name, mail from submitted_users where id=${id} and status="not_yet"`
        });

        if (!res_get_name.ok) {
            res_to_master.status(400).send("Invaild id").end();
            return;
        }

        const name_json = await res_get_name.json();

        if (!name_json) {
            res_to_master.status(400).send("すでに送信済みです。").end();
            return;
        }

        user_name = <string>name_json[0][0];
        user_mail = <string>name_json[0][1];


    } catch(e) {
        next(e);
        return;
    }

    try {
    const res_from_mail = await fetch(secret.reject_mail_url!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
            name: user_name,
            mail: user_mail
            })
        })

        if (!res_from_mail.ok) {
            res_to_master.sendStatus(500).end();
            return;
        }



    } catch(e) {
        next(e);
        return;
    }

    try {
        const res_update_status = await fetch(secret.mysql_url!, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            },
            body: `update submitted_users set status="rejected" where id=${id}`
        });

        if (!res_update_status.ok) {
            res_to_master.sendStatus(500).end();
            return;
        }

    } catch (e) {
        next(e);
        return;
    }

    res_to_master.render("permission.ejs");
}

const id_regex: RegExp = /^\d*$/;
const user_id: string = <string>req.query.id;
const action: string = <string>req.query.action;

if (!id_regex.test(user_id)) {
    res_to_master.status(400).send("Invaild id").end();
    console.log("regex");
    return;
}

switch (action) {
    case "accept":
        await ac(user_id); //do render
        break;
    case "reject":
        await re(user_id); //do render
        break;
    default:
        res_to_master.status(400).send("Invaild action").end();
        return;
}

}

export default permission;