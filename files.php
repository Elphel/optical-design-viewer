<?php
/*
FILE NAME  : files.php
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

if (isset($_GET['file'])) $file = $_GET['file'];
else die("-1");
                     
if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
else                     $cmd = "read";

if (isset($_GET['path'])) $default_path = $_GET['path'];
else die("-3");

require("convert_zmx.php");
require("convert_len.php");

if      ($cmd=="save") {
    file_put_contents("$default_path/$file",file_get_contents("php://input"));
}elseif ($cmd=="read") {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if      ($ext=="zmx") $content = convert_zmx("$default_path/$file");
    else if ($ext=="len") $content = convert_len("$default_path/$file");
    else                  $content = file_get_contents("$default_path/$file");
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($content)."\n");
    header("Pragma: no-cache\n");
    echo $content;
}

?>