<?php

/* 2023-2024 (c) rnzxc */
/* sync site data */

$cd = __DIR__ . '/';

$errors = [];

function _err($text) {
    return " • $text";
}

/* run sanity checks */
if (!file_exists("$cd/api"))
    $errors[] = _err("No dir: /api");

if (file_exists("$cd/api") && !is_dir("$cd/api"))
    $errors[] = _err("Not dir: /api");

if (file_exists("$cd/api/journals") && is_dir("$cd/api/journals"))
    $errors[] = _err("Is dir: /api/journals");

if (file_exists("$cd/api/journals") && !is_dir("$cd/api/journals") && !is_writable("$cd/api/journals"))
    $errors[] = _err("Not writable: /api/journals");

if (!file_exists("$cd/data"))
    $errors[] = _err("No dir: /data");

if (!file_exists("$cd/data/journal"))
    $errors[] = _err("No dir: /data/journal");

if (!file_exists("$cd/font"))
    $errors[] = _err("No dir: /font");

if (!file_exists("$cd/js"))
    $errors[] = _err("No dir: /js");

if (!file_exists("$cd/index.htm"))
    $errors[] = _err("No file: /index.htm");

if (!file_exists("$cd/journal.htm"))
    $errors[] = _err("No file: /journal.htm");

/* yell at the admin if failed */
if (sizeof($errors) > 0) {
    echo "Encountered errors:\n";
    echo implode("\n", $errors);
    exit(1);
}

/* sync the /api/journals */

/* this works by iterating through the list of journals available */
/* and extracting the title from the 1st H1 tag in the file using */
/* str_between and by doing that we generate our own HTML that we */
/* deploy to the journal homepage via the xhr() function and that */
/* way we don't need to handle JSON shenanigans. hopefully its ok */

$journals = scandir("$cd/data/journal/");
unset($journals[0], $journals[1]);
$journals = array_reverse($journals);
$buffer = "";

function write_entry($file, $data) {
    $id = substr($file, 0, -4);

    /* Skip template post in the journals dir */
    if (strtolower($id) === "template")
        continue;

    $head = explode("\n", $data, 2)[0];
    $head = str_between($head, "<h1>", "</h1>");
    $date = str_between($head, "<b>", "</b>");
    $head = str_replace("<b>$date</b> ", '', $head);
    return "$id:$date:$head\n";
}

/* this function extract a string between 2 strings its that easy */
function str_between($s = '', $a = null, $b = null) {
    if ($a == null || $s == '')
        return $s;

    $s = explode($a, $s, 2)[1];

    if ($b !== null)
        $s = explode($b, $s, 2)[0];

    return $s;
}

/* build /api/journals so our clueless human beings can read my   */
/* journals :)                                                    */
foreach ($journals as $j) {
    if (strtolower(substr($j, -4, 4)) != ".htm")
        continue;

    $data = file_get_contents("$cd/data/journal/" . $j);
    $buffer .= write_entry($j, $data);
}

$fp_status = @file_put_contents("$cd/api/journals", $buffer);

if ($fp_status === false) {
    echo "Error: Failed to write to \"$cd/api/journals\"\n";
    exit(2);
}

$asciiart = scandir("$cd/data/ascii-art/");
unset($asciiart[0], $asciiart[1]);
$buffer = "";

/* build /api/ascii-art so the people */
/* can waste even more of their  time */
foreach ($asciiart as $j) {
    if (strtolower(substr($j, -4, 4) != ".txt"))
        continue;

    $buffer .= substr($j, 0, strlen($j) - 4) . "\n";
}

$fp_status = @file_put_contents("$cd/api/ascii-art", $buffer);

if ($fp_status === false) {
    echo "Error: Failed to write to \"$cd/api/ascii-art\"\n";
    exit(2);
}

echo "OK\n";
exit(0);
