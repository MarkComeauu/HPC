buildGraphs = function( dataset ){
	//console.log( dataset );
	
	//get charts container and clear it
	$("#chartscontainer").empty();
	
	//build a new bar graph
	var barGraph = document.createElement("CANVAS");
	barGraph.height = 300;
	var column1 = document.createElement("DIV");
	column1.classList.add( "col-sm-6" );
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
			if( dataset[i].costs[j].name != "Tax Refund" ){
				if( !plabels.includes( dataset[i].costs[j].name ) ){
					plabels.push( dataset[i].costs[j].name );
					pdata.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
				} else {
					var ind = plabels.indexOf( dataset[i].costs[j].name );
					pdata[ind] += parseFloat( dataset[i].costs[j].value.toFixed(2) );
				}
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
				backgroundColor: "rgb(" + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) + ")",
				data: principals
			},{
				label: "Interest",
				backgroundColor: "rgb(" + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) + ")",
				data: interests
			},{
				label: "Other Costs",
				backgroundColor: "rgb(" + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) 
					+ "," + Math.floor(Math.random()*255) + ")",
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
	column1.append( barGraph.canvas );
	$("#chartscontainer").append( column1 );
	
	//build a new pie chart
	var pieChart = document.createElement("CANVAS");
	pieChart.height = 300;
	var column2 = document.createElement("DIV");
	column2.classList.add( "col-sm-6" );
	var pieCtx = pieChart.getContext('2d');
	
	//generate random colors
	pcolors = [];
	for( var i in pdata ){
		pcolors.push( "rgba(" + Math.floor(Math.random()*255) 
			+ "," + Math.floor(Math.random()*255) 
			+ "," + Math.floor(Math.random()*255) 
			+ "," + Math.random() + ")" );
	};
	
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
				legend: { position: "bottom" }
			}
		}
	});
	
	//add the pie chart to the screen
	column2.append( pieChart.canvas );
	$("#chartscontainer").append( column2 );
}