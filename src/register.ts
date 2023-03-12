import express, { NextFunction, Request} from "express";
import fetch from "node-fetch";
import { DateTime, Settings } from "luxon";
import { TYPE_REQ, TYPE_RES } from "./app";

//フォームのバリテーションに使う正規表現と配列。

const name_regex: RegExp = /^[^\x01-\x7E]+$/;

const birth_regex: RegExp = /^\d{4}-\d{2}-\d{2}$/;

const pref_list: string[] = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
"茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
"新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
"静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
"奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
"徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
"熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

const job_list: string[] = ["公務員", "経営者・役員", "会社員", "自営業", "専業主婦・主夫", "パート・アルバイト", "学生", "その他"];

const mail_regex: RegExp = /^\w*@\w*\.\w*$/;

const enter_at_regex: RegExp = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/; 

const secret: NodeJS.ProcessEnv = process.env;


//mysqlへのリクエスト送信データの型定義
type TYPE_request_data = {
    method: string,
    headers: {
        "Content-Type": string
    },
    body: string,

}

//　/register で受信したjsonデータの型定義
type TYPE_body = {
    name: string,
    birth: string,
    pref: string,
    job: string,
    mail: string,
    enter_at: string
};
async function register(req: TYPE_REQ, res_to_client: TYPE_RES , next: NextFunction): Promise<undefined> {

    console.log(req.body);

    

    Settings.defaultLocale = "ja"; 
    Settings.defaultZone = "Asia/Tokyo";

    //フォームデータが入ったオブジェクト
    const body_from_client: TYPE_body = req.body;
    

    if (!(name_regex.test(body_from_client.name) && birth_regex.test(body_from_client.birth) && pref_list.includes(body_from_client.pref) && job_list.includes(body_from_client.job) && mail_regex.test(body_from_client.mail) && enter_at_regex.test(body_from_client.enter_at))) {
        res_to_client.sendStatus(400).end();
        console.log(1)
        return;
    }

    const now_date: DateTime = DateTime.local().setZone("Asia/Tokyo");

    const birth_date: DateTime = DateTime.fromSQL(body_from_client.birth).setZone("Asia/Tokyo");
    
    const enter_at_date: DateTime = DateTime.fromSQL(body_from_client.enter_at).setZone("Asia/Tokyo");

    if (!birth_date.isValid || !enter_at_date.isValid) {    
        res_to_client.sendStatus(400).end();
        console.log(2)
        return;
    }

    if (now_date < birth_date) {
        res_to_client.sendStatus(400).end();
        console.log(3);
        return;
    }

    if (enter_at_date < now_date) {
        res_to_client.sendStatus(400).end();
        console.log(4)
        return;
    }

    // 認証突破！

    ///gasでメール送信
    try {

    const registed_mail_res = await fetch(secret.registed_mail_url!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
            name: body_from_client.name,
            mail: body_from_client.mail
        })
    });

    if (!registed_mail_res.ok) {
        res_to_client.sendStatus(400).end();
        return;
    }
    } catch(e) {
        next(e);
        return;
    }

    //mysqlへのリクエストのオプション 
    const sql_opt: TYPE_request_data = {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: `insert into submitted_users (name, birth, job, pref, mail, enter_at, status) values ("${body_from_client.name}", "${body_from_client.birth}", "${body_from_client.job}", "${body_from_client.pref}", "${body_from_client.mail}", "${body_from_client.enter_at}", "not_yet")`
    }

    // mysqlサーバーへリクエスト
    try {

    const mysql_addData_res = await fetch(secret.mysql_url!, sql_opt);

    if (!mysql_addData_res.ok) {
        res_to_client.sendStatus(400).end();
        return;
    }

    const res_text = await mysql_addData_res.text();

    if (res_text != "[]\n") {
        console.log(res_text);
        res_to_client.sendStatus(400).end();
        return;
    }

    

    } catch (e) {
        next(e);
        return;
    }

    //id取得
    let this_data_id: number = 0;

    try {

    const get_id_res = await fetch(secret.mysql_url!, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: `select id from submitted_users order by id desc limit 1`
    });

    if (get_id_res.status == 500) {
        throw "Internal Server Error";
    }

    const id_arr = await get_id_res.json();

    this_data_id = <number>id_arr[0][0];



    } catch(e) {
        next(e);
        return;
    }




    //管理者へのリクエストメール
    try {

    const permissionMail_send_res = await fetch(secret.req_per_url!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
            name: body_from_client.name,
            birth: body_from_client.birth,
            pref: body_from_client.pref,
            job: body_from_client.job,
            mail: body_from_client.mail,
            enter_at: body_from_client.enter_at,
            id: this_data_id
        })
    });

    if (!permissionMail_send_res.ok) {
        res_to_client.sendStatus(400).end();
        return;
    }
    } catch(e) {
        next(e);
        return;
    }


    res_to_client.render("register.ejs");

    
}

export default register;


