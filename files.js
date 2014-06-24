/*
FILE NAME  : files.js
DESCRIPTION: optical design
REVISION: 1.00
AUTHOR: Oleg Dzhimiev <oleg@elphel.com>
LICENSE: AGPL, see http://www.gnu.org/licenses/agpl.txt
Copyright (C) 2014 Elphel, Inc.
*/

function save_design(){
  console.log("save_design(): "+$("#file_to_save").val());
  var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Document>\n"; 
  $(".elements").each(function(i){
    //console.log($(this).find("#distance").val()+" ")
    xml += "\t<element>\n";
    xml += "\t\t<distance>"+e[i].d+"</distance>\n";
    xml += "\t\t<thickness>"+e[i].t+"</thickness>\n";
    xml += "\t\t<material>"+e[i].m+"</material>\n";
    xml += "\t\t<name>"+e[i].name+"</name>\n";
    xml += "\t\t<front>\n";
    xml += "\t\t\t<height>"+e[i].front.h+"</height>\n";
    xml += "\t\t\t<rcurve>"+e[i].front.c+"</rcurve>\n";
    xml += "\t\t\t<k>"+e[i].front.k+"</k>\n";
    xml += "\t\t\t<a1>"+e[i].front.a[0]+"</a1>\n";
    xml += "\t\t\t<a2>"+e[i].front.a[1]+"</a2>\n";
    xml += "\t\t\t<a3>"+e[i].front.a[2]+"</a3>\n";
    xml += "\t\t\t<a4>"+e[i].front.a[3]+"</a4>\n";
    xml += "\t\t</front>\n";
    xml += "\t\t<back>\n";
    xml += "\t\t\t<height>"+e[i].back.h+"</height>\n";
    xml += "\t\t\t<rcurve>"+e[i].back.c+"</rcurve>\n";
    xml += "\t\t\t<k>"+e[i].back.k+"</k>\n";
    xml += "\t\t\t<a1>"+e[i].back.a[0]+"</a1>\n";
    xml += "\t\t\t<a2>"+e[i].back.a[1]+"</a2>\n";
    xml += "\t\t\t<a3>"+e[i].back.a[2]+"</a3>\n";
    xml += "\t\t\t<a4>"+e[i].back.a[3]+"</a4>\n";
    xml += "\t\t</back>\n";
    xml += "\t</element>\n";
  });
  xml += "</Document>"
  postSettings($("#file_to_save").val(), "save", xml);
}

function postSettings(file, cmd, xml) { 
    $.ajax({
	url: "files.php?file="+file+"&cmd="+cmd,
	type: "POST",
	dataType: "xml",
	data: xml,
	async:false,
	complete: function(response){parse_save_response(response.responseText);},
	contentType: "text/xml; charset=\"utf-8\""
    });
}

function parse_save_response(text) {
    //$("#test").html(text);
    //reload list
    get_designs_list("load_designs_list");
    jquery_list("load_designs_list","Load",load_design);
}

function getDesign(file) {
    $.ajax({
	url: "files.php?file="+file+"&cmd=read",
	type: "GET",
	async: false,
	complete: function(response){
	      restore_design(response.responseXML);
	},
	contentType: "text/xml; charset=\"utf-8\""
    });
}

function restore_design(text){
      console.log("restore_design()");
      
      //erase old
      $(".elements").each(function(){
	  console.log("removing "+$(this).attr("value"));
	  array_remove_element($(this).attr("value"));
// 	  $("#element_"+i).remove();
// 	  $("#cnv1").removeLayer("element_"+i).drawLayers();
      });
      selected_elements = Array();
      
      //draw new
      var data = $(text).find("Document");
      data.find("element").each(function(){
	array_add_element(
	  $(this).find("distance").text(),
	  $(this).find("thickness").text(),
	  $(this).find("material").text(),
	  $(this).find("name").text(),
	  $(this).find("front").find("height").text(),
	  $(this).find("front").find("rcurve").text(),
	  $(this).find("front").find("k").text(),
	  $(this).find("front").find("a1").text(),
	  $(this).find("front").find("a2").text(),
	  $(this).find("front").find("a3").text(),
	  $(this).find("front").find("a4").text(),
	  $(this).find("back").find("height").text(),
	  $(this).find("back").find("rcurve").text(),
	  $(this).find("back").find("k").text(),
	  $(this).find("back").find("a1").text(),
	  $(this).find("back").find("a2").text(),
	  $(this).find("back").find("a3").text(),
	  $(this).find("back").find("a4").text()
	);
      });
      
      
      
}