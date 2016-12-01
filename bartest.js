
// --- global variables
var full_dataset, filtered_dataset, gender_dataset;
var unique_columns, filtered_unique_columns;

var columns = [
    { head: 'Gender', cl: 'title', filter: [],
      html: function(r) { return r.Gender; } },
    { head: 'Riskgroup', cl: 'center', filter: [],
      html: function(r) { return r.Risk; } },
    { head: 'Infection Age', cl: 'num', filter: [],
      html: function(r) { return r.age_at_infection; } },
    { head: 'First Positive Test', cl: 'date', filter: [],
      html: function(r) { return r.first_positive_test_date; } },
    { head: 'Country of Infection', cl: 'center', filter: [],
      html: function(r) { return r.infection; } },
    { head: 'Country of Origin', cl: 'center', filter: [],
      html: function(r) { return r.origin; } },
    { head: 'Year of Birth', cl: 'num', filter: [],
      html: function(r) { return r.year_of_birth; } },
];

var agegroups, riskgroups, gendergroups, stopcausesgroup, countryofinfectiongroup;

d3.csv("data/patients_final.csv", function (data) {
    console.log(data);
    full_dataset = data;
    filtered_dataset = full_dataset;

    //array with all unique values / column, only needs to be generated once
    unique_columns = columns.map(x => get_unique_column(x.html));
    filtered_unique_columns = unique_columns;
	
	update_derived_data();
	
	gen_genderpie();
	gen_riskgroupsbars();
	
});


function resetgroups(){
	agegroups = [
	{min: 0, max: 15, string:"<15", count: 0, percent:0}];
	
	for(var i=1; i<11; i++){
	agegroups[i] = {min: 11+i*5, max: 15+i*5, string: (11+i*5) +"-" + (15+i*5), count: 0, percent: 0};
	}

	agegroups[11] = {min:56, max: 100, string:"56+", count: 0, percent:0}
	agegroups[12] = {min:-9999, max: -1, string:"unknown", count: 0, percent: 0}
	
	riskgroups = {
		"homosexual/bisexual": {abs: 0, percent: 0},
		"blood products": {abs: 0, percent: 0},
		"heterosexual": {abs: 0, percent: 0},
		"other": {abs: 0, percent: 0},
		"IVDA": {abs: 0, percent: 0},
		"vertical transmission": {abs: 0, percent: 0}, 
		"total": {abs: 0, percent: 0}
	};

	gendergroups = {"M": 0, "F": 0, "total": 0};
}


function update_derived_data() {
	//first reset the groups to start at 0 entries
	resetgroups();
	for (var i = 0; i < filtered_dataset.length; i++) {
		gendergroups[filtered_dataset[i].Gender]++;
		gendergroups["total"]++;
		riskgroups[filtered_dataset[i].Risk].abs++;
		riskgroups["total"].abs++;
		
		if(filtered_dataset[i].age_at_infection<=-1){
			agegroups[12].count++;
		} else if(filtered_dataset[i].age_at_infection <=15){
			agegroups[0].count++;
		} else if(filtered_dataset[i].age_at_infection >= 56){
			agegroups[11].count++;
		} else { 
			var index=Math.ceil((filtered_dataset[i].age_at_infection-15)/5);
			if(!isNaN(index)) agegroups[index].count++;
		}
	}
	
	//toDo StopCauses
	//toDo CountryOfInfection
	
	
	// update riskgroups percentages
	Object.keys(riskgroups).forEach((key, index) => {
		console.log(riskgroups[key]);
		riskgroups[key].percent = riskgroups[key].abs / riskgroups["total"].abs;
	});
	Object.keys(agegroups).forEach((key, index) => {
		console.log(agegroups[key]);
		agegroups[key].percent = agegroups[key].count / riskgroups["total"].abs;
	});
	
}
	
// toDo
function countStopCauses(){
	var ret = {"s1": 0};
	for (var i = 0; i < filtered_dataset.length; i++) {
		ret[filtered_dataset[i].Risk]++;
	}
	return ret;
}
// toDo
function countCountryOfInfection(){
	var ret = {"s1":0}
	for (var i = 0; i < filtered_dataset.length; i++) {
		ret[filtered_dataset[i].Risk]++;
	}
	return ret;
}


function gen_genderpie() {
	
var dataset = [
    { name: 'F', percent: gendergroups["F"]/gendergroups["total"]},
    { name: 'M', percent: gendergroups["M"]/gendergroups["total"]},
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


function update_filters() {
    console.log('new filter arrays:')
    //get currently selected (or unselected values for all ids in columns.head)
    for (var i = 0; i < columns.length; i++) {
        columns[i].filter = $('#'+columns[i].head).val();
        //if (!columns[i].filter)
    }

    // filter
    filtered_dataset = full_dataset.filter(filter_function);
    filtered_unique_columns = unique_columns.filter(filter_function);
	update_derived_data();	
	
    update_select_boxes();
    gen_genderpie();
}
	
function get_unique_column(attr_function) {
    var lookup = {};
    var result = [];

    for (var item, i = 0; item = full_dataset[i++];) {
      var name = attr_function(item);

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
    return result;
}	
	

function gen_riskgroupsbars(){
	


}

	
function gen_riskgroupsbars_tutorialclass() {
    var w = 500;
    var h = 300;
	
	var dict = countRiskGroups();

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
	
	// 0  bis maximum prozent?
    var hscale = d3.scaleLinear()
                         .domain([10,0])
                         .range([padding,h-padding]);
	// 0, so viele wie filter aktiv
    var xscale = d3.scaleLinear()
                         .domain([0,7])
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

function gen_agegroupsbars() {
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

function gen_stopcausebars() {
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



function gen_countryofinfectionbars() {
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


