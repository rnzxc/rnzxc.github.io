/* 2023-2024 (c) rnzxc */
/* list journals. */

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

var journal_being_viewed = "";
var motd = document.getElementById("motd");
var motd_extra = document.getElementById("motd_extra");
var journals = document.getElementById("journals");
var journal_view = document.getElementById("journal_view");
var view_journal = document.getElementById("view_journal");
var actions = document.getElementById("actions");
var api = "/api/journals";
var motd_hidden = false;
var res_status = false;
var horizontal_rule = "________________________________________________________________________";

res_status = load_journals();

var tid = setInterval(function() {
    if (document.readyState != "complete")
        return;

    clearInterval(tid);

    cursor_busy(1);

    list_interval = setInterval(function() {
        if (list_tries > 9) {
            journals.innerHTML = "Error: Network issue - could not load journals.<br>Process terminated.<br><a href=journal.htm><br><button>try again</button></a>";
            clearInterval(list_interval);
            cursor_busy(0);
            return;
        }

        res_status = load_journals();

        if (res_status) {
            list_journals();
            clearInterval(list_interval);
            return;
        }

        ++list_tries;
        journals.innerText = "Loading journals ... Try " + list_tries + " out of 10";
    }, 1000);
}, 100);

var res = "";
var list_interval = null;
var list_tries = 0;

function load_journals() {
    var req = xhr("GET", api, function(x) {
        res = x.target.responseText;
    }, true);

    if (res !== null && res !== "") {
        cursor_busy(0);
        return 1;
    }

    return 0;
}

function list_journals() {
    // parse res
    arr = res.split("\n");
    var htm = "";

    for (var line of arr) {
        p = line.split(':');

        if (1 >= p.length)
            continue;

        htm += `<button data-get=${p[0]}><b>${p[1]}</b> ${p[2]}</button>`;
    }

    journals.innerHTML = "Available journals:<br><br>" + htm;
    res = null;
}

function cursor_busy(state) {
    document.body.setAttribute("class", state ? "cursor-busy" : "");
}

function load_journal(id) {
    var _res = xhr("GET", "/data/journal/" + id + ".htm", function(x) {
        journal_being_viewed = id;
        journals.style.display = "none";
        journal_view.style.display = "block";
        actions.style.display = "block";
        journal_view.innerHTML = x.target.responseText;
    });
}

function view_journals() {
    journal_being_viewed = "";
    view_journal.removeAttribute("style");
    journals.removeAttribute("style");
    actions.removeAttribute("style");
    journal_view.removeAttribute("style");
}

function save_journal() {
    var anchor = document.createElement('a');
    anchor.setAttribute("download", "rnzxc.journal." + journal_being_viewed + ".txt");

    var html = journal_view.innerHTML;

    while (html.indexOf("<hr>") > -1)
        html = html.replace("<hr>", horizontal_rule);

    var pseudo = document.createElement("div");
    pseudo.innerHTML = html;

    anchor.setAttribute("href", "data:text/html;base64," + btoa(pseudo.innerText));
    anchor.click();
    anchor.remove();
}

function center_body_view() {
    document.body.style.position = "relative";

    var body_bounds = document.body.getBoundingClientRect();
    var viewport_width = window.innerWidth;
    
    /* obliterate any floating point errors so the text  */
    /* is crystal clear when we center the body. I care  */
    /* about my readers, as opposed to some pajeets that */
    /* have no clue about anything in life and shouldn't */
    /* be so present in the tech industry after all the  */
    /* shit they brought over from India.                */
    var next_pos = (viewport_width / 2) - (body_bounds.width / 2) | 0;
    document.body.style.left = next_pos + "px";
} center_body_view();

window.addEventListener("click", function(e) {
    var t = e.target;
    if (t.parentElement.getAttribute("id") != "journals")
        return;

    load_journal(t.getAttribute("data-get"));
});

function hide_motd(self) {
    motd_hidden = !motd_hidden;
    self.innerText = ' ' + (motd_hidden ? "show" : "hide") + ' ';
    motd_extra.style.display = motd_hidden ? "none" : "block";
}

window.addEventListener("resize", function(e) {
    center_body_view();
});

window.addEventListener("scroll", function(e) {
    center_body_view();
});

window.onload = function() {
    center_body_view();
};
