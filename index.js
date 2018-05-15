var map, centerPos = {lat: 40.7291, lng: -73.9965},coordLat, coordLng, myLatLng, marker;
const NeighNames = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const Geoshapes = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson";
const NYhousing = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";
const CrimesNY = "https://data.cityofnewyork.us/api/views/wuv9-uv8d/rows.json?accessType=DOWNLOAD";
//infoNYhousing[Boro,lat,lng,type,distric,ExtUnits] infoCrimes[[Borough],[District],[Description],[Lat lng],[Time]]
var infoNeighborhood= [], infoNYhousing = [], infoCrimes = [];
var allMarkers = [], allMarkersHous = [];
var newR, info, tableReference;
var namesBoro = ["Manhatan","Bronx","Brooklyn","Queens","StateIsland"];
var districH = [[],[],[],[],[]],distanceDistric = [[],[],[],[],[]];
var polyBoro = [[],[],[],[],[]];

(function () {    
    getDataURL();
    $('#clasificationByAffor').hide();
    $('#clasificationByDis').hide();   
    $('#clasificationBySec').hide();   
    var bool = true;
    document.getElementById("Home").addEventListener("click", function () {
        $('#googleMapConteiner').show();
        $('#buttonboro').show();
        $('#clasificationByAffor').hide();
        $('#clasificationByDis').hide();  
        $('#clasificationBySec').hide();   
    });
    
    document.getElementById("Data").addEventListener("click", function () {        
    
        if(bool){fillTableOfDis();}        
        $('#googleMapConteiner').hide();
        $('#buttonboro').hide();
        $('#clasificationByAffor').show();
        $('#clasificationByDis').show();  
        $('#clasificationBySec').show();   
        bool = false;
    });

    document.getElementById("Bronx").addEventListener("click", function () {
        styleMapByBoro(2);
        for (var i = 0; i < infoNeighborhood.length; i++){
            if(infoNeighborhood[i][3] == "Bronx"){
                allMarkers[i].setVisible(true);
            }else{
                allMarkers[i].setVisible(false);
            }            
        }  
        
    });

    document.getElementById("Brooklyn").addEventListener("click", function () {
        styleMapByBoro(3);
        for (var i = 0; i < infoNeighborhood.length; i++){
            if(infoNeighborhood[i][3] == "Brooklyn"){
                allMarkers[i].setVisible(true);
            }else{
                allMarkers[i].setVisible(false);
            }            
        }
    });

    document.getElementById("Manhattan").addEventListener("click", function () {
        styleMapByBoro(1);
        for (var i = 0; i < infoNeighborhood.length; i++){
            if(infoNeighborhood[i][3] == "Manhattan"){
                allMarkers[i].setVisible(true);
            }else{
                allMarkers[i].setVisible(false);
            }            
        }
        
    });

    document.getElementById("Queens").addEventListener("click", function () {
        styleMapByBoro(4);
        for (var i = 0; i < infoNeighborhood.length; i++){
            if(infoNeighborhood[i][3] == "Queens"){
                allMarkers[i].setVisible(true);
            }else{
                allMarkers[i].setVisible(false);
            }            
        }
    });

    document.getElementById("Staten Island").addEventListener("click", function () {
        styleMapByBoro(5);
        for (var i = 0; i < infoNeighborhood.length; i++){
            if(infoNeighborhood[i][3] == "Staten Island"){
                allMarkers[i].setVisible(true);
            }else{
                allMarkers[i].setVisible(false);
            }            
        }
    });
})();

function getDataURL(URL){
    var dataN = $.get(NeighNames,function(){})    
        .done(function(){
            var dataR = dataN.responseJSON.data;
            for (var i = 0; i < dataR.length; i++) {
                coordLat = dataR[i][9].split(" ")[1].split("(")[1];
                coordLng = dataR[i][9].split(" ")[2].split(")")[0];
                infoNeighborhood.push([coordLat, coordLng, dataR[i][10], dataR[i][16]]);                
            }
            fillArray();

        })
        .fail(function(error){
            console.log(error);
        })

    var dataH = $.get(NYhousing,function(){})
        .done(function(){
            
            var dataHR = dataH.responseJSON.data;
            
            for(var i = 0; i < dataHR.length; i++){
                coordLat = parseFloat(dataHR[i][23]);
                coordLng = parseFloat(dataHR[i][24]);
                infoNYhousing.push([dataHR[i][15],coordLat,coordLng,dataHR[i][28],parseInt(dataHR[i][20]),parseInt(dataHR[i][31])])                               
            }
            infoNYhousing.sort(function(a,b){
                return a[4] - b[4];
            });
            fillArrayHous();
            //console.log(infoNYhousing);
        })
        .fail(function(error){
            console.log(error);
        })
    var dataC = $.get(CrimesNY,function(){})   
        .done(function(data){            
            var dataCR = dataC.responseJSON.data;
            for(var i = 0; i < dataCR.length;i++){
                coordLat = parseFloat(dataCR[i][29]);
                coordLng = parseFloat(dataCR[i][30]);
                myLatLng = {lat: coordLat, lng: coordLng};
                infoCrimes.push([dataCR[i][21],
                    "Dis",
                    dataCR[i][15],myLatLng,dataCR[i][10]]);
            }
            fillArrayCrimes();
        })
        .fail(function(error){
            console.log(error);
        })
   
}
 
function getColor(number) {
    var color;
    switch(number){
        case 1:
            color = '#7FFF00';
            break;
        case 2:
            color = '#A52A2A';
            break;
        case 3:
            color = '#FF8C00';
            break;
        case 4:
            color = '#FFD700';
            break;
        case 5:
            color = '#6495ED';
            break;
        default:
            color += number;
            color += number; 
    }   
    return color;
}

function onGoogleMapResponse(){
    map = new google.maps.Map(document.getElementById('googleMapConteiner'),{
        center: centerPos,
        zoom: 10
    });

    map.data.loadGeoJson('https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson');    
    map.data.setStyle(function(){
        var color = '#FFFFF0';
        return{
            fillColor: color,
            strokeWeight: 1
        }
    })
    marker = new google.maps.Marker({
        position: centerPos,
        map: map,
        title: "University"
    })
    styleMapByDis();
};

function styleMapByBoro(number){    
    var boro,color;  
    map.data.setStyle(function(feature) {        
        boro = Math.floor(feature.f.BoroCD/100);           
        if(boro == number){
            color = getColor(number);
            return {
            fillColor: color,
            strokeWeight: 1
            };
        } else{
            color = '#FFFFF0';
        return{
            fillColor: color,
            strokeWeight: 1
        }

        }            
    }); 

}

