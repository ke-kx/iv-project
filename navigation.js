var navigation = (function () {
  var mod = {};
   var tip;

  // private variable = var private = 1;
  // private method = functions here
  // module property = mod.x = 10;

  mod.setup = function () {
    setup_genderpie();
    setup_select_boxes();
    create_navigation_buttons();
  }

  mod.update = function () {
    update_genderpie();
    update_select_boxes();
  }

  function create_navigation_buttons() {
    var buttons = [
      {string: "Overview", display: bars},
      {string: "Compare countries", display: bars},
      {string: "Compare riskgroups", display: bars},
      {string: "See table", display: table}
    ];

    d3.select("#buttons")
      .selectAll('button').data(buttons).enter()
      .append('button')
      .attr('class', 'btn btn-default')
      .on('click', x => change_view(x.display))
      .html(x => x.string);
  }

  function setup_select_boxes() {
    //gender, riskgroup, agegroup, country x 2
    var selectors = ['riskgroup', 'agegroup', 'infection', 'origin'];

    // create one selection box for each set
    var select_boxes = d3.select('#selectors')
      .selectAll('select')
      .data(selectors).enter()
      .append('select')
      .attr('class', 'selectpicker').attr('multiple', 'multiple')
	  .attr('title', function(d,i){return "Choose " + selectors[i];})
      .attr('data-live-search', 'true')
	  .attr('id', x => x)
      .attr('data-width', "160px")
      .on('change', x => update());
  }

  
  function update_select_boxes(){
    //gender, riskgroup, agegroup, country x 2
    var select_data = [
      filtered_unique_columns[1],
      agegroups.map(x => x.string),
      filtered_unique_columns[4], // country of infection
      filtered_unique_columns[5]  // country of origin
    ];

    // select all select boxes options and connect them with new data
    var select_contents = d3.select('#selectors').selectAll('select').data(select_data)
      .selectAll('option')
      .data((row, i) => select_data[i]);

    // update existing elements
    select_contents.text(function(x) {return x});

    // create new elements as needed
    select_contents.enter()
      .append('option')
      .text(function(x) {return x});

    // remove old elements
    select_contents.exit().remove();

    // necessary call to update the select box display
    $('.selectpicker').selectpicker('refresh');
  }

  function setup_genderpie() {
    var dataset = [
      { name: 'F', percent: 0.5},
      { name: 'M', percent: 0.5}
    ];

    var pie=d3.pie()
      .value(function(d){return d.percent})
      .sort(null)
      .padAngle(.03);
    var w=170,h=200, radius = Math.min(w,h) / 2;
    var arc=d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 50);
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var svg=d3.select("#Gender")
      .append("svg")
      .attr("width", w).attr("height",h)
      .attr("class", 'shadow').append('g')
      .attr("transform", 'translate('+w/2+','+h/2+')');

    var path=svg.selectAll('path')
      .data(pie(dataset)).enter()
      .append('path').attr("d",arc)
      .attr("fill", function(d,i){return color(d.data.name);})
      .on('click', catch_genderpie_click);
    svg.selectAll('text')
      .data(pie(dataset)).enter()
      .append('text')
      .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
      .attr("dy", ".35em").text(function(d) { return d.data.name; });
  }

  function catch_genderpie_click (d) {
    if (columns[0].filter.includes(d.data.name)) columns[0].filter = [];
    else  columns[0].filter = [d.data.name];
	tip.hide();
    update();
  }

  function update_genderpie() {
    var dataset = [
      { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
      { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
	];

    var pie=d3.pie()
      .value(function(d){return d.percent})
      .sort(null)
      .padAngle(.03);

    var w=170,h=200, radius = Math.min(w,h) / 2;
    var arc=d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 50);

   tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d,i) {
        //return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%<br>Total:" + d.count + "</span>";
	  return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round(d.data.percent*10000/100) + "%</span> \
          <br><strong>Total:</strong> <span style='color:red'>" +  gendergroups[d.data.name] + " / " + filtered_dataset.length + "</span>";
    })

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var svg = d3.select("#Gender").select("svg");
    var path = svg.selectAll('path').data(pie(dataset));

    //path.enter().attr("d",arc)
	path.attr("d",arc)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    svg.call(tip);

    svg.selectAll('text')
      .data(pie(dataset)).enter()
      .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
      .attr("dy", ".35em").text(function(d) { return d.data.name; })
      .exit().remove();

    path.transition()
      .duration(750)
      .attrTween('d', function(d) {
        var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
          return arc(interpolate(t));
        };
    });
  }

  return mod;
}());
