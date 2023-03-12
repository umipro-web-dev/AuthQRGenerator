"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Vue.createApp({
    data: function () {
        var date_obj = new Date();
        date_obj.setHours(date_obj.getHours() + 9);
        var date = date_obj.toISOString();
        date = date.replace("T", " ");
        date = date.slice(0, -8);
        return {
            name: "",
            birth: "",
            pref: "",
            job: "",
            mail: "",
            enter_at: date,
            show: true,
            end_page: ""
        };
    },
    methods: {
        send_req: function () {
            return __awaiter(this, void 0, void 0, function () {
                var json, data, bodyElem, res_from_server, res_html, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            json = {
                                name: this.name,
                                birth: this.birth,
                                pref: this.pref,
                                job: this.job,
                                mail: this.mail,
                                enter_at: this.enter_at
                            };
                            data = {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json; charset=utf-8"
                                },
                                body: JSON.stringify(json)
                            };
                            bodyElem = document.querySelector("body");
                            bodyElem.setAttribute("style", "background-color: rgba(0, 0, 0, 0.4);");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch("/register", data)];
                        case 2:
                            res_from_server = _a.sent();
                            switch (res_from_server.status) {
                                case 200:
                                    break;
                                case 400:
                                    alert("入力値に不備があります。");
                                    return [2 /*return*/, null];
                                case 500:
                                    alert("システムで不具合が発生しました。時間をおいてもう一度お試しください。");
                                    return [2 /*return*/, null];
                                default:
                                    alert("システムで不具合が発生しました。時間をおいてもう一度お試しください。");
                                    return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, res_from_server.text()];
                        case 3:
                            res_html = _a.sent();
                            bodyElem.setAttribute("style", "background-color: rgba(0, 0, 0, 0);");
                            this.show = false;
                            //完了メッセージを表示する。
                            this.end_page = res_html;
                            return [2 /*return*/, null];
                        case 4:
                            e_1 = _a.sent();
                            alert("送信エラーが発生しました。もう一度時間をおいてお試しください。");
                            return [2 /*return*/, null];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    },
    mounted: function () {
        window.onload = function () {
        };
    },
    components: {
        datetime: VueDatePicker
    }
})
    .mount("main");
