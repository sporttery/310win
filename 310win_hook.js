var hookJs = true;
var needData = {
    "tech": { "进攻": 1, "危险进攻": 2, "射门": 3, "犯规": 4,"铲球":5,"成功抢断":6,"阻截":7},
    "event": {
        "/images/bf_img/1.png": "进球",
        "/images/bf_img/7.png": "点球",
        "/images/bf_img/8.png": "乌龙",
        "/images/bf_imgnew/1.png": "进球",
        "/images/bf_imgnew/7.png": "点球",
        "/images/bf_imgnew/8.png": "乌龙",
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
        var needFlag = needData["tech"][flag];
        if (needFlag) {
            hostData["tech"][needFlag+flag] = $(this).prev().text().trim();
            visitData["tech"][needFlag+flag] = $(this).next().text().trim();
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

function showData(obj, data) {
    // console.log("组成数据 " + obj.id);
    // console.info(data);
    var html=[];
    html.push('<tr style="background: gray;"><th>参数</th><th>主队</th><th>客队</th></tr>');

    var keys = Object.keys(data.hostData.tech).sort();
    for(var i = 0;i<keys.length;i++  ){
        var key = keys[i];
        html.push('<tr><th>'+key.substring(1)+'</th>');
        var hostValue = parseInt(data.hostData.tech[key]);
        var visitValue = parseInt(data.visitData.tech[key]);
        if(hostValue && visitValue ){
            if(hostValue> visitValue){
                html.push('<td><font color=red>'+hostValue+'</font></td>');
                html.push('<td><font color=green>'+visitValue+'</font></td>');
            }else if(hostValue < visitValue){
                html.push('<td><font color=green>'+hostValue+'</font></td>');
                html.push('<td><font color=red>'+visitValue+'</font></td>');
            }else{
                html.push('<td>'+hostValue+'</td>');
                html.push('<td>'+visitValue+'</td>');
            }
        }else{
            html.push('<td>-</td>');
            html.push('<td>-</td>');
        }
        html.push('</tr>');
    }
    var strjj = '<tr><th rowspan=###>进球时间</th></tr>';
    var n=0,tmp=[];
    for (var key in data.hostData["event"]) {
        var arr = data.hostData["event"][key];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            tmp.push('<tr><td>'+item.imgTitle + " " + item.time+'</td><td>-</td></tr>');
        }        
    }
    for (var key in data.visitData["event"]) {
        var arr = data.visitData["event"][key];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if(! tmp[n] ){
                tmp.push('<tr><td>-</td><td>'+item.imgTitle + " " + item.time+'</td></tr>');
            }else{
                tmp[n] = tmp[n].replace('<td>-</td>','<td>'+item.imgTitle + " " + item.time+'</td>');
            }
            n++;
        }        
    }
    strjj=strjj.replace("###",tmp.length+1);
    
    html.push(strjj+tmp.join(''));
    var str = '<td class="myData" style="vertical-align:top;background: #fff;font-size: 15px;"><table cellspacing="0" cellpadding="0" width="100%" align="center"  border="1">' + html.join("") + '</table></td>';
   
    $(obj).find(".myData").remove();
    $(str).appendTo($(obj));
}
var data_detail = {};
function setTr() {
    $(".porletP:visible").each(function () {
        idx = this.id.replace("porlet_", "");
        if (idx != "8" && idx != "9") {
            $(this).remove();
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
                            d = d.replace(/imgnew/g,'img');
                            // console.log(d);
                            data = getData(d);
                            showData(obj, data);
                            data_detail[obj.id] = data;
                        }
                    };
                    if (data_detail[this.id]) {
                        showData(this, data_detail[this.id]);
                    } else {
                        var detailUrl1 =  "https://www.310win.com/info/match/detail.aspx?id="+matchid;
                        //"https://bf.win007.com/detail/" + matchid + "cn.htm";
                        var detailUrl = "https://bf.titan007.com/detail/" + matchid + "cn.htm";
                        console.info(detailUrl);
                        var ele = this;
                        $.ajax({
                            url:detailUrl,
                            method:"get",
                            success:fun(ele),
                            error:function(){
                                $.get(detailUrl1, fun(ele));
                            }
                        });
                        
                    }
                }
            });
        }
    });
}

function initHook(flag){
    if(typeof s_onchange!="undefined" ){
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
        $("#right_float").remove();
        $("#dv_new").remove();
        $("#iframeA").hide();
        if(flag==1){
            $("#h_s").val("3").trigger("change");
            $("#a_s").val("3").trigger("change");
        }
    }else{
        console.info("未找到指定元素，1秒后再试");
        setTimeout(initHook,1000,1);
        return;
    }
    
}
window.pbuy_21 = false;



initHook();


  