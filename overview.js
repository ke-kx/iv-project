
var dataset, full_dataset;



d3.json("data/oscar_winners.json", function (data) {
    full_dataset = data;
    dataset = full_dataset.slice(0,35);
    gen_bars1();
 	gen_bars2();
	gen_bars3();
    gen_bars4();
	gen_pie();
});

  var dispatch = d3.dispatch("movieEnter");
  var selectedBar, selectedCircle;
dispatch.on("movieEnter.scatterplot", function(movie){
		if(selectedCircle != null){
			selectedCircle.attr("fill", "purple")
		}
		selectedCircle = d3.select("circle[title=\'"+movie.title+"\']")
		selectedCircle.attr("fill", "red");
	})

dispatch.on("movieEnter.bars", function(movie){
		if(selectedBar != null){
			selectedBar.attr("fill", "purple")
		}
		selectedBar = d3.select("rect[title=\'"+movie.title+"\']")
		selectedBar.attr("fill", "red");
	})


	function gen_pie() {
var dataset = [
    { name: 'F', percent: 38.49 },
    { name: 'M', percent: 61.51 },
];

var pie=d3.pie()
  .value(function(d){return d.percent})
  .sort(null)
  .padAngle(.03);

var w=150,h=200, radius = Math.min(w,h) / 2;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var arc=d3.arc()
  .outerRadius(radius - 10)
  .innerRadius(radius - 50);

var svg=d3.select("#Gender")
  .append("svg")
  .attr("width", w)
  .attr("height",h)
  .attr("class", 'shadow').append('g')
  .attr("transform", 'translate('+w/2+','+h/2+')');

var path=svg.selectAll('path')
  .data(pie(dataset))
  .enter()
  .append('path')
  .attr("d",arc)
  .attr("fill", function(d,i){return color(d.data.name);});

var text = svg.selectAll('text')
	.data(pie(dataset))
	.enter()
	.append('text')
	.attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
	.attr("dy", ".35em")
	.text(function(d) { return d.data.name; });

path.transition()
  .duration(750)
  .attrTween('d', function(d) {
      var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
      return function(t) {
          return arc(interpolate(t));
      };
  });
}


function gen_bars1() {
    var w = 500;
    var h = 300;

    var svg = d3.select("#bars1")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
				.attr("id", "riskgroups")

	svg.append("text")
		.attr("x", (w / 2))
        .attr("y", 35)
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.text("Risk Groups");

    var padding = 30;
    var bar_w = 15;

    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);

    var xscale = d3.scaleLinear()
                         .domain([0,dataset.length])
                         .range([padding,w-padding]);

    var yaxis = d3.axisLeft()
                  .scale(hscale);

    var xaxis = d3.axisBottom()
              .scale(d3.scaleLinear()
              .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
              .range([padding+bar_w/2,w-padding-bar_w/2]))
              .tickFormat(d3.format("d"))
              .ticks(dataset.length/4);
              //.ticks(20);



    svg.append("g")
   	.attr("transform","translate(30,0)")
	.attr("class","y axis")
	.call(yaxis);

    svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	.call(xaxis);


    svg.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("width",Math.floor((w-padding*2)/dataset.length)-1)
    .attr("height",function(d) {
                          return h-padding-hscale(d.rating);
                   })
     .attr("fill","purple")
     .attr("x",function(d, i) {
                          return xscale(i);
                   })
     .attr("y",function(d) {
                   return hscale(d.rating);
                   })
     .attr("title", function(d) {return d.title;})
	 .on("mouseover", function(d){dispatch.call("movieEnter",d,d);});

}

function gen_bars2() {
    var w = 500;
    var h = 300;

    var svg = d3.select("#bars1")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
				.attr("id", "agegroups")

	svg.append("text")
		.attr("x", (w / 2))
        .attr("y", 35)
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.text("Age Groups");


    var padding = 30;
    var bar_w = 15;

    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);

    var xscale = d3.scaleLinear()
                         .domain([0,dataset.length])
                         .range([padding,w-padding]);


    var yaxis = d3.axisLeft()
                  .scale(hscale);

    var xaxis = d3.axisBottom()
              .scale(d3.scaleLinear()
              .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
              .range([padding+bar_w/2,w-padding-bar_w/2]))
              .tickFormat(d3.format("d"))
              .ticks(dataset.length/4);
              //.ticks(20);



    svg.append("g")
   	.attr("transform","translate(30,0)")
	.attr("class","y axis")
	.call(yaxis);

    svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	.call(xaxis);


    svg.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("width",Math.floor((w-padding*2)/dataset.length)-1)
    .attr("height",function(d) {
                          return h-padding-hscale(d.rating);
                   })
     .attr("fill","purple")
     .attr("x",function(d, i) {
                          return xscale(i);
                   })
     .attr("y",function(d) {
                   return hscale(d.rating);
                   })
     .attr("title", function(d) {return d.title;})
	 .on("mouseover", function(d){dispatch.call("movieEnter",d,d);});

}

