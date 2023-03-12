import Vue from "vue";

type body = {   
    name: string,
    birth: string,
    pref: string,
    job: string,
    mail: string,
    enter_at: string
};

type data_type = {
    method: string,
    headers: {
        "Content-Type": string
    },
    body: string

}



Vue.createApp({

    data():Object {
        let date_obj = new Date();

        date_obj.setHours(date_obj.getHours() + 9);

        let date = date_obj.toISOString();
        date = date.replace("T", " ");
        date = date.slice(0, -8);

        
        return {
            name: "",
            birth : "",
            pref: "",
            job: "",
            mail: "",
            enter_at: date,
            show: true,
            end_page: ""
        }
    },
    methods: {
        async send_req(): Promise<null> {

            const json: body = {

                name: this.name,
                birth : this.birth,
                pref: this.pref,
                job: this.job,
                mail: this.mail,
                enter_at: this.enter_at
                
            }

            const data: data_type = {
                method:  "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(json)
    
            }
            
            const bodyElem = document.querySelector("body");
            bodyElem!.setAttribute("style", "background-color: rgba(0, 0, 0, 0.4);");


            try {
            const res_from_server = await fetch("/register", data);
            
                
            switch (res_from_server.status) {
                case 200:
                    break;
                case 400:
                    alert("入力値に不備があります。");
                    return null;
                case 500:
                    alert("システムで不具合が発生しました。時間をおいてもう一度お試しください。");
                    return null;
                default:
                    alert("システムで不具合が発生しました。時間をおいてもう一度お試しください。");
                    return null;
    
                }
            
                const res_html: string = await res_from_server.text();

                bodyElem!.setAttribute("style", "background-color: rgba(0, 0, 0, 0);");

                this.show = false;

                //完了メッセージを表示する。

                this.end_page = res_html;

                return null;

            } catch(e) {
                alert("送信エラーが発生しました。もう一度時間をおいてお試しください。");
                return null;
            }
            
            
            
        }
    },
    mounted() {
        window.onload = () => {
            
        }
    },
    components: {
        datetime: VueDatePicker
    }

})
.mount("main");

