//globla variables
var EXP_CBY_CHART;

//main function
explore_data = function( name, price, down, term, rate, pay ){
    //console.log( price, down, term, rate, pay )

    //initialize variables
    var results = [],
        total = price * down,
        balance = price - (price * down),
        equity = (price * down) / price,
        pmi = balance * 0.01;

    //initialize return variables
    var exp_total_interest = 0, exp_total_cost = total;

    //calculate mortgage payment
    // M = P ( [r( 1 + r )^n] / [( 1 + r )^n - 1] )
    var mir = rate / 12;
    var mtg = balance * ( ( mir * ( 1 + mir ) ** (term*12) ) / ( ( 1 + mir ) ** (term*12) - 1 ) );

    //iterate through the terms
    for( var i = 0; i < term + 1; i++ ){
        //initialize temp object to store results
        var tempobj = {
            "costs":[],
            "total":0,
            "equity":equity
        }

        //if this is the base year
        if( i == 0 ){
            tempobj.costs.push( {"name":"Down Payment", "value":price*down} );
            tempobj.total = total;
        } else {
            //if financing, add loan payments.
            var interest = 0, principal = 0, j = 0;

            while( j < 12 && balance > 0 ){
                var int = balance * mir,
                    pri = mtg - int;

                //add additional payment
                if( pay > 0 )
                    pri += pay;

                //if payment exceeds loan balance
                if ( mtg - int > balance ){
                    //recalculate to get final payment
                    pri = balance;

                    interest += int, principal += pri;
                    balance -= pri;
                    break;
                } else {
                    interest += int, principal += pri;
                    balance -= pri;
                }

                j++;
            }

            //update equity accumulated
            tempobj.equity += principal / price;
            equity += principal / price;

            //add costs to the temp object
            tempobj.costs.push( {"name":"Principal","value":principal}, {"name":"Interest","value":interest} );

            //add interests to return var
            exp_total_interest += interest;

            //if pmi is needed
            if( equity < 0.2 )
                tempobj.costs.push( {"name":"PMI","value":pmi} );

            //set total
            for( j in tempobj.costs )
                tempobj.total += tempobj.costs[j].value;

            //add total costs to return var
            exp_total_cost += tempobj.total;
        }

        //push the results
        results.push( tempobj );
    }

    //create the chart if it doesn't exist, otherwise update the data
    if( $("#ExploreCharts").children().length == 0 )
        expCreateChart( results );
    else
        expUpdateChart( results );

    return [mtg, exp_total_interest, exp_total_cost];
}

//create chart
expCreateChart = function( dataset ){
    //build a new bar graph
	var canvas = document.createElement("CANVAS");
	canvas.height = 150;
    canvas.id = "Exp_CBY_Canvas";
	var container = document.createElement("DIV");
	var graphCtx = canvas.getContext('2d');

    //variables for bar graph
	var blabels = [], principals = [0], interests = [0], equities = [], remainder = [];
	
	//retrieve data
	for( var i = 0; i < dataset.length; i++ ){
        //create yearly labels
		blabels.push( "Year " + i );
		
        //iterate through costs
		for( var j = 0; j < dataset[i].costs.length; j++ ){
			//get graph data
			if( dataset[i].costs[j].name == "Principal" )
				principals.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
			else if( dataset[i].costs[j].name == "Interest" )
				interests.push( parseFloat( dataset[i].costs[j].value.toFixed(2) ) );
            else
                remainder.push( parseFloat( (dataset[i].total - principals[i] - interests[i]).toFixed(2) ) )
		}

        //get equity data
        equities.push( dataset[i].equity );
	}
	
	//bar graph configuration
	EXP_CBY_CHART = new Chart( graphCtx, {
		data: {
			labels: blabels,
			datasets: [{
                yAxisID: 'A',
                type: 'bar',
				label: "Principal",
				backgroundColor: "rgba(105, 233, 138, 0.8)",
				data: principals
			},{
                yAxisID: 'A',
                type: 'bar',
				label: "Interest",
				backgroundColor: "rgba(227, 37, 37, 0.8)",
				data: interests
			},{
                yAxisID: 'A',
                type: 'bar',
				label: "Other Costs",
				backgroundColor: "rgba(43, 177, 248, 0.8)",
				data: remainder
			},{
                yAxisID: 'B',
                type: 'line',
                label: "Equity",
                backgroundColor: "rgba(55, 55, 55, 0.9)",
                data: equities
            }]
		},
		options: {
			plugins: {
				title: { display: true, text: "Cost Breakdown by Year" }
			},
			scales: {
				x: { stacked: true },
				A: {
                    type: 'linear',
                    display: 'true',
                    position: 'left',
					stacked: true,
					ticks: { callback: function(value, index, ticks){ return '$' + value; } }
				},
                B: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { display: false },
                    ticks: { callback: function(value, index, ticks){ return value * 100 + '%' } },
                    min: 0,
                    max: 1
                }
			}
		}
	});
	
	//add the bar graph to the screen
	container.append( EXP_CBY_CHART.canvas );
	$("#ExploreCharts").append( container );
}

//update chart
expUpdateChart = function( newdataset ){
    //remove old data
    while( EXP_CBY_CHART.data.labels.length > 0 ){
        EXP_CBY_CHART.data.labels.pop();
    }

    EXP_CBY_CHART.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });

    EXP_CBY_CHART.data.datasets[0].data.push( 0 );
    EXP_CBY_CHART.data.datasets[1].data.push( 0 );
	
	//retrieve data
	for( var i = 0; i < newdataset.length; i++ ){
        //create yearly labels
		EXP_CBY_CHART.data.labels.push( "Year " + i );
		
        //iterate through costs
		for( var j = 0; j < newdataset[i].costs.length; j++ ){
			//get graph data
			if( newdataset[i].costs[j].name == "Principal" )
				EXP_CBY_CHART.data.datasets[0].data.push( parseFloat( newdataset[i].costs[j].value.toFixed(2) ) );
			else if( newdataset[i].costs[j].name == "Interest" )
                EXP_CBY_CHART.data.datasets[1].data.push( parseFloat( newdataset[i].costs[j].value.toFixed(2) ) );
            else
                EXP_CBY_CHART.data.datasets[2].data.push( parseFloat( (newdataset[i].total - EXP_CBY_CHART.data.datasets[0].data[i] - EXP_CBY_CHART.data.datasets[1].data[i]).toFixed(2) ) )
		}

        //get equity data
        EXP_CBY_CHART.data.datasets[3].data.push( newdataset[i].equity );
	}

    //update the chart
    EXP_CBY_CHART.update();
}