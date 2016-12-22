var data = (function () {
	var mod = {};

	mod.load = function (cb) {
		d3.csv("data/patients_final.csv", function (data) {
		  // load data
		  console.log(data);
		  full_dataset = data;
		  filtered_dataset = full_dataset;

		  //array with all unique values / column, only needs to be generated once
		  unique_columns = columns.map(x => get_unique_column(x.html));
		  filtered_unique_columns = unique_columns.map(column_filter);

		  update_derived_data();
		  cb();
		});
	}

	// first get currently selected filters, then apply them to data
	mod.update = function () {
	  // riskgroup, country x 2 are at position 1, 4, 5
	  var normal_idx = [1, 4, 5];
	  for (var i in normal_idx) {
		columns[normal_idx[i]].filter = $('#'+columns[normal_idx[i]].cl).val();
	  }

	  //agegroup
	  var selected_agegroups = $('#agegroup').val();
	  columns[2].filter = [];
		agegroups.forEach(function(entry) {
			if (selected_agegroups.includes(entry.string)){
				for (var i = entry.min; i <= entry.max; i++) {
					//number must be added as string -> based on http://jsben.ch/#/ghQYR this method is the fastet
					columns[2].filter.push(''+ i);
			  }
			}
		});

	  // apply filter and update data
	  filtered_dataset = full_dataset.filter(filter_function);
	  filtered_unique_columns = unique_columns.map(column_filter);
	  update_derived_data()
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

	// reset all derived data arrays to their initial state (0,0,0,...)
	function resetgroups(){
	 	riskgroups = [
		  { string: "homosexual/bisexual", count: 0, percent: 0},
		  { string: "blood products", count: 0, percent: 0},
		  { string: "heterosexual", count: 0, percent: 0},
		  { string: "other", count: 0, percent: 0},
		  { string: "IVDA", count: 0, percent: 0},
		  { string: "vertical transmission", count: 0, percent: 0}
		];

	  // divide agegroups into <16 and then intervals of 5 (16-20, 21-25, ...)
	  agegroups = [{min: 0, max: 15, string:"<16", count: 0, percent:0}];
	  for(var i=1; i<9; i++){
	  	agegroups[i] = {min: 11+i*5, max: 15+i*5, string: (11+i*5) +"-" + (15+i*5), count: 0, percent: 0};
	 	}
	 	agegroups[9] = {min:56, max: 100, string:"56+", count: 0, percent:0}
	 	agegroups[10] = {min:-9999, max: -1, string:"unknown", count: 0, percent: 0}

	 	// add riskgroups array to agegroups (for radar chart)
	 	for (var i=0; i<11; i++) {
	 		agegroups[i].riskgroups = $.extend(true, [], riskgroups);
	 	}

		gendergroups = {"M": 0, "F": 0};

		countryofinfectiongroups=[];
		for(var i=0; i<filtered_unique_columns[4].length; i++){
			countryofinfectiongroups[i] = {string: filtered_unique_columns[4][i], count: 0, percent: 0}
		}
	}

	function update_derived_data() {
	  //first reset the groups to start at 0 entries
	  resetgroups();

	  // go through whole dataset once and count all occurences
	  for (var i = 0; i < filtered_dataset.length; i++) {
	  	var current_entry = filtered_dataset[i];

	    riskgroups.find(x => x.string==current_entry.Risk).count++;
			countryofinfectiongroups.find(x => x.string==current_entry.infection).count++;
			gendergroups[current_entry.Gender]++;

	    if(current_entry.age_at_infection<=-1){
	      agegroups[10].count++;
	      agegroups[10].riskgroups.find(x => x.string==current_entry.Risk).count++;
	    } else if(current_entry.age_at_infection <=15){
	      agegroups[0].count++;
	      agegroups[0].riskgroups.find(x => x.string==current_entry.Risk).count++;
	    } else if(current_entry.age_at_infection >= 56){
	      agegroups[9].count++;
	      agegroups[9].riskgroups.find(x => x.string==current_entry.Risk).count++;
	    } else {
	      var index=Math.ceil((current_entry.age_at_infection-15)/5);
	      if(!isNaN(index)) {
	      	agegroups[index].count++;
	      	agegroups[index].riskgroups.find(x => x.string==current_entry.Risk).count++;
	      }
	    }
	  }

	  //sort array descending to easily get the first n max results
	  countryofinfectiongroups.sort(function(a, b){return b.count-a.count});
	  var countryamount = columns[4].filter.length == 0 ? 10: columns[4].filter.length;
	  countryofinfectiongroups = countryofinfectiongroups.slice(0,countryamount);

	  // update riskgroups percentages
	  for (var i in riskgroups) {
	    riskgroups[i].percent = riskgroups[i].count / filtered_dataset.length;
	  }
	  // update agegroups percentages
	  for (var i in agegroups) {
	    agegroups[i].percent = agegroups[i].count / filtered_dataset.length;
	    // update age_riskgroup numbers
	    for (var j in agegroups[i].riskgroups){ 
			// if else, because 0 divide by 0 is NaN in javascript
			if(agegroups[i].count > 0 && agegroups[i].riskgroups[j].count > 0)
	    	agegroups[i].riskgroups[j].percent = agegroups[i].riskgroups[j].count / agegroups[i].count;
			else agegroups[i].riskgroups[j].percent = 0
	    }
	  }
	  //update country of infection percentages
	  for (var i in countryofinfectiongroups) {
			countryofinfectiongroups[i].percent = countryofinfectiongroups[i].count / filtered_dataset.length;
	  }
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


	return mod;
}());
