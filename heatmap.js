var heatmap = (function () {
  var mod = {};

  // locals
  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize*2,
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
    {string: "Riskgroups", attrFunction: x => x.riskgroups}
  ];

  mod.setup = function () {
    mod.attrFunction = attrFunction = x => x.gender;
    update_data();

    create_heatmap(true, heatmapData);
    create_heatmap(false, heatmapData);
  };

  mod.update = function () {
    update_data();
    create_heatmap(false, heatmapData);
  }

/*
  function load_data (cb) {
    paths = ["data/test1.tsv", "data/test2.tsv"];
    d3.tsv(paths[0], function(d) {
      return {
        day: +d.day,
        hour: +d.hour,
        value: +d.value
      };
    }, function(error, data) {
      console.log(data);
      datasets[0] = data;

      d3.tsv(paths[1], function(d) {
        return {
          day: +d.day,
          hour: +d.hour,
          value: +d.value
        };
      }, function(error, data) {
        console.log(data);
        datasets[1] = data;
        cb();
      });
    });
  }
*/

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
    //TODO: add more potential data

    //TODO: enable for both, origin and infection
    dataset = data.get_unique_column(x => x.infection, filtered_dataset); // infection

    country_values = {};
    for (var i in dataset) {
      country_values[dataset[i]] = {
        string: dataset[i],
        total: 0,
        gender: {M: 0, F: 0},
        riskgroups: $.extend(true, {}, empty_rg)
      };
    }

    var i, patient, country;
    for ( i = 0; i < filtered_dataset.length; i++) {
      patient = filtered_dataset[i];
      country = country_values[patient.infection];

      country.total++;
      country.riskgroups[patient.Risk]++;
      country.gender[patient.Gender]++;
    }

    var country_array = Object.values(country_values);
    topData = Object.keys(country_array.map(mod.attrFunction)[0]);

    // fill datastructure by iterating through all countries and the chosen data
    heatmapData = [];
    var i, j, current_country, current_data, current_data_array;
    for ( i in country_array) {
      current_country = country_array[i];
      current_data = mod.attrFunction(current_country);
      current_data_array = Object.values(current_data)

      for ( j in current_data_array) {
        heatmapData.push ( {
          country: i,
          top: j,
          value: 100 * current_data_array[j] / current_country.total
        })
      }
    }
  }

  function create_heatmap (first_time, data) {

    if (first_time) {
      console.log("ADDING HEATMAP BUTTONS")
      d3.select('#navigation').select('#heatmap_buttons')
        .selectAll('button').data(heatmap.buttons).enter()
        .append('button')
        .attr('id', x=> x.name)
        .attr('class', 'btn btn-secondary')
        .style('margin-left','5px')
        .style('margin-right','15px')
        .style('margin-top','5px')
        .on('click', x => {
          console.log(x);
          mod.attrFunction = x.attrFunction;
          mod.update();
        })
        .html(x => x.string);

      var svg = d3.select("#content").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    } else {
      var svg = d3.select('#content').select('g');
    }

    // modifying / adding top labels
    console.log(topData);
    var topLabels = svg.selectAll(".timeLabel").data(topData)
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    topLabels.enter()
      .append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
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

    console.log(data);

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
      .style("fill", colors[0]);

    cards.transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.value); });

    cards.select("title").text(function(d) { return d.value; });

    cards.exit().remove();

    var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) { return d; });

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
