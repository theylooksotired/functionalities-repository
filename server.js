var express = require('express');
var fs = require('fs');
var app = express();

// Global variables
var dataLocation = __dirname + '/data/functionalities.jsonld';
var asawooNs = 'asawoo';
var asawooNsAddress = 'http://www.asawoo.com/';
var asawooNsAddressAnchor = asawooNsAddress+'#';
var contextFunctionality = asawooNsAddressAnchor+'Functionality';
var contextCapability = asawooNsAddressAnchor+'Capability';
var contextIsImplementedBy = asawooNsAddressAnchor+'isImplementedBy';

// Configure CROS
app.configure(function () {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(function(request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    app.use(app.router);
});

// Start the server in the port 3232
var server = app.listen(3232, function () {
	var host = server.address().address;
	var port = server.address().port;
})

/*---WEB SERVICE---*/

// GET the functionalities from an array of capabilities 
app.get('/functionalities', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    var functionalitiesResponse = { "functionalities" : [] }; 
    var capabilitiesArray = request.query.capabilities;
    // Format the capabilities array adding the complete URI
    for (var i=0; i<capabilitiesArray.length; i++) {
        if ((capabilitiesArray[i]).indexOf(asawooNsAddressAnchor) < 0) {
            capabilitiesArray[i] = asawooNsAddressAnchor + capabilitiesArray[i];
        }
    }
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var regExp = new RegExp(asawooNs+':','g');
            dataJson = JSON.parse(data.replace(regExp, asawooNsAddressAnchor));
            // Parse all the triples in the JSON-LD file
            for (var i=0; i<dataJson['@graph'].length; i++) {
                var graphItem = dataJson['@graph'][i];
                var idEleGraph = graphItem['@id'];
                var typeEleGraph = graphItem['@type'];
                var isFunctionality = false;
                if (typeEleGraph) {
                    // Check if the triple is a functionality
                    for (var t=0; t<typeEleGraph.length; t++) {
                        if (typeEleGraph[t]==contextFunctionality) {
                            isFunctionality = true;
                        }
                    }
                    if (isFunctionality) {
                        if (graphItem[contextIsImplementedBy]) {
                            // Check if the functionality belongs to one of the capabilities that we are looking for
                            // If so, add it to the response
                            for(var j=0; j<capabilitiesArray.length; j++) {
                                if (graphItem[contextIsImplementedBy]['@id'] == capabilitiesArray[j]) {
                                    if (functionalitiesResponse.functionalities.indexOf(graphItem) < 0) {
                                        functionalitiesResponse.functionalities.push(graphItem);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        response.end(JSON.stringify(functionalitiesResponse));
    });
    return true;
});

// GET the information of a functionality
app.get('/functionality', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end("{}");
});
app.get('/functionality/:functionality', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    var functionalityResponse = {};
    var functionalityRequest = request.params.functionality;
    // Format the functionality requested array adding the complete URI
    functionalityRequest = (functionalityRequest.indexOf(asawooNsAddressAnchor) < 0) ? asawooNsAddressAnchor+functionalityRequest : functionalityRequest;
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var regExp = new RegExp(asawooNs+':','g');
            dataJson = JSON.parse(data.replace(regExp, asawooNsAddressAnchor));
            // Parse all the triples in the JSON-LD file
            for (var i=0; i<dataJson['@graph'].length; i++) {
                var graphItem = dataJson['@graph'][i];
                var idEleGraph = graphItem['@id'];
                var typeEleGraph = graphItem['@type'];
                if (typeEleGraph) {
                    // Check if the triple is the functionality we are looking for
                    for (var t=0; t<typeEleGraph.length; t++) {
                        if (typeEleGraph[t]==contextFunctionality && idEleGraph==functionalityRequest) {
                            functionalityResponse = graphItem;
                        }
                    }
                }
            }
        }
        response.end(JSON.stringify(functionalityResponse));
    });
    return true;
});

// GET the information of a capability
app.get('/capability', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end("{}");
});
app.get('/capability/:capability', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    var capabilityResponse = {};
    var capabilityRequest = request.params.capability;
    // Format the capability requested array adding the complete URI
    capabilityRequest = (capabilityRequest.indexOf(asawooNsAddressAnchor) < 0) ? asawooNsAddressAnchor+capabilityRequest : capabilityRequest;
    // Read the JSON-LD file that contains all the information
    fs.readFile(dataLocation, 'utf8', function (error, data) {
        if (!error) {
            var regExp = new RegExp(asawooNs+':','g');
            dataJson = JSON.parse(data.replace(regExp, asawooNsAddressAnchor));
            // Parse all the triples in the JSON-LD file
            for (var i=0; i<dataJson['@graph'].length; i++) {
                var graphItem = dataJson['@graph'][i];
                var idEleGraph = graphItem['@id'];
                var typeEleGraph = graphItem['@type'];
                if (typeEleGraph) {
                    // Check if the triple is the capability we are looking for
                    for (var t=0; t<typeEleGraph.length; t++) {
                        if (typeEleGraph[t]==contextCapability && idEleGraph==capabilityRequest) {
                            capabilityResponse = graphItem;
                        }
                    }
                }
            }
        }
        response.end(JSON.stringify(capabilityResponse));
    });
    return true;
});

// GET, POST, PUT by default
app.get('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end("{}");
});
app.post('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end("{}");
});
app.put('/*', function(request, response, next) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end("{}");
});