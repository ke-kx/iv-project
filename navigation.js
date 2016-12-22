var navigation = (function () {
  var mod = {};
  var tip;
  //gender, riskgroup, agegroup, country x 2
  var selectors = ['riskgroup', 'agegroup', 'infection', 'origin'];

  // private variable = var private = 1;
  // private method = functions here
  // module property = mod.x = 10;

  mod.setup = function () {
    setup_genderpie();
    setup_select_boxes();
    create_navigation_buttons();
  }


  mod.update = function (current_graph) {
    update_genderpie();
    update_select_boxes(current_graph);
  }

  function create_navigation_buttons() {
    var buttons = [
      {string: "Overview", display: bars, name:"overviewButton"},
      {string: "Compare riskgroups", display: riskgroups_chart, name:"riskgroupsButton"},
      {string: "Compare countries", display: bars, name:"countriesButton"}
      //{string: "See table", display: table, name:"tableButton"} // debug
    ];

    d3.select("#buttons")
      .selectAll('button').data(buttons).enter()
      .append('button')
      .attr('id', x=> x.name)
      .attr('class', 'btn btn-primary')
      .style('margin-left','5px')
      .style('margin-right','15px')
      .style('margin-top','5px')
      .on('click', x => change_view(x.display))
      .html(x => x.string);

  }

  function setup_select_boxes(current_graph) {
    // create one selection box for each set
    var select_boxes = d3.select('#selectors')
      .selectAll('select')
      .data(selectors).enter()
      .append('select')
      .attr('class', 'selectpicker').attr('multiple', 'multiple')
      .attr('title', function(d,i){return "Choose " + selectors[i];})
      .attr('data-actions-box', 'true')
      .attr('id', x => x)
      .attr('data-width', "160px")
      .attr('margin-top', "20px")
      .on('change', x => update());

    // enable search for the two country select boxes
    d3.select('#infection').attr('data-live-search', 'true');
    d3.select('#origin').attr('data-live-search', 'true');
  }


  function update_select_boxes(current_graph){
    //gender, riskgroup, agegroup, country x 2
    var select_data = [
      filtered_unique_columns[1],
      filtered_agegroups.map(x => x.string),
      filtered_unique_columns[4], // country of infection
      filtered_unique_columns[5]  // country of origin
    ];

    //manipulate selector boxes for riskgroupsview
    if(current_graph == riskgroups_chart){
      select_data[0] = [];

      d3.select('#selectors')
        .select('#riskgroup').attr('disabled', false);

      d3.select('#selectors')
        .select('#agegroup').attr('maxOptions', 2)
    } else {
      d3.select('#selectors')
        .select('#riskgroup').attr('disabled', null);
    }

    // save selected values of all select boxes
    var selected_values = [];
    for (var i in selectors) {
      selected_values[i] = $('#' + selectors[i]).val();
    }

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

    //finally select all the correct values and render display again
    for (var i in selectors) {
      $('#' + selectors[i]).val(selected_values[i]);
    }
    $('.selectpicker').selectpicker('render');
  }

  function setup_genderpie() {
    var dataset = [
      { name: 'F', percent: 0.7},
      { name: 'M', percent: 0.3}
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
      .each(function(d) { this._current = {startAngle: 0, endAngle: 0}; }) // make the pie popup from 0
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
    else columns[0].filter = [d.data.name];
    tip.hide();
    update();
  }

  function update_genderpie() {
    var dataset = [
      { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
      { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
    ];

    if (filtered_dataset.length == 0) {
      dataset[0].percent = 0;
      dataset[1].percent = 0;
    }

    var pie=d3.pie()
      .value(function(d){return d.percent})
      .sort(null)
      .padAngle(.00);

    var w=170,h=200, radius = Math.min(w,h) / 2;
    var arc=d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 50);

    tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d,i) {
      return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round(d.data.percent*10000/100) + "%</span> \
        <br><strong>Total:</strong> <span style='color:red'>" +  gendergroups[d.data.name] + " / " + filtered_dataset.length + "</span>";
      })

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var svg = d3.select("#Gender").select("svg");
    var path = svg.selectAll('path').data(pie(dataset));
    var text = svg.selectAll('text').data(pie(dataset));

    path.attr("d",arc)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    text.transition().duration(750)
      .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
      .attr("dy", ".35em").text(function(d) {
        return (d.data.percent == 0) ? "" : d.data.name;
      });

    svg.call(tip);

    path.transition()
      .duration(750)
      .attrTween('d', function(d) {
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
    });
  }

  return mod;
}());
