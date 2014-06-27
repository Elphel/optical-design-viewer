<?php
/*
FILE NAME  : convert_zmx.php
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/
function convert_zmx($path){
    $contents = file_get_contents($path);
    $lines = explode("\n",$contents);
    $surface_enable=false;
    $index = 0;
    $surfaces = Array();

    for($i=0;$i<count($lines);$i++){
      $str = mb_convert_encoding ($lines[$i], 'UTF-8', 'UTF-16');
      //$str = $lines[$i];
      if ($surface_enable){
	  $s= explode(' ',$str);
	  foreach ($s as $a=>$b){    
	    $tmp = trim($b);
	    if ($tmp=="CURV") {$surfaces[$index]["CURV"]=$s[$a+1];break;}
	    if ($tmp=="DISZ") {$surfaces[$index]["DISZ"]=$s[$a+1];break;}
	    if ($tmp=="GLAS") {$surfaces[$index]["GLAS"]=$s[$a+1];break;}
	    if ($tmp=="DIAM") {$surfaces[$index]["DIAM"]=$s[$a+1];break;}
	    if ($tmp=="STOP") {$surfaces[$index]["STOP"]=true;break;}
	  }
      }
      if (strpos($str,"SURF")!==false) {
	$surface_enable = true;
      }
      //considering POPS line as the end
      if (strpos($str,"POPS")!==false) {
	$surface_enable = false;
	$index++;
      }
    }

    //surfaces array is ready
    $found_1st_glass = false;
    $xml = "";
    $distance = 0;

    for($i=0;$i<count($surfaces);$i++){
      $elem = $surfaces[$i];

      if (isset($elem["GLAS"])||isset($elem["STOP"])) {
	$xml.="\t<element>\n";
	$xml.="\t\t<distance>".$distance."</distance>\n";
	$xml.="\t\t<thickness>".trim($elem["DISZ"])."</thickness>\n";
	$xml.="\t\t<material>".$elem["GLAS"]."</material>\n";
	
	if (isset($elem["STOP"])) $xml.="\t\t<name>aperture stop</name>\n";
	else                      $xml.="\t\t<name></name>\n";

	$xml.="\t\t<front>\n";
	
	if (isset($elem["STOP"])) $xml.="\t\t\t<height>".(-2*$elem["DIAM"])."</height>\n";
	else                      $xml.="\t\t\t<height>".(+2*$elem["DIAM"])."</height>\n";
	
	if ($elem["CURV"]==0) $elem["CURV"]=0.000001;
	
	if (!isset($elem["STOP"])) $xml.="\t\t\t<rcurve>".(1/$elem["CURV"])."</rcurve>\n";
	else                      $xml.="\t\t\t<rcurve>0</rcurve>\n";
	$xml.="\t\t\t<k>0</k>\n";
	$xml.="\t\t\t<a1>0</a1>\n";
	$xml.="\t\t\t<a2>0</a2>\n";
	$xml.="\t\t\t<a3>0</a3>\n";
	$xml.="\t\t\t<a4>0</a4>\n";
	$xml.="\t\t</front>\n";
	$xml.="\t\t<back>\n";
	if (isset($elem["STOP"])) $xml.="\t\t\t<height>0</height>\n";
	else                      $xml.="\t\t\t<height>".(2*$surfaces[$i+1]["DIAM"])."</height>\n";
	
	if ($surfaces[$i+1]["CURV"]==0) $surfaces[$i+1]["CURV"]=0.000001;
	
	if (!isset($elem["STOP"])) $xml.="\t\t\t<rcurve>".(1/$surfaces[$i+1]["CURV"])."</rcurve>\n";
	else                      $xml.="\t\t\t<rcurve>0</rcurve>\n";
	$xml.="\t\t\t<k>0</k>\n";
	$xml.="\t\t\t<a1>0</a1>\n";
	$xml.="\t\t\t<a2>0</a2>\n";
	$xml.="\t\t\t<a3>0</a3>\n";
	$xml.="\t\t\t<a4>0</a4>\n";
	$xml.="\t\t</back>\n";
	$xml.="\t</element>\n";
	$found_1st_glass = true;
      }
      
      if ($found_1st_glass) $distance += $elem["DISZ"]; 
    }

    $final_xml = "<?xml version='1.0' encoding='UTF-8'?>\n<Document>\n".$xml."</Document>";

    return $final_xml;
}
?>