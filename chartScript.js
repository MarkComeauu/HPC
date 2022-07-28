buildGraphs = function( dataset ){
	//get charts container and clear it
	$("#chartscontainer").empty();
	
	//build a new bar graph
	var barGraph = document.createElement("CANVAS");
	barGraph.width = 600;
	barGraph.height = 400;
	var barCtx = barGraph.getContext('2d');
	
	//variables for bar graph
	var blabels = [], principals = [0], interests = [0], remainder = [];
	//variables for pie chart
	var plabels = [], pdata = [];
	
	//retrieve data
	for( var i = 0; i < dataset.length; i++ ){
		blabels.push( "Year " + i );
		
		for( var j = 0; j < dataset[i].costs.length; j++ ){
			//bar graph data
			if( dataset[i].costs[j].name == "Loan Principal" )
				principals.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
			if( dataset[i].costs[j].name == "Loan Interest" )
				interests.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
			
			//pie chart data
			if( !plabels.includes( dataset[i].costs[j].name ) ){
				plabels.push( dataset[i].costs[j].name );
				pdata.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
			} else {
				var ind = plabels.indexOf( dataset[i].costs[j].name );
				pdata[ind] += parseFloat( dataset[i].costs[j].value.toFixed(2) );
			}
		}
		
		remainder.push( parseFloat( (dataset[i].subtotal - principals[i] - interests[i]).toFixed(2) ) );
	}
	
	//bar graph configuration
	var barGraph = new Chart( barCtx, {
		type: 'bar',
		data: {
			labels: blabels,
			datasets: [{
				label: "Principal",
				backgroundColor: "rgba(55,55,180,0.7)",
				borderColor:  "rgba(55,55,180,0.7)",
				data: principals
			},{
				label: "Interest",
				backgroundColor: "rgba(180,55,55,0.7)",
				borderColor:  "rgba(180,55,55,0.7)",
				data: interests
			},{
				label: "Other Costs",
				backgroundColor: "rgba(55,180,55,0.7)",
				borderColor: "rgba(55,180,55,0.7)",
				data: remainder
			}]
		},
		options: {
			plugins: {
				title: { display: true, text: "Cost Breakdown by Year" }
			},
			scales: {
				x: { stacked: true },
				y: {
					stacked: true,
					ticks: { callback: function(value, index, ticks){ return '$' + value; } }
				}
			}
		}
	});
	
	//add the bar graph to the screen
	$("#chartscontainer").append( barGraph.canvas );
	
	//build a new pie chart
	var pieChart = document.createElement("CANVAS");
	pieChart.width = 600;
	pieChart.height = 400;
	var pieCtx = pieChart.getContext('2d');
	
	//color variables
	pcolors = [
		"rgba(27, 35, 63, 0.9)",
		"rgba(80, 146, 173, 0.3)",
		"rgba(220, 203, 15, 0.3)",
		"rgba(214, 60, 112, 0.9)",
		"rgba(72, 55, 141, 0.9)",
		"rgba(126, 14, 31, 0.5)",
		"rgba(124, 195, 111, 0.2)",
		"rgba(64, 123, 206, 0.6)",
		"rgba(62, 127, 197, 0.8)",
		"rgba(15, 65, 72, 1)",
		"rgba(135, 22, 66, 0.4)",
		"rgba(33, 51, 39, 0.9)",
		"rgba(177, 171, 10, 0.8)",
		"rgba(70, 154, 134, 0.3)",
		"rgba(173, 29, 237, 0.9)",
		"rgba(33, 241, 151, 0.8)"
	]
	
	//pie chart configuration
	var pieChart = new Chart( pieCtx, {
		type: 'pie',
		data: {
			labels: plabels,
			datasets: [{
				backgroundColor: pcolors,
				data: pdata
			}]
		},
		options: {
			plugins: {
				title: { display: true, text: "Total Cost of Ownership" },
				legend: { position: "right" }
			}
		}
	});
	
	//add the pie chart to the screen
	$("#chartscontainer").append( pieChart.canvas );
}