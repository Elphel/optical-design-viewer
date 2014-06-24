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
else die("-2");

$default_path = "local";

if      ($cmd=="save") {
    file_put_contents("$default_path/$file",file_get_contents("php://input"));
}elseif ($cmd=="read") {
    $content = file_get_contents("$default_path/$file");
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($content)."\n");
    header("Pragma: no-cache\n");
    echo $content;
}

?>