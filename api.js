
const express = require('express');
const bodyParser = require('body-parser');
const file_streem = require('fs');
const turf = require('@turf/turf');

const port = 3001;

const server = express();

server.use(bodyParser.json());

var geolocations;

file_streem.readFile('./geolocations.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return
    }
    geolocations = JSON.parse(jsonString)
})

server.get("/gis/testpoint", (req, res) => {
    var lat = req.query.lat;
    var lng = req.query.lng;

    var polygons = [];

    // geolocations.features.forEach(function(element){

    //     var pg = turf.polygon(element.geometry.coordinates);
    //     var pt = turf.point([lat, lng]);
        
    //     if(turf.booleanPointInPolygon(pt, pg)){
    //         polygons.push(element.properties.name);
    //     }
    // });

    for(i in geolocations.features){
        var pg = turf.polygon(geolocations.features[i].geometry.coordinates);
        var pt = turf.point([lat, lng]);
        
        if(turf.booleanPointInPolygon(pt, pg)){
            polygons.push(geolocations.features[i].properties.name);
        }
    }

    
    res.json({polygons});
})

server.put("/gis/addpolygon", (req, res) => {
    const newPolygon = req.body;

    var has_polygon = false;

    for(i in geolocations.features){

        if(JSON.stringify(geolocations.features[i]) ===  JSON.stringify(newPolygon)){

            has_polygon = true;
        }
    }

    if(!has_polygon){
        geolocations.features.push(newPolygon);

        file_streem.writeFile('./geolocations.json', JSON.stringify(geolocations), err => {});

        res.json({ message : "successfully added"});
    }else{
        res.json({ message : "duplicate polygon"});
    }
})

server.listen(process.env.PORT || port, () => {
    console.log('listening on port %s...', port) 
   });
