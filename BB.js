

$(document).ready(function () {

   if ($('.results').is(':visible')) {

       $('.results').hide();

   }

   $('.modal').hide();


   $(document).on("click", ".content", function (event) {

       _moreInfo(event.target.children[0].innerText)

       $(".modal").show();


   });



   $(".content").click(function () {

       $(".modal").show();

   });


   $(".close-modal").click(function () {

       $(".modal").hide();

   });


   $(document).click(function (event) {

       //if you click on anything except the modal itself or the "open modal" link, close the modal

       if (!$(event.target).closest("#moreInfo").length && !$(event.target).closest(".content").length) {

           $(".modal").hide();

       }

   });



});


function testSlideHidden(e) {

   var trucks = e.length


   if (trucks > 0) {

       if ($('.results').is(':hidden')) {

           return true;

       } else {

           $('.results').slick('unslick');

           $('.results').hide();

           return true;

       }

   } else if (trucks === 0) {

       if (!($('.results').is(':hidden'))) {

           $('.results').slick('unslick');

           $('.results').hide();

           return false;

       } else {

           return false;

       }

   }

}


function createSlide(e) {

   if (testSlideHidden(e)) {

       $('.results').show();

       $('.content').remove();


       $('.results').slick({

           infinite: true,

           slidesToShow: 3,

           slidesToScroll: 3,

           dots: true

       });


       for (var i = 0; i < e.length; i++) {

           $('.results').slick('slickAdd',

               '<div class="content border box"><span class="contentName">' +

               e[i].name + '</span><br><img class="contentImg" src ="' +

               reformatImage(e[i].logoLink) + '"><span class="contentDistance"> Distance: ' +

               reformatMiles(e[i].distance) + ' Miles</span><br><span class="contentRating">Rating ' +

               e[i].rating + '/5 </span>');


       }


   }

}


function _moreInfo(name) {

   $('.modal').show();

   $.get("https://back-street-bites.appspot.com/_ah/api/backstreetbitesservice/v1/getFoodTruck?name=" +

       name,

       function (data) {

           _populateModal(data)

       }, "json");


   //

   // $(document).click(function (e) {

   //    if (e.target.id != 'moreInfo' && !$('#moreInfo').find(e.target).length) {

   //        $(".modal").hide();

   //    }

   // });


}


function _populateModal(truckData) {

   console.log(truckData)

   _resetModal();


   $.get('https://back-street-bites.appspot.com/_ah/api/backstreetbitesservice/v1/getMenuItems',

       function (data) {

           _createMenu(data.menu)

       }, 'json');

   $('#modalFoodTruckName').text(truckData.foodTruck.name);

   $('#modalLastUpdate').text('Last Update: ' + _lastUpdated(new Date(Date.parse(truckData.foodTruck.device.gpsLastUpdated))));

   $('#modalPhoneNumber').text('Phone Number: ' + truckData.foodTruck.phoneNumber);

   $('#modalRating').text('Rating: ' + truckData.foodTruck.rating + '/5');





}


function _resetModal() {

   $('#modalFoodTruckName').text('');

   $('#modalPhoneNumber').text('');

   $('#modalRating').text('');

   $('#menu').text('');

   $('#modalImage').text('');

   $('#modalLastUpdate').text('');

}


function _lastUpdated(date){

   var timeparts = [

       {name: 'year', div: 31536000000, mod: 10000},

       {name: 'day', div: 86400000, mod: 365},

       {name: 'hour', div: 3600000, mod: 24}

   ];


       var

           i = 0,

           l = timeparts.length,

           calc,

           values = [],

           interval = new Date().getTime() - date.getTime();

       while (i < l) {

           calc = Math.floor(interval / timeparts[i].div) % timeparts[i].mod;

           if (calc) {

               values.push(calc + ' ' + timeparts[i].name + (calc != 1 ? 's' : ''));

           }

           i += 1;

       }

       if (values.length === 0) { values.push('0 hours'); }

       return values.join(', ') + ' ago';



}


function _createMenu(data) {

   $('#menu').append("<ul id='newList'></ul>");

   for (cnt = 0; cnt < data.length; cnt++) {

       $("#newList").append("<li class='menuItem'><div class='foodContainer'>" +

           "<span class='foodTitle'><span class='foodName'>" + data[cnt].item + "</span><span class='foodPrice'>$" + data[cnt].price.toFixed(2) + "</span></span>" +

           "<img class='foodImage' src='"+ reformatImage(data[cnt].imageLink) + "'> " +

           "<div class='foodDescription'>" + data[cnt].description + "</div>" +

           "</div></li>");

   }

}


