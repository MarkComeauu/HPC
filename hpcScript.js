//Angular JS
var app = angular.module( "myApp", [] );

//Amortization Formulas
var amortizations = [
	{"length":"30","vals":[0.00000622,0.1928]},
	{"length":"25","vals":[0.00000829,0.2536]},
	{"length":"20","vals":[0.00001158,0.3337]},
	{"length":"15","vals":[0.00001736,0.4391]},
	{"length":"10","vals":[0.00002949,0.5777]}];

//angular app controler
app.controller( "myCtrl", function($scope){
	//toggle input / results
	$scope.toggleresults = function(){
		$("#Results").toggle();
		$("#Input").toggle();
		$scope.myonchange();
	}
	
	//onchange for all inputs
	$scope.myonchange = function(){
		//initialize
		$scope.outputArray = [];
		$scope.totalcost = 0.0;
		$scope.equity = $scope.downpayment/$scope.price;
		$scope.pmi = ($scope.price - $scope.downpayment)*0.01;
		
		//initialize salvage discounted value & monthly payment
		$scope.salvagedisc = $scope.salvage*(1/((1 + $scope.discountrate)**$scope.loanterm));
		$scope.monthlypmt = 0;
		
		//iterate each year
		for( var i = 0; i < $scope.loanterm + 1; i++ ){
			//initialize
			$scope.tempobj = {};
			$scope.tempobj.costs = [];
			$scope.tempobj.subtotal = 0;
			$scope.tempobj.equity = $scope.equity;
			
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
				//if financing add loan payments. P = r ( PV / ( 1 - ( 1 + r ) ** -n ) ) -> Monthly Payment
				if( $scope.price - $scope.downpayment > 0 ){
					//get monthly loan payment
					$scope.monthlypmt = ($scope.interestrate/12)*(($scope.price-$scope.downpayment)/(1-(1+($scope.interestrate/12))**-($scope.loanterm*12)));
					
					var principal;
					
					//find appropriate amortization based on loan term
					for( a in amortizations ){
						if( amortizations[a].length == $scope.loanterm ){
							//build function with values: vals[0]*(x-1)**2+vals[1]
							principal = (amortizations[a].vals[0]*((i*12)-1)**2+amortizations[a].vals[1])*$scope.monthlypmt;
						}
					}
					
					//update equity based on principal paid
					$scope.tempobj.equity += (principal*12)/$scope.price;
					$scope.equity += (principal*12)/$scope.price;
					
					var interest = $scope.monthlypmt - principal;
					
					//add to the cost list
					if( principal != 0 )
						$scope.tempobj.costs.push( {"name":"Loan Principal","value":principal*12} );
					if( interest != 0 )
						$scope.tempobj.costs.push( {"name":"Loan Interest","value":interest*12} );
					
					//if private mortgage insurance is required
					if( $scope.equity < 0.2 )
						$scope.tempobj.costs.push( {"name":"PMI","value":$scope.pmi} );
				}
				
				//add taxes to costs
				if( $scope.taxes != undefined && $scope.taxes != 0 )
					$scope.tempobj.costs.push( {"name":"Property Taxes","value":$scope.taxes} );
				
				//add operation costs
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
				
				//set subtotal
				for( j in $scope.tempobj.costs )
					$scope.tempobj.subtotal += $scope.tempobj.costs[j].value;
				
				//get the present value of the subtotal
				if( $scope.discountrate != 0 ){
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
		
		//build the bar graph
		buildGraphs( $scope.outputArray );
	}
	
	//reset to default values
	$scope.clearform = function(){
		$scope.address = "";
		$scope.price = 0;
		$scope.downpayment = 0;
		$scope.loanterm = 30;
		$scope.interestrate = 0.055;
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
		$scope.insurance = undefined;
		$scope.heat = undefined;
		$scope.electric = undefined;
		$scope.water = undefined;
		$scope.wifi = undefined;
		$scope.maintenance = undefined;
		$scope.salvage = 0;
		$scope.discountrate = 0.03;
		
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
		$scope.interestrate = 0.055;
		$scope.taxes = 4400;
		$scope.building = true;
		$scope.sewage = true;
		$scope.waterinsp = true;
		$scope.titleinsurance = 342;
		$scope.insurance = 800;
		$scope.heat = 1200;
		$scope.electric = 2250;
		$scope.water = 0;
		$scope.wifi = 720;
		$scope.maintenance = 1200;
		$scope.salvage = 500000.00;
		$scope.discountrate = 0.03;
		
		//update
		$scope.myonchange();
	}
});