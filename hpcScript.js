//Navigation
function navigate( loc ){
	if( loc == "nav-calc" && $("#Input").css("display") != "block" ){
		$("#Input").show();
		$("#Results").hide();
		$("#Explore").hide();
		$("#Info").hide();
	}
	else if( loc == "nav-res" && $("#Results").css("display") != "block" ){
		$("#Input").hide();
		$("#Results").show();
		$("#Explore").hide();
		$("#Info").hide();
	}
	else if( loc == "nav-exp" && $("#Explore").css("display") != "block" ){
		$("#Input").hide();
		$("#Results").hide();
		$("#Explore").show();
		$("#Info").hide();
	}
	else if( loc == "nav-info" && $("#Info").css("display") != "block" ){
		$("#Input").hide();
		$("#Results").hide();
		$("#Explore").hide();
		$("#Info").show();
	}
		
	$("#navbar .active").removeClass("active");
	$("#" + loc).addClass("active");
}

//Main Calculator angular JS initialization
var app = angular.module( "myApp", [] );

//Federal Income Tax Brackets
var federalrates = [0.1,0.12,0.22,0.24,0.32,0.35,0.37];

//angular app controler
app.controller( "myCtrl", function($scope){
	//onchange for all inputs
	$scope.myonchange = function(){
		//initialize calculator fields
		$scope.outputArray = [];
		$scope.totalcost = 0.0;
		$scope.equity = $scope.downpayment/$scope.price;
		$scope.loanbalance = $scope.price - $scope.downpayment;
		$scope.pmi = $scope.loanbalance*0.01;

		$scope.submit();

		//initialize explore page fields
		$scope.exp_price = undefined;
        $scope.exp_down = 0.05;
        $scope.exp_loan = 30;
        $scope.exp_int = 0.05;
        $scope.exp_pay = 0;
		$scope.comparables = [];
	}

	//explore page change
	$scope.expChange = function(){
		var arr = explore_data( $scope.exp_name, $scope.exp_price, $scope.exp_down, $scope.exp_loan, $scope.exp_int, $scope.exp_pay );
		$scope.exp_MTG = arr[0];
		$scope.exp_total_interest = arr[1];
		$scope.exp_total_cost = arr[2];
	}

	//explore page load comparables
	$scope.expLoadComps = function(){
		if( localStorage.getItem("Comps") == null )
			console.log( "no comps saved" );
		else{
			$scope.comparables = [];
			for( let i = 0; i < JSON.parse( localStorage.getItem("Comps") ).length; i++ ){
				$scope.comparables.push( JSON.parse( localStorage.getItem("Comps") )[i] );
			}
		}
	}

	//explore page save comparables
	$scope.expSaveComps = function(){
		//ensure to from storage
		$scope.expLoadComps();

		//push the new object to array
		$scope.comparables.push( {
			"name": $scope.exp_name,
			"price": $scope.exp_price,
			"downpct": $scope.exp_down,
			"downval": $scope.exp_price * $scope.exp_down,
			"term": $scope.exp_loan,
			"rate": $scope.exp_int,
			"extrapmt": $scope.exp_pay,
			"mtgpmt": $scope.exp_MTG,
			"totalint": $scope.exp_total_interest,
			"grandtotal": $scope.exp_total_cost
		} );

		//save to local storage
		localStorage.setItem( "Comps", JSON.stringify( $scope.comparables ) );
	}

	//explore compare function
	$scope.expComp = function(){

	}

	//submit
	$scope.submit = function(){
		//initialize calculator fields
		$scope.outputArray = [];
		$scope.totalcost = 0.0;
		$scope.equity = $scope.downpayment/$scope.price;
		$scope.loanbalance = $scope.price - $scope.downpayment;
		$scope.pmi = $scope.loanbalance*0.01;

		//calculate salvage discounted value & monthly payment
		$scope.salvagedisc = $scope.salvage*(1/((1 + $scope.discountrate)**$scope.loanterm));

		//Total Loan Payment = loanbalance * [( i * ( 1 + i ) ** n ) / ( ( 1 + i ) ** n - 1 )]
		//			i = monthly interest rate, n = number of payments
		var mir = $scope.interestrate/12;
		$scope.monthlypmt = $scope.loanbalance * ((mir*[(1+mir)**($scope.loanterm*12)])/((1+mir)**($scope.loanterm*12)-1));
		
		//iterate each year
		for( var i = 0; i < $scope.loanterm + 1; i++ ){
			//initialize
			$scope.tempobj = {
				costs:[],
				subtotal:0,
				equity:$scope.equity
			};
			
			//assign the year
			$scope.tempobj.year = i;
			
			//if this is the base year
			if( i == 0 ){
				//closing costs
				if( $scope.downpayment != 0 )
					$scope.tempobj.costs.push( {"name":"Down Payment","value":$scope.downpayment} );
				if( $scope.titleinsurance != 0 )
					$scope.tempobj.costs.push( {"name":"Title Insurance", "value":$scope.titleinsurance} );
				
				$scope.tempobj.costs.push( {"name":"Settlement Fee", "value":695} );
				$scope.tempobj.costs.push( {"name":"Lender Title Insurance", "value":($scope.price-$scope.downpayment)*0.00265} );
				$scope.tempobj.costs.push( {"name":"Deed Recording", "value":50} );
				$scope.tempobj.costs.push( {"name":"Mortgage Recording", "value":150} );
				$scope.tempobj.costs.push( {"name":"Transfer Tax", "value":$scope.price*0.0075} );
				
				//inspections
				if( $scope.building )
					$scope.tempobj.costs.push( {"name":"Building Inspection", "value":400} );
				if( $scope.sewage )
					$scope.tempobj.costs.push( {"name":"Sewage Inspection", "value":600} );
				if( $scope.waterinsp )
					$scope.tempobj.costs.push( {"name":"Water Inspection", "value":400} );
				if( $scope.radonair )
					$scope.tempobj.costs.push( {"name":"Radon Air Inspection", "value":1200} );
				if( $scope.radonwater )
					$scope.tempobj.costs.push( {"name":"Radon Water Inspection", "value":250} );
				if( $scope.leadpaint )
					$scope.tempobj.costs.push( {"name":"Lead Paint Inspection", "value":1250} );
				if( $scope.pests )
					$scope.tempobj.costs.push( {"name":"Pest Inspection", "value":100} );
				if( $scope.hazardouswaste )
					$scope.tempobj.costs.push( {"name":"Hazardous Waste Inspection", "value":750} );
				
				for( c in $scope.tempobj.costs ){
					$scope.tempobj.subtotal += $scope.tempobj.costs[c].value;
				}
				
				$scope.tempobj.disc = $scope.tempobj.subtotal;
				$scope.tempobj.total = $scope.tempobj.subtotal;
				
				$scope.totalcost += $scope.tempobj.total;
			} else {
				//tax refunds
				var taxdeduction = 0;
				
				if( $scope.filingtype == 0 ){ //standard deduction
					if( $scope.filingrel == 0 )
						taxdeduction = 12550; //single
					else
						taxdeduction = 25100; //married
				}
				else{ //itemized deduction
					if( ( $scope.filingrel == 0 && $scope.taxes < 5000 ) || ( $scope.filingrel == 1 && $scope.taxes < 10000 ) )
						taxdeduction += $scope.taxes; //single & less than max OR married & less than max
					else if( $scope.filingrel == 0 )
						taxdeduction += 5000; //single & more than max
					else
						taxdeduction += 10000; //married & more than max
				}
				
				//if financing add loan payments.
				if( $scope.loanbalance > 0 ){
					//initialize yearly interest & principal variable
					var interest = 0, principal = 0;

					//calculate monthly costs
					var j = 0;
					while( j < 12 && $scope.loanbalance > 0 ){
						//get interest owed  (mir = monthly interest rate)
						var int = $scope.loanbalance * mir;

						//get principal paid with principal only payment
						var pri = $scope.monthlypmt - int;
						if( $scope.principalonly )
							pri += $scope.principalonly;

						//if payment exceeds loan balance
						if ( $scope.monthlypmt - int > $scope.loanbalance ){
							//recalculate to get final payment
							pri = $scope.loanbalance;

							//only allow for remaining payment to be made
							interest += int;
							principal += pri;

							$scope.loanbalance -= pri;
							break;
						} else {
							//summate for yearly amounts paid
							interest += int;
							principal += pri;

							$scope.loanbalance -= pri;
						}
						
						j++;
					}

					//update equity based on principal paid
					$scope.tempobj.equity += principal/$scope.price;
					$scope.equity += principal/$scope.price;

					//if itemized deduction, add interest payments to tax refund
					if( $scope.filingtype == 1 )
						taxdeduction += interest;
					
					//add to the cost list
					if( principal != 0 )
						$scope.tempobj.costs.push( {"name":"Loan Principal","value":principal} );
					if( interest != 0 )
						$scope.tempobj.costs.push( {"name":"Loan Interest","value":interest} );
					
					//if private mortgage insurance is required
					if( $scope.equity < 0.2 ){
						$scope.tempobj.costs.push( {"name":"PMI","value":$scope.pmi} );
						//if itemized deduction & AGI < 109k married || 50k single, add pmi payment to tax refund
						if( $scope.filingtype == 1 && $scope.taxbracket < 3 )
							taxdeduction += $scope.pmi;
					}
				}
				
				//add taxes to costs
				if( $scope.taxes != undefined && $scope.taxes != 0 )
					$scope.tempobj.costs.push( {"name":"Property Taxes","value":$scope.taxes} );
				
				//add operation costs
				if( $scope.opcostperiod == 0 ){ //entered yearly
					if( $scope.insurance != undefined && $scope.insurance != 0 )
						$scope.tempobj.costs.push( {"name":"Home Insurance","value":$scope.insurance} );
					if( $scope.heat != undefined && $scope.heat != 0 )
						$scope.tempobj.costs.push( {"name":"Heating Costs","value":$scope.heat} );
					if( $scope.electric != undefined && $scope.electric != 0 )
						$scope.tempobj.costs.push( {"name":"Electricity","value":$scope.electric} );
					if( $scope.water != undefined && $scope.water != 0 )
						$scope.tempobj.costs.push( {"name":"Water","value":$scope.water} );
					if( $scope.wifi != undefined && $scope.wifi != 0 )
						$scope.tempobj.costs.push( {"name":"Internet / Wifi","value":$scope.wifi} );
					if( $scope.maintenance != undefined && $scope.maintenance != 0 )
						$scope.tempobj.costs.push( {"name":"Maintenance","value":$scope.maintenance} );
				}
				else{ //entered monthly
					if( $scope.insurance != undefined && $scope.insurance != 0 )
						$scope.tempobj.costs.push( {"name":"Home Insurance","value":$scope.insurance*12} );
					if( $scope.heat != undefined && $scope.heat != 0 )
						$scope.tempobj.costs.push( {"name":"Heating Costs","value":$scope.heat*12} );
					if( $scope.electric != undefined && $scope.electric != 0 )
						$scope.tempobj.costs.push( {"name":"Electricity","value":$scope.electric*12} );
					if( $scope.water != undefined && $scope.water != 0 )
						$scope.tempobj.costs.push( {"name":"Water","value":$scope.water*12} );
					if( $scope.wifi != undefined && $scope.wifi != 0 )
						$scope.tempobj.costs.push( {"name":"Internet / Wifi","value":$scope.wifi*12} );
					if( $scope.maintenance != undefined && $scope.maintenance != 0 )
						$scope.tempobj.costs.push( {"name":"Maintenance","value":$scope.maintenance*12} );
				}
				
				//add tax refund costs (should be a negative value)
				$scope.tempobj.costs.push( {"name":"Tax Refund","value":taxdeduction * (federalrates[$scope.taxbracket] + 0.05) } );
				
				//set subtotal
				for( j in $scope.tempobj.costs ){
					if( $scope.tempobj.costs[j].name == "Tax Refund" )
						$scope.tempobj.subtotal -= $scope.tempobj.costs[j].value;
					else
						$scope.tempobj.subtotal += $scope.tempobj.costs[j].value;
				}
				
				//get the present value of the subtotal
				if( $scope.discountrate > 0.00 ){
					//( cost * ( 1 / ( ( 1 + disc ) ** i ) ) ).toFixed(2) -> Present Value
					$scope.tempobj.disc = ($scope.tempobj.subtotal*(1/((1 + $scope.discountrate)**i))).toFixed(2);
				
					//add it to the total cost
					$scope.totalcost += parseFloat( $scope.tempobj.disc );
				}
				else
					$scope.totalcost += $scope.tempobj.subtotal;
				
				$scope.tempobj.total = $scope.totalcost;
			}
			
			//push tempobj to list
			$scope.outputArray.push( $scope.tempobj );
		}
		
		//build the graphs
		buildGraphs( $scope.outputArray );
	}
	
	//reset to default values
	$scope.clearform = function(){
		$scope.address = "";
		$scope.price = 0;
		$scope.downpayment = 0;
		$scope.loanterm = 30;
		$scope.interestrate = 0.065;
		$scope.monthlypmt = 0;
		$scope.taxes = 0;
		$scope.building = false;
		$scope.sewage = false;
		$scope.waterinsp = false;
		$scope.radonair = false;
		$scope.radonwater = false;
		$scope.leadpaint = false;
		$scope.pests = false;
		$scope.hazardouswaste = false;
		$scope.titleinsurance = 0;
		$scope.opcostperiod = 0;
		$scope.insurance = undefined;
		$scope.heat = undefined;
		$scope.electric = undefined;
		$scope.water = undefined;
		$scope.wifi = undefined;
		$scope.maintenance = undefined;
		$scope.principalonly = 0;
		$scope.filingrel = 0;
		$scope.taxbracket = 0;
		$scope.filingtype = 0;
		$scope.salvage = 0;
		$scope.discountrate = 0;
		
		$scope.myonchange();
	}
	
	$scope.clearform();
	
	//example
	$scope.example = function(){
		//example values
		$scope.address = "232 Raymond Road, Deerfield NH, 03037";
		$scope.price = 350000.00;
		$scope.downpayment = 10000.00;
		$scope.loanterm = 30;
		$scope.interestrate = 0.065;
		$scope.taxes = 4400;
		$scope.building = true;
		$scope.sewage = true;
		$scope.waterinsp = true;
		$scope.titleinsurance = 342;
		$scope.opcostperiod = 0;
		$scope.insurance = 800;
		$scope.heat = 1200;
		$scope.electric = 2250;
		$scope.water = 0;
		$scope.wifi = 720;
		$scope.maintenance = 1200;
		$scope.principalonly = 0;
		$scope.filingrel = 0;
		$scope.taxbracket = 2;
		$scope.filingtype = 1;
		$scope.salvage = 500000.00;
		$scope.discountrate = 0;
		
		//update
		$scope.myonchange();
	}
});

//expansion and retraction for results detailed breakdown by year
function detail( loc ){
	$( loc ).toggleClass( "glyphicon-chevron-down" );
	$( loc ).toggleClass( "glyphicon-chevron-up" );

	let costlist = $( loc.parentNode.parentNode.children[1].children[0].children );
	let amountlist = $( loc.parentNode.parentNode.children[2].children[0].children );

	for( let i = 1; i < costlist.length; i++ ){
		$( costlist[i] ).toggle();
		$( amountlist[i] ).toggle();
	}
}

//toggleAll expands or retracts all rows in detailed breakdown table
function toggleAll(){
	let list = $("#ResultsTable span.glyphicon");

	$( list[0] ).toggleClass( "glyphicon-chevron-down" );
	$( list[0] ).toggleClass( "glyphicon-chevron-up" );

	for( let i = 1; i < list.length; i++ ){
		detail( list[i] );
	}
}