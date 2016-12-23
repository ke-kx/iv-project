var heatmap = (function () {
  var mod = {};

  // locals
  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSize = Math.floor(height / 7),
    legendElementWidth = gridSize,
    buckets = 9,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
  //var datasets = [];
  var topData, heatmapData;

  // exported variables
  mod.attrFunction;
  mod.buttons = [
    {string: "Gender", attrFunction: x => x.gender},
    {string: "Riskgroups", attrFunction: x => x.riskgroups},
    {string: "Stopcauses", attrFunction: x => x.stopcauses}
  ];

  mod.setup = function () {
    mod.attrFunction = x => x.gender;
    update_data();

    create_heatmap(true, heatmapData);
    create_heatmap(false, heatmapData);
  };

  mod.update = function () {
    update_data();
    create_heatmap(false, heatmapData);
  }

  function update_data () {
    // empty stuff for all
    var empty_rg = {
      "homosexual/bisexual": 0,
      "blood products": 0,
      "heterosexual": 0,
      "other": 0,
      "IVDA": 0,
      "vertical transmission": 0
    };

    var empty_sc = {};
    for (var i in unique_stop_causes) {
      empty_sc[unique_stop_causes[i]] = 0;
    }
    console.log(empty_sc);

    //TODO: enable for both, origin and infection
    dataset = $('#infection').val(); // infection

    country_values = {};
    for (var i in dataset) {
      country_values[dataset[i]] = {
        string: dataset[i],
        total: 0,
        sc_total: 0,
        gender: {M: 0, F: 0},
        riskgroups: $.extend(true, {}, empty_rg),
        stopcauses: $.extend(true, {}, empty_sc)
      };
    }

    var i, j, patient, country;
    for ( i = 0; i < filtered_dataset.length; i++) {
      patient = filtered_dataset[i];
      country = country_values[patient.infection];

      if (country) {
        country.total++;
        country.riskgroups[patient.Risk]++;
        country.gender[patient.Gender]++;

        for (j in patient.therapies) {
          country.sc_total++;
          country.stopcauses[patient.therapies[j].stop_cause_desc]++;
        }
      }
    }

    heatmapData = [];
    var country_array = Object.values(country_values);
    topData = [];
    if (country_array.length > 0) {
      topData = Object.keys(country_array.map(mod.attrFunction)[0]);

      // fill datastructure by iterating through all countries and the chosen data
      var i, j, current_country, current_data, current_data_array;
      for ( i in country_array) {
        current_country = country_array[i];
        current_data = mod.attrFunction(current_country);
        current_data_array = Object.values(current_data)

        //dirtyyy fix for stop causes correct total
        if (mod.attrFunction == mod.buttons[2].attrFunction) {
          console.log("using sc_total!");
          current_country.total = current_country.sc_total;
        }

        for ( j in current_data_array) {
          heatmapData.push ( {
            country: i,
            top: j,
            value: current_country.total>0 ? 100 * current_data_array[j] / current_country.total : 0
          })
        }
      }
    }

    var ind = topData.indexOf("homosexual/bisexual");
    if (ind != -1) {
      topData[ind] = "homosexual";
    }

    ind = topData.indexOf("vertical transmission");
    if (ind != -1) {
      topData[ind] = "vert. trans.";
    }

    if (mod.attrFunction == mod.buttons[2].attrFunction) {
      console.log(topData);
      topData[topData.indexOf('0')] = 'unknown';
      topData[topData.indexOf('Compliance problems')] = 'Compl. problems';
      topData[topData.indexOf('Immunological failure')] = 'Imn. failure';
      topData[topData.indexOf('Patients own wish')] = 'Patients wish';

    }
  }

  function create_heatmap (first_time, data) {

    if (first_time) {
      d3.select('#navigation').select('#heatmap_buttons')
        .selectAll('button').data(heatmap.buttons).enter()
        .append('button')
        .attr('id', x=> x.name)
        .attr('class', 'btn btn-secondary')
        .style('margin-left','5px')
        .style('margin-right','15px')
        .style('margin-top','5px')
        .on('click', x => {
          mod.attrFunction = x.attrFunction;
          mod.update();
        })
        .html(x => x.string);

      var svg = d3.select("#content").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left * 3 + "," + margin.top + ")");
    } else {
      var svg = d3.select('#content').select('g');
    }

    // modifying / adding top labels
    var topLabels = svg.selectAll(".timeLabel").data(topData)
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", function(d, i) { return (i % 2 == 0) ? 0 : -10; })
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    topLabels.enter()
      .append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", function(d, i) { return (i % 2 == 0) ? 0 : -10; })
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    topLabels.exit().remove();

    // modifying / adding left labels
    var leftLabels = svg.selectAll(".dayLabel").data(Object.keys(country_values))
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    leftLabels.enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    leftLabels.exit().remove();

    var colorScale = d3.scaleQuantile()
      .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
      .range(colors);

    var cards = svg.selectAll(".hour")
      .data(data, function(d) {return d.country+':'+d.top;});

    cards.append("title");

    cards.enter().append("rect")
      .attr("x", function(d) { return (d.top) * gridSize; })
      .attr("y", function(d) { return (d.country) * gridSize; })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "hour bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0])
      .transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.value); });

    cards.transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.value); });

    cards.select("title").text(function(d) { return Math.round(d.value*100)/100 + ' %'; });

    cards.exit().remove();

    create_legend(svg, colorScale);
    create_legend(svg, colorScale);
  }

  function create_legend(svg, colorScale) {
    var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.selectAll('*').remove();

    legend.enter().append("g")
      .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + margin.bottom/2)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + margin.bottom/2 + gridSize);

    legend.exit().remove();
  }

  return mod;
}());