function gen_bars3() {
    var w = 500;
    var h = 300;

    var svg = d3.select("#bars2")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
				.attr("id", "stopcause")

	svg.append("text")
		.attr("x", (w / 2))
        .attr("y", 35)
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.text("Stop Causes");

    var padding = 30;
    var bar_w = 15;

    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);

    var xscale = d3.scaleLinear()
                         .domain([0,dataset.length])
                         .range([padding,w-padding]);


    var yaxis = d3.axisLeft()
                  .scale(hscale);

    var xaxis = d3.axisBottom()
              .scale(d3.scaleLinear()
              .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
              .range([padding+bar_w/2,w-padding-bar_w/2]))
              .tickFormat(d3.format("d"))
              .ticks(dataset.length/4);
              //.ticks(20);



    svg.append("g")
   	.attr("transform","translate(30,0)")
	.attr("class","y axis")
	.call(yaxis);

    svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	.call(xaxis);


    svg.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("width",Math.floor((w-padding*2)/dataset.length)-1)
    .attr("height",function(d) {
                          return h-padding-hscale(d.rating);
                   })
     .attr("fill","purple")
     .attr("x",function(d, i) {
                          return xscale(i);
                   })
     .attr("y",function(d) {
                   return hscale(d.rating);
                   })
     .attr("title", function(d) {return d.title;})
	 .on("mouseover", function(d){dispatch.call("movieEnter",d,d);});

}



function gen_bars4() {
    var w = 500;
    var h = 300;

    var svg = d3.select("#bars2")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
				.attr("id", "countryofinfection")

	svg.append("text")
		.attr("x", (w / 2))
        .attr("y", 35)
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.text("Country of infection");


    var padding = 30;
    var bar_w = 15;

    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);

    var xscale = d3.scaleLinear()
                         .domain([0,dataset.length])
                         .range([padding,w-padding]);


    var yaxis = d3.axisLeft()
                  .scale(hscale);

    var xaxis = d3.axisBottom()
              .scale(d3.scaleLinear()
              .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
              .range([padding+bar_w/2,w-padding-bar_w/2]))
              .tickFormat(d3.format("d"))
              .ticks(dataset.length/4);
              //.ticks(20);



    svg.append("g")
   	.attr("transform","translate(30,0)")
	.attr("class","y axis")
	.call(yaxis);

    svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	.call(xaxis);


    svg.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("width",Math.floor((w-padding*2)/dataset.length)-1)
    .attr("height",function(d) {
                          return h-padding-hscale(d.rating);
                   })
     .attr("fill","purple")
     .attr("x",function(d, i) {
                          return xscale(i);
                   })
     .attr("y",function(d) {
                   return hscale(d.rating);
                   })
     .attr("title", function(d) {return d.title;})
	 .on("mouseover", function(d){dispatch.call("movieEnter",d,d);});

}



function gen_scatterplot() {
    var w = 500;
    var h = 300;

    var svg = d3.select("#the_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",h)
		.attr("fill", "blue");


    var padding = 30;
    var bar_w = 15;
    var r = 5;



    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);

    var xscale = d3.scaleLinear()
                       .domain([0.5,d3.max(dataset, function(d) {
				    return d.budget;})/1000000])
                       .range([padding,w-padding]);

    var yaxis = d3.axisLeft()
                  .scale(hscale);

    var xaxis = d3.axisBottom()
	.scale(xscale)
              .ticks(dataset.length/2);

    var cscale = d3.scaleLinear()
         .domain([d3.min(dataset, function(d) { return  d.year;}),
                  d3.max(dataset, function(d) { return d.year;})])
         .range(["red", "blue"]);


   gY = svg.append("g")
   	.attr("transform","translate(30,0)")
	.attr("class","y axis")
	.call(yaxis);


    gX = svg.append("g")
   	.attr("transform","translate(0," + (h-padding) + ")")
	.call(xaxis);

   svg.selectAll("circle")
       .data(dataset)
     .enter().append("circle")
       .attr("r",r)
       .attr("fill","purple")
       .attr("cx",function(d, i) {
			if (d.budget_adj == 0) {return padding;}
                        return  xscale(d.budget_adj/1000000);
                 })
       .attr("cy",function(d) {
                 return hscale(d.rating);
                 })
       .attr("title", function(d) {return d.title;})
	   .on("mouseover", function(d) { dispatch.call("movieEnter", d, d);});






}
