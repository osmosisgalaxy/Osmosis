var w="90%",h=500;flag=0;
var svg=d3.select("#chart")
	.append("svg")
	.attr("width",w).attr("height",h).attr("id","vTreeMap");

var myRect=svg
.append( "rect").attr({x:0,y:0,width:"70%",height:500})
.style("fill","steelblue");

var rect2 = svg
	.append("rect").attr({width:"30%",height:500})
	.style("fill","blue");

myRect.on("click",function() {
flag=1-flag;
myRect.style("fill", flag?"darkorange":"steelblue");
});