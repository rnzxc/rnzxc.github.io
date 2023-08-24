/* 2023 (c) rnzxc */
/* list ascii art */

/* this function allows us to easily abstract the */
/* nonsense that's XHR through a single function call. */
function xhr(method = "GET", url = null, callback = null, callOn200 = false) {
    if (url == null || callback == null)
        return null;

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(event) {
        if (callOn200 && xhr.readyState === 4 && xhr.status === 200) {
            if (typeof callback === "function")
                callback(event);
        } else if (!callOn200) {
            if (typeof callback === "function")
                callback(event);
        }
    };

    xhr.open(method, url);
    xhr.send();
}

/* configure things to make it work */

var ascii_art_being_viewed = "";
var motd = document.getElementById("motd");
var motd_extra = document.getElementById("motd_extra");
var ascii_art = document.getElementById("ascii_art");
var ascii_art_view = document.getElementById("ascii_art_view");
//var view_ascii_art = document.getElementById("view_ascii_art");
var actions = document.getElementById("actions");
var api = "/api/ascii-art";
var motd_hidden = false;
var res_status = false;
var horizontal_rule = "________________________________________________________________________";

res_status = load_ascii_art();

var tid = setInterval(function() {
    if (document.readyState != "complete")
        return;

    clearInterval(tid);

    cursor_busy(1);

    list_interval = setInterval(function() {
        if (list_tries > 9) {
            ascii_art.innerHTML = "Error: Network issue - could not load ASCII art.<br>Process terminated.<br><a href=ascii-art.htm><br><button>try again</button></a>";
            clearInterval(list_interval);
            cursor_busy(0);
            return;
        }

        res_status = load_ascii_art();

        if (res_status) {
            list_ascii_art();
            clearInterval(list_interval);
            return;
        }

        ++list_tries;
        ascii_art.innerText = "Loading ASCII art ... Try " + list_tries + " out of 10";
    }, 1000);
}, 100);

var res = "";
var list_interval = null;
var list_tries = 0;

function load_ascii_art() {
    var req = xhr("GET", api, function(x) {
        res = x.target.responseText;
    }, true);

    if (res !== null && res !== "") {
        cursor_busy(0);
        return 1;
    }

    return 0;
}

function list_ascii_art() {
    // parse res
    arr = res.split("\n");
    var htm = "";

    for (var p of arr) {
        if (p === '')
            continue;

        htm += `<button data-get=${p}>${p}</button>`;
    }

    ascii_art.innerHTML = "Available ASCII art:<br><br>" + htm;
    res = null;
}

function cursor_busy(state) {
    document.body.setAttribute("class", state ? "cursor-busy" : "");
}

function load_ascii_art_single(id) {
    var _res = xhr("GET", "/data/ascii-art/" + id + ".txt", function(x) {
        ascii_art_being_viewed = id;
        ascii_art.style.display = "none";
        ascii_art_view.style.display = "block";
        actions.style.display = "block";
        ascii_art_view.innerHTML = `<pre>\n\n\n\n\n${x.target.responseText}\n</pre>`;
    });
}

function view_ascii_art_fn() {
    ascii_art_being_viewed = "";
    ascii_art.removeAttribute("style");
    actions.removeAttribute("style");
    ascii_art_view.style.display="none";
}

function save_ascii_art_fn() {
    var anchor = document.createElement('a');
    anchor.setAttribute("href", `/data/ascii-art/${ascii_art_being_viewed}.txt`);
    anchor.setAttribute("download", "rnzxc.ascii-art." + ascii_art_being_viewed + ".txt");
    anchor.click();
    anchor.remove();
}

window.addEventListener("click", function(e) {
    var t = e.target;
    if (t.parentElement.getAttribute("id") != "ascii_art")
        return;

    load_ascii_art_single(t.getAttribute("data-get"));
});

function hide_motd(self) {
    motd_hidden = !motd_hidden;
    self.innerText = ' ' + (motd_hidden ? "show" : "hide") + ' ';
    motd_extra.style.display = motd_hidden ? "none" : "block";
}
