
// --- global variables
var full_dataset, filtered_dataset, gender_dataset;
var unique_columns, filtered_unique_columns;
var agegroups, riskgroups, gendergroups, stopcausesgroup, countryofinfectiongroup;

var columns = [
  { head: 'Gender', cl: 'gender', filter: [],
    html: function(r) { return r.Gender; } },
  { head: 'Riskgroup', cl: 'riskgroup', filter: [],
    html: function(r) { return r.Risk; } },
  { head: 'Infection Age', cl: 'age_at_infection', filter: [],
    html: function(r) { return r.age_at_infection; } },
  { head: 'First Positive Test', cl: 'first_positive_test_date', filter: [],
    html: function(r) { return r.first_positive_test_date; } },
  { head: 'Country of Infection', cl: 'infection', filter: [],
    html: function(r) { return r.infection; } },
  { head: 'Country of Origin', cl: 'origin', filter: [],
    html: function(r) { return r.origin; } },
  { head: 'Year of Birth', cl: 'year_of_birth', filter: [],
    html: function(r) { return r.year_of_birth; } },
];

// --- main entry point
d3.csv("data/patients_final.csv", function (data) {
  // load data
  console.log(data);
  full_dataset = data;
  filtered_dataset = full_dataset;

  //array with all unique values / column, only needs to be generated once
  unique_columns = columns.map(x => get_unique_column(x.html));
  filtered_unique_columns = unique_columns.map(column_filter);

  update_derived_data();

  // generate elements which only have to be generated once
  first_setup();

  // update everything
  update_select_boxes();
  gen_genderpie(true);
  //generate_table();
  //gen_riskgroupsbars();
});

// Generate one time only things (selectors, etc)
function first_setup() {
//only testing
    // create table
    var table = d3.select('.table')
        .append('table').attr('class', 'table');

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', function(x) { return x.cl; })
        .text(function(x) { return x.head; });
    table.append('tbody');


  //--- Generate Selectors
  //gender, riskgroup, agegroup, country x 2
  var selectors = ['riskgroup', 'agegroup', 'age_at_infection', 'infection', 'origin'];

  // create one selection box for each set
  var select_boxes = d3.select('#selectors')
    .selectAll('select')
    .data(selectors).enter()
    .append('select')
    .attr('class', 'selectpicker').attr('multiple', 'multiple')
    .attr('id', x => x)
    .on('change', x => update_filters());

  //--- Create Gender Pie
  var dataset = [
    { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
    { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
  ];

  var pie=d3.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);
  var w=150,h=200, radius = Math.min(w,h) / 2;
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

// main update function, reads currently selected filters and applies them before updating the display
function update_filters() {
  // riskgroup, country x 2 are at position 1, 4, 5
  var normal_idx = [1, 4, 5];
  for (var i in normal_idx) {
    columns[normal_idx[i]].filter = $('#'+columns[normal_idx[i]].cl).val();
  }

  //agegroup
  var selected_agegroups = $('#agegroup').val();
  columns[2].filter = [];
  for (var ag in agegroups) {
    if (selected_agegroups.includes(ag.string)) {
      for (var i = ag.min; i < ag.max; i++) {
        selected_agegroups.push(i);
      }
    }
  }

  // apply filter and update data
  filtered_dataset = full_dataset.filter(filter_function);
  filtered_unique_columns = unique_columns.map(column_filter);
  update_derived_data()

  // update display
  update_select_boxes();
  gen_genderpie(false);
  //generate_table();
}

function gen_genderpie() {
  var dataset = [
    { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
    { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
  ];

  var pie=d3.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);

  var w=150,h=200, radius = Math.min(w,h) / 2;
  var arc=d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var svg = d3.select("#Gender").select("svg");
  var path = svg.selectAll('path').data(pie(dataset));

  path.enter().attr("d",arc);

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

function column_filter(column, i) {
    // no filter selected for this column -> only get possible values
    if (columns[i] && columns[i].filter.length == 0) {
        //TODO: find out which is quicker! // drop completely because it's too slow for full dataset?
        //column.filter(x => filtered_dataset.map(y => columns[i].html(y)).includes(x))
        return get_unique_column(columns[i].html)
      }
    // some filter selected -> display complete column
    return column;
  }

// returns true if each attribute is eather in the filter list or the filter list is empty
function filter_function(x) {
  // compare each attribute
  for (var i = 0; i < columns.length; i++) {
    // if the filter list for this attribute is empty, we don't drop anything
    if (columns[i].filter && columns[i].filter.length != 0) {
      // if it is not empty it has to contain the entry (we are basically whitelisting)
      if (!columns[i].filter.includes(columns[i].html(x))) {
        return false;
      }
    }
  }
  // each attribute passed, so we include this entry in the filtered dataset
  return true;
}

// Generates an array with all unique values of one of the dataset columns
// takes an attr_function of the form function (x) { return x.ATTR }] as parameter
// adapted from https://stackoverflow.com/questions/17780508/selecting-distinct-values-from-a-json
function get_unique_column(attr_function) {
  var lookup = {};
  var result = [];

  for (var item, i = 0; item = filtered_dataset[i++];) {
    var name = attr_function(item);

    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }
  return result;
}

function catch_genderpie_click (d) {
  if (columns[0].filter.includes(d.data.name)) columns[0].filter = [];
  else  columns[0].filter = [d.data.name];
  update_filters();
}

// code mostly from http://bl.ocks.org/gka/17ee676dc59aa752b4e6 and adapted to our purposes
function generate_table(){

  // DATA JOIN
  // Join new data with old elements, if any.
  var table = d3.select('table').select('tbody')
    .selectAll('tr').data(filtered_dataset);

  // Update existing rows
  table.selectAll('td').data(get_row_function)
    .html(function(x) { return x.html; })
    .attr('class', function(x) { return x.cl; });

  // Add new rows
  table.enter()
    .append('tr')
    .selectAll('td')
    .data(get_row_function).enter()
    .append('td')
    .html(function(x) { return x.html; })
    .attr('class', function(x) { return x.cl; });

  // Remove old elements as needed.
  table.exit().remove();
}

function get_row_function(row, i) {
  return columns.map(function(c) {
    // compute cell values for this specific row
    var cell = {};
    d3.keys(c).forEach(function(k) {
      cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
    });
    return cell;
  });
}

// reset all derived data arrays to their initial state (0,0,0,...)
function resetgroups(){
  // divide agegroups into <16 and then intervals of 5 (16-20, 21-25, ...)
  agegroups = [{min: 0, max: 15, string:"<16", count: 0, percent:0}];
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
  "vertical transmission": {abs: 0, percent: 0}
};

gendergroups = {"M": 0, "F": 0};
}

function update_derived_data() {
  //first reset the groups to start at 0 entries
  resetgroups();

  // go through whole dataset once and count all occurences
  for (var i = 0; i < filtered_dataset.length; i++) {
    gendergroups[filtered_dataset[i].Gender]++;
    riskgroups[filtered_dataset[i].Risk].abs++;

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
    riskgroups[key].percent = riskgroups[key].abs / filtered_dataset.length;
  });
  Object.keys(agegroups).forEach((key, index) => {
    agegroups[key].percent = agegroups[key].count / filtered_dataset.length;
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
