debugger;
var data = [

        {
          "week": 1, 
          "day" : 1, 
          "value": 6
        }, 
        {
          "week": 1, 
          "day" : 2, 
          "value": 7
        }, 
        {
          "week": 1, 
          "day" : 3, 
          "value": 9
        }, 
        {
          "week": 1, 
          "day" : 4, 
          "value": 11
        }, 
        {
          "week": 1, 
          "day" : 5, 
          "value": 8
        }, 
        {
          "week": 1, 
          "day" : 6, 
          "value": 9
        }, 
        {
          "week": 1, 
          "day" : 7, 
          "value": 12
        }, 
        {
          "week": 2, 
          "day" : 1, 
          "value": 7
        }, 
        {
          "week": 2, 
          "day" : 2, 
          "value": 9
        }, 
        {
          "week": 2, 
          "day" : 3, 
          "value": 2
        },
        {
          "week": 2, 
          "day" : 4, 
          "value": 8
        },
        {
          "week": 2, 
          "day" : 5, 
          "value": 4
        },
        {
          "week": 2, 
          "day" : 6, 
          "value": 5
        },
        {
          "week": 2, 
          "day" : 7, 
          "value": 6
        },


    ]; 

var colorDomain = d3.extent(data, function(d){
  return d.value;
});

var w = 500, h = 500;

var colorScale = d3.scaleLinear()
  .domain(colorDomain)
  .range(["lightblue","blue"]);

var svg = d3.select("#heatmap")
	.append("svg")
	.attr("width", w)
		
var rectangles = svg.selectAll("rect")
  .data(data)
  .enter()
  .append("rect"); 

rectangles.attr("x", function(d){ return d.day * 50; })
	.attr("y", function(d){ return d.week * 50; })
	.attr("width", 50)
	.attr("height", 50)
	.style("fill", function(d){ return colorScale(d.value); });    