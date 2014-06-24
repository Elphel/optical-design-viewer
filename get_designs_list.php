<?php
/*
FILE NAME  : get_designs_list.php
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

//$res_xml = file_get_contents("sensors/sensors.xml");

$path = "local";

$res_xml  = "<?xml version='1.0'?>\n";
$res_xml .= "<Document>\n";

$files = scandir($path);

foreach($files as $file){
  if (is_file("$path/$file")) {
    $res_xml .= "\t<file>$file</file>\n";
  }
}

$res_xml .= "</Document>";

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();

?> 