function styleMapByDis(){
    var boro,dis,color,bool,bounds = new google.maps.LatLngBounds();  
    var districNH = [26,27,28,55,56,64,80,81,82,83,84,95];    
    map.data.setStyle(function(feature) {        
        boro = Math.floor(feature.f.BoroCD/100);
        dis = feature.f.BoroCD - (100*boro); 
        for(var i = 0; i<districNH.length;i++){
            if(dis==districNH[i]){
                bool=true;
                break;
            }else{
                bool = false;
            }
        }  
        var temp = feature.b.b; 
        if(bool){            
            var coordDisNH;
            if(temp.length==1){
                for(var i = 0; i<temp.length;i++){
                    coordDisNH = temp[0].b;                 
                   // console.log(coordDisNH);
                }                
            }else{
                for(var i = 0; i<temp.length;i++){    
                    coordDisNH = temp[i].b[0].b;                 
                    //console.log(coordDisNH);
                }/**/
            } 
            for (i = 0; i < coordDisNH.length; i++) {
                bounds.extend(coordDisNH[i]);
            }
            var disPolygon = new google.maps.Polygon({
                paths: coordDisNH,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: '#008000',
                fillOpacity: 2
              });
              disPolygon.setMap(map);           
            //
        }else{
            var coordDisH = [];
            if(temp.length==1){
                for(var i = 0; i<temp.length;i++){
                    coordDisH[i] = temp[0].b;                 
                   // if(boro ==1 &&dis==8){console.log(coordDisH);}
                }                
            }else{
                for(var i = 0; i<temp.length;i++){    
                    coordDisH[i] = temp[i].b[0].b;                 
                   /* if(boro ==1 &&dis==8){console.log(coordDisH);}*/
                }
            } 
            for (var i = 0; i < coordDisH.length; i++) {
                for(var j=0; j<coordDisH[i].length;j++){
                    temp = coordDisH[i][j].toString().split("(")[1];
                    coordLat = parseFloat(temp.split(",")[0]);
                    coordLng = parseFloat(temp.split(",")[1].split(")")[0]);   
                    myLatLng = {lat: coordLat, lng:coordLng};
                    bounds.extend(myLatLng);
                }
            }
            var color = '#';
            switch(boro){
                case 1:
                    districH[0][dis-1] = polygonCenter(coordDisH);
                    //addMarker(polygonCenter(coordDisH),"Manhatan " + dis.toString());
                    polyBoro[0][dis-1] = addPolygon(coordDisH);
                    break;
                case 2:
                    districH[1][dis-1] = polygonCenter(coordDisH);
                    //addMarker(polygonCenter(coordDisH),"Bronx " + dis.toString());
                    polyBoro[1][dis-1] = addPolygon(coordDisH);
                    break;
                case 3:
                    districH[2][dis-1] = polygonCenter(coordDisH);
                    //addMarker(polygonCenter(coordDisH),"Brooklyn " + dis.toString());
                    polyBoro[2][dis-1] = addPolygon(coordDisH);
                    break;
                case 4:
                    districH[3][dis-1] = polygonCenter(coordDisH);
                    //addMarker(polygonCenter(coordDisH),"Queens " + dis.toString());
                    polyBoro[3][dis-1] = addPolygon(coordDisH);
                    break;
                case 5:
                    districH[4][dis-1] = polygonCenter(coordDisH);
                    //addMarker(polygonCenter(coordDisH),"State Island " + dis.toString());
                    polyBoro[4][dis-1] = addPolygon(coordDisH);
                    break;
            }
        }       
    }); 
}

function addMarker(pos,tit){
    marker=new google.maps.Marker({
        position: pos,
        map: map,
        title: tit
    })
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addPolygon(posPath){
    var color = getRandomColor();
    var disPolygon = new google.maps.Polygon({
        paths: posPath,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 0.5,
        fillColor: color,
        fillOpacity: 0.5
      });
      disPolygon.setMap(map); 
      return disPolygon;
}

function polygonCenter(Path) {
    var lowx,highx,lowy,highy,
        lats = [],lngs = [],
        vertices = Path;
    var temp;
    for(var i=0; i<vertices.length; i++) {
        for(var j=0;j<vertices[i].length;j++){
            temp = vertices[i][j].toString().split("(")[1];
            coordLat = parseFloat(temp.split(",")[0]);
            coordLng = parseFloat(temp.split(",")[1].split(")")[0]);           
            lats.push(coordLat);
            lngs.push(coordLng);
        }
      
    }
    lats.sort();
    lngs.sort();
    lowx = lats[0];
    highx = lats[lngs.length - 1];
    lowy = lngs[0];
    highy = lngs[lngs.length - 1];
    center_x = lowx + ((highx-lowx) / 2);
    center_y = lowy + ((highy - lowy) / 2);
    myLatLng = {lat: center_x, lng:center_y};
    /*marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: "Manhatan"
    });*/   
    return (new google.maps.LatLng(center_x, center_y));
    
                    
}

function fillArray(){
    for (var i = 0; i < infoNeighborhood.length; i++){
        myLatLng = {lat: parseFloat(infoNeighborhood[i][1]), lng: parseFloat(infoNeighborhood[i][0])};
        marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: infoNeighborhood[i][2]
        });
        allMarkers.push(marker);
        allMarkers[i].setVisible(false);        
    }
}

