<?php
/*
FILE NAME  : convert_len.php
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

function convert_len($path){
    $contents = file_get_contents($path);
    $lines = explode("\n",$contents);
    $surface_enable=false;
    $index = 0;
    $surfaces = Array();

    for($i=0;$i<count($lines);$i++){
      //$str = mb_convert_encoding ($lines[$i], 'UTF-8', 'UTF-16');
      $str = $lines[$i];
      if ($surface_enable){
	  $s= explode(' ',$str);
	  foreach ($s as $a=>$b){    
	    $tmp = trim($b);
	    if ($tmp=="RD")  {$surfaces[$index]["RD"]=$s[$a+3];break;}
	    if ($tmp=="TH")  {$surfaces[$index]["TH"]=$s[$a+3];break;}
	    if ($tmp=="GLA") {$surfaces[$index]["GLA"]=$s[$a+1];break;}
	    if ($tmp=="AP")  {$surfaces[$index]["AP"]=$s[$a+2];break;}
	    if ($tmp=="AST") {$surfaces[$index]["AST"]=true;break;}
	  }
      }
      //considering POPS line as the end
      if (strpos($str,"NXT")!==false) {
	$surface_enable = false;
	$index++;
      }
      if (strpos($str,"NXT")!==false) {
	$surface_enable = true;
      }
      if (strpos($str,"FNO")!==false){
	$s= explode(' ',$str);
	$fn = $s[2];
      }
      if (strpos($str,"LEN")!==false){
	$s= explode(' ',$str);
	$f = $s[3];
      }
    }

    //surfaces array is ready
    $found_1st_glass = false;
    $xml = "";
    $distance = 0;

    for($i=0;$i<count($surfaces);$i++){
      $elem = $surfaces[$i];

      if (isset($elem["GLA"])||isset($elem["AST"])) {
	$xml.="\t<element>\n";
	$xml.="\t\t<distance>".$distance."</distance>\n";
	$xml.="\t\t<thickness>".$elem["TH"]."</thickness>\n";
	$xml.="\t\t<material>".$elem["GLA"]."</material>\n";
	
	if (isset($elem["AST"])) $xml.="\t\t<name>aperture stop</name>\n";
	else                     $xml.="\t\t<name></name>\n";

	$xml.="\t\t<front>\n";
	
	if (isset($elem["AST"])) $xml.="\t\t\t<height>".(-$f/$fn)."</height>\n";
	else                     $xml.="\t\t\t<height>".(+2*$elem["AP"])."</height>\n";
	
	if ($elem["RD"]==0) $elem["RD"]=100000;
	
	if (!isset($elem["AST"])) $xml.="\t\t\t<rcurve>".($elem["RD"])."</rcurve>\n";
	else                      $xml.="\t\t\t<rcurve>0</rcurve>\n";
	$xml.="\t\t\t<k>0</k>\n";
	$xml.="\t\t\t<a1>0</a1>\n";
	$xml.="\t\t\t<a2>0</a2>\n";
	$xml.="\t\t\t<a3>0</a3>\n";
	$xml.="\t\t\t<a4>0</a4>\n";
	$xml.="\t\t</front>\n";
	$xml.="\t\t<back>\n";
	if (isset($elem["AST"])) $xml.="\t\t\t<height>0</height>\n";
	else                     $xml.="\t\t\t<height>".(2*$surfaces[$i+1]["AP"])."</height>\n";
	
	if ($surfaces[$i+1]["RD"]==0) $surfaces[$i+1]["RD"]=100000;
	
	if (!isset($elem["AST"])) $xml.="\t\t\t<rcurve>".($surfaces[$i+1]["RD"])."</rcurve>\n";
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
      
      if ($found_1st_glass) $distance += $elem["TH"]; 
    }

    $final_xml = "<?xml version='1.0' encoding='UTF-8'?>\n<Document>\n".$xml."</Document>";

    return $final_xml;
}
?>