<?php
/*
FILE NAME  : get_remote_designs_list.php
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

//$res_xml = file_get_contents("sensors/sensors.xml");

$path = "https://github.com/Elphel/elens";
$contents = file_get_contents($path);
$regexp_xml = '#<a[^>]*href="([^"]*)"[^>]*title=".*.xml"#';
$regexp_zmx = '#<a[^>]*href="([^"]*)"[^>]*title=".*.zmx"#';

$files = Array();
if(preg_match_all($regexp_xml, $contents, $matches, PREG_SET_ORDER)) { 
  foreach ($matches as $match) {
    $files[] = basename($match[1]);
  }
}
if(preg_match_all($regexp_zmx, $contents, $matches, PREG_SET_ORDER)) { 
  foreach ($matches as $match) {
    $files[] = basename($match[1]);
  }
}


$res_xml  = "<?xml version='1.0'?>\n";
$res_xml .= "<Document>\n";

foreach($files as $file){
    $res_xml .= "\t<file>$file</file>\n";
}

$res_xml .= "</Document>";

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();

?> 