function fillArrayHous(){
    tableReference = document.getElementById("clasificationByAffor");
    info = tableReference.rows[0].insertCell();
    info.innerHTML = "Total";
    info = tableReference.rows[0].insertCell();
    info.innerHTML = "Avarage";
    var total = 0,mean = 0;
    for (var i = 0; i < infoNYhousing.length; i++){
        
        if(i>0){
            if(infoNYhousing[i][4]==infoNYhousing[i-1][4]){
                total++;
                mean+=infoNYhousing[i-1][5];
            }else{
                mean+=infoNYhousing[i-1][5];
                newR = tableReference.insertRow();
                info = newR.insertCell(0);
                info.innerHTML = infoNYhousing[i][0];
                info = newR.insertCell();
                info.innerHTML = infoNYhousing[i-1][4];
                info = newR.insertCell();
                info.innerHTML = total;
                info = newR.insertCell();
                info.innerHTML = mean/total;
                total = 0; 
                mean = 0;
            }
        }
             
        myLatLng = {lat: infoNYhousing[i][1], lng: infoNYhousing[i][2]};        
        marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: infoNYhousing[i][3]
        });
        allMarkersHous.push(marker);
        allMarkersHous[i].setVisible(false);        
    }
}

function fillTableOfDis(){
    /*console.log(b.selectedIndex);
    var boro = b[b.selectedIndex].value;*/
    calculateDis();
    
    tableReference = document.getElementById("clasificationByDis");
    for(var i = 0; i<districH.length;i++){                             
        for(var j=0;j<districH[i].length;j++){
            info = tableReference.insertRow();
            info.insertCell().innerHTML = namesBoro[i];    
            info.insertCell().innerHTML = (j+1).toString(); 
            info.insertCell().innerHTML = distanceDistric[i][j].toString(); 
            // info.style.display = 'none';
        }
    }
    // switch(boro){
    //     case "all": 
    //         for(var i = 0; i<districH.length;i++){                             
    //             for(var j=0;j<districH[i].length;j++){
    //             }
    //         }
    //         break;
    //     case "manhattan":
    //         for(var i = 0; i<districH[0].length;i++){
                    
    //         }
    //         break;        
    //     case "bronx":
    //         for(var i = 0; i<districH[1].length;i++){
                        
    //         }
    //         break;
    //     case "brooklyn":
    //         for(var i = 0; i<districH[2].length;i++){
                        
    //         }
    //         break;        
    //     case "queens":
    //         for(var i = 0; i<districH[3].length;i++){
                        
    //         }
    //         break;
    //     case "staten_island":
    //         for(var i = 0; i<districH[4].length;i++){
                        
    //         }
    //         break;
    //     default:
    //         break;
    // }
}

function fillArrayCrimes(){

}

function rad(x) {
    return x * Math.PI / 180;
};
  
function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

function districtBoro(position,boro){
    for(var i = 0;i<namesBoro.length;i++){
        if(boro == namesBoro[i]){
            boro = i;
            break;
        }
    }
    /*for(var i = 0;i<polyBoro[boro].length;i++){
        
    }*/
    //console.log();
    console.log(google.maps.geometry.poly.containsLocation(centerPos, polyBoro[0][0]));
    var sol = 0;
    return sol;
}

function calculateDis(){
    var distance,temp;
    for(var i = 0;i<districH.length;i++){
        for(var j = 0;j<districH[i].length;j++){            
            temp = districH[i][j].toString().split("(")[1];
            coordLat = parseFloat(temp.split(",")[0]);
            coordLng = parseFloat(temp.split(",")[1].split(")")[0]);    
            myLatLng = {lat:coordLat,lng:coordLng};
            distance  = getDistance(centerPos,myLatLng);
            distanceDistric[i][j]=distance;
            /*console.log(distance);*/
        }        
    }  
    console.log(districH[0].length);
}