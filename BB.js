/**
 * Created by alexismarien on 11/14/18.
 */
$(document).ready(function () {
    if ($('.results').is(':visible')) {
        $('.results').hide();
    }
    $('.modal').hide();

    $(document).on("click", ".content", function (event) {
        _moreInfo(event.target.children[0].innerText)
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
                e[i].rating + '/5 </span><button on-click="_moreInfo()" class="contentMoreInfo c" type="button">More Info</button>');

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


    $(document).click(function (e) {
        if (e.target.id != 'moreInfo' && !$('#moreInfo').find(e.target).length) {
            $(".modal").hide();
        }
    });

}

function _populateModal(truckData) {
    console.log(truckData)
    $('#modalFoodTruckName').text(truckData.foodTruck.name);
    $('#modalPhoneNumber').text(truckData.foodTruck.phoneNumber);
    $('#modalRating').text(truckData.foodTruck.rating + '/5');


}

function _hideModal() {

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

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(pos);
            marker = new google.maps.Marker({position: pos, map: map});

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

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