function reformatMiles(e) {

   return parseFloat(e).toFixed(2)

}


function reformatName(e) {

   console.log(e)

}


function reformatImage(e) {

   if (e) {

       return e

   } else {

       return "Images/TransLogo_xxxhdpi.png"

   }

}

function initMap() {

   var center = {};

   var detroit = {lat: 42.35, lng: -83.09};

   var raleigh = {lat: 35.78, lng: -78.64};

   var map = new google.maps.Map(document.getElementById('map'), {

       zoom: 11,

       center: detroit,

       fullscreenControl: false,

       mapTypeControl: false

   });

   var marker = new google.maps.Marker({position: detroit, map: map});


   infoWindow = new google.maps.InfoWindow;

}


function placeTrucksOnMap(trucks) {


   var zoom = 11;

   var detroit = {lat: 42.35, lng: -83.09};

   var raleigh = {lat: 35.78, lng: -78.64};

   var location = $('#searchName').val();

   var distance = $('#searchDistance').val();


   var city = detroit


   if (location == "Detroit") {

       city = detroit;

   } else if (location == "Raleigh") {

       city = raleigh

   }


   if (distance < 4) {

       zoom = 12

   } else if (distance >= 4) {

       zoom = 11

   }


   var map = new google.maps.Map(document.getElementById('map'), {

       zoom: zoom,

       center: city,

       fullscreenControl: false,

       mapTypeControl: false

   });

   var infowindow = new google.maps.InfoWindow();

   var marker = new google.maps.Marker({position: city, map: map});

   var truckImage = {

       url: 'Images/truckmarker.png',

       scaledSize: new google.maps.Size(50, 50)

   };


   for (var i = 0; i < trucks.length; i++) {

       var truck = trucks[i];

       marker = new google.maps.Marker({

           position: {lat: truck[1], lng: truck[2]},

           map: map,

           title: truck[0],

           zIndex: truck[3],

           clickable: true,

           icon: truckImage,

       });

       google.maps.event.addListener(marker, 'click', (function (marker, i) {

           return function () {

               infowindow.setContent(trucks[i][0]);

               infowindow.open(map, marker);

               truckSelected(trucks[i][0])

               // _moreInfo(trucks[i][0])

           }

       })(marker, i));

   }


}



function searchBtnClicked() {

   var value = $('#search').val();

   var location = $('#searchName').val();

   var distance = $('#searchDistance').val();


   findTrucks(location, distance);

}


function findTrucks(location, distance) {

   $('#truckSlide').removeClass("truckSlideShow");


   var lat, long


   lat = findLatLong(location).lat;

   long = findLatLong(location).long;

//   location = $('#searchName').val();


   $.get("https://back-street-bites.appspot.com/_ah/api/backstreetbitesservice/v1/getTrucksWithinDistance?distance=" +

       distance + "&gpsLat=" +

       lat + "&gpsLon=" +

       long,

       function (data) {

           mapList(data.foodTrucks)

           mapTruckLocations(data.foodTrucks, location)

           createSlide(data.foodTrucks);

       }, "json");


}


function findLatLong(location) {

   var latlong = {}

   if (location == "Detroit") {

       latlong = {lat: 42.35, long: -83.09}

   } else if (location == "Raleigh") {

       latlong = {lat: 35.78, long: -78.64}


   }


   return latlong

}


function mapList(list) {


}

function mapTruckLocations(list) {

   var trucks = new Array();


   for (var i = 0; i < list.length; i++) {

       trucks.push(new Array(list[i].name,

           list[i].device.gpsLat,

           list[i].device.gpsLon,

           i + 1))

   }


   placeTrucksOnMap(trucks);

}


function truckSelected(truck) {

   var name;


   name = truck



   $.get("https://back-street-bites.appspot.com/_ah/api/backstreetbitesservice/v1/getFoodTruck?name=" +

       name,

       function (data) {

           showTruck(data.foodTruck)

       }, "json");


}


function showTruck(truck) {

   $('#truckSlide').addClass("truckSlideShow");

   $('#truckSlide').text('');


   $('#truckSlide').text(truck.name);


}
