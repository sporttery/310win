var hookJs = true;
var needData = {
    "tech": { "射门": 1, "进攻": 1, "危险进攻": 1, "犯规": 1 },
    "event": {
        "/images/bf_img/1.png": "进球",
        "/images/bf_img/7.png": "点球",
        "/images/bf_img/8.png": "乌龙",
    }
};


function getData(body) {
    var hostData = { "tech": {}, "event": {} };
    var visitData = { "tech": {}, "event": {} };
    if (!body) {
        body = document.body;
    }
    $(body).find("#teamTechDiv_detail").find("td").each(function () {
        var flag = $(this).text().trim();
        if (needData["tech"][flag]) {
            hostData["tech"][flag] = $(this).prev().text().trim();
            visitData["tech"][flag] = $(this).next().text().trim();
        }
    });

    ///images/bf_img/1.png
    $(body).find("#teamEventDiv_detail").find("tr").each(function () {
        var tds = $(this).find("td");
        if (tds.length == 5) {
            var img = $(tds[1]).find("img");
            var time = $(tds[2]).text().trim();
            var imgTitle = img.attr("title");
            var imgSrc = img.attr("src");
            if (img.length == 1 && needData["event"][imgSrc]) {
                if (!hostData["event"][imgSrc]) {
                    hostData["event"][imgSrc] = [];
                }
                hostData["event"][imgSrc].push({ imgTitle, time });
            }
            img = $(tds[3]).find("img");
            imgTitle = img.attr("title");
            imgSrc = img.attr("src");
            if (img.length == 1 && needData["event"][imgSrc]) {
                if (!visitData["event"][imgSrc]) {
                    visitData["event"][imgSrc] = [];
                }
                visitData["event"][imgSrc].push({ imgTitle, time });
            }
        }
    });

    return { hostData, visitData };
}


function getHtml(data) {
    var html = [];
    for (var key in needData["tech"]) {
        html.push(key + " " + (data["tech"][key] || ""));
    }
    for (var key in data["event"]) {
        var arr = data["event"][key];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            html.push(item.imgTitle + " " + item.time);
        }        
    }
    return '<td class="myData" style="vertical-align:top">' + html.join("<br/>") + '</td>'
}

function showData(obj, data) {
    // console.log("组成数据 " + obj.id);
    var hostHtml = getHtml(data.hostData);
    var visitHtml = getHtml(data.visitData);
    var html = hostHtml + visitHtml;
    $(obj).find(".myData").remove();
    $(html).appendTo($(obj));
}
var data_detail = {};
function setTr() {
    $(".porletP:visible").each(function () {
        idx = this.id.replace("porlet_", "");
        if (idx != "8" && idx != "9") {
            $(this).hide();
        } else {
            $(this).find("table").find("tr:visible").each(function () {
                var tds = $(this).find("td");
                if (tds.length == 17) {
                    $(tds[9]).remove();
                    $(tds[10]).remove();
                    $(tds[11]).remove();
                } else if (tds.length == 13) {
                    $(tds[7]).remove();
                } else if (tds.length == 6) {
                    $(tds[3]).remove();
                    $(tds[4]).remove();
                    $(tds[5]).remove();
                }
                var matchid = this.id.substring(4);
                if(matchid && !isNaN(parseInt(matchid))){
                    var fun = function (obj) {
                        return function (d) {
                            d = d.replace(/[\r\n]/g, "");
                            d = d.replace(/<script.+?<\/script>/g, "");
                            // console.log(d);
                            data = getData(d);
                            showData(obj, data);
                            data_detail[obj.id] = data;
                        }
                    };
                    if (data_detail[this.id]) {
                        showData(this, data_detail[this.id]);
                    } else {
                        $.get("http://bf.win007.com/detail/" + matchid + "cn.htm", fun(this));
                    }
                }
            });
        }
    });
}


var old_s_onchange = s_onchange;
var old_t_onclick = t_onclick;
var old_cb_onclick = cb_onclick;
s_onchange = function (id,count) {
    old_s_onchange(id,count);
    setTr();
}

t_onclick = function (id) {
    old_t_onclick(id);
    setTr();
}

cb_onclick = function(flag,lid){
    old_cb_onclick(flag,lid);
    setTr();
}

$("#dv_new").hide();


  