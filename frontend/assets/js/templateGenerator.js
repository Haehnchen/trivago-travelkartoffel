window.locationData = [];
window.tripData = [];
window.tripStatus = [];

var initSlick = function(selector) {
    $(selector).slick({
        centerMode: true,
        centerPadding: '200px',
        slidesToShow: 3,
        focusOnSelect: true,
        slidesToScroll: 1,
        arrows: false,
        infinite: false,
        speed: 100,
        vertical: true,
        verticalSwiping: true
    });
}

var getRatingClass = function(value) {
    var rc = 0;

    if (value > 80) {
        rc = 4;
    } else if (value > 76 && value < 80) {
        rc = 3;
    } else if (value > 74 && value < 76) {
        rc = 2;
    } else if (value > 70 && value < 74) {
        rc = 1;
    }

    return rc;
};

var tileSource = $("#tile-template").html();
var tiletemplate = Handlebars.compile(tileSource);


function getTrivagoColor(index) {
    var colors = [
        "rgb(244, 143, 0)",
        "rgb(0, 127, 175)",
        "rgb(201, 74, 56)"
    ]

    return colors[index];
}

function fillColumn(locationId, startDate, endDate, index, done) {
    var url = "http://tripvago.ga/kartoffel/api/search/hotel-collection?path=" + locationId + "&start_date=" + startDate + "&end_date=" + endDate

    var source = $("#tile-template").html();
    var template = Handlebars.compile(source);

    var $tmp = $('<div style="width: 230px; height: 230px;"></div>');
    $.getJSON(url, function function_name(data) {

        var $container = $('.hotel-collection-result .slick-wrapper .slick').eq(index);
        var nights = parseInt($container.find('[name="nights"]').val(), 10);
        var hotelData = {};

        tripData[index] = {
            hotelId: null,
            data: data
        };

        data.items.forEach(function(item, index) {
            var info = {
                hotelIndex: index,
                hotelName: item.name,
                locationName: item.city,
                nights: nights,
                rating: getRatingClass(item.ratingValue),
                imageUrl: item.mainImage.extraLarge,
                priceFormatte: item.deals[0].price.formatted,
                stars: 'star_' + item.category
            };

            var html = template(info);

            $tmp.append(html);
        });

        $container
            .removeAttr('class')
            .addClass('center slick col-md-12 slick-' + index)
            .html($tmp.html());

        var price = 0;

        try {
            price = data.items[0].deals[0].price.formatted.replace('€', '');
            price = parseInt(price, 10);
        } catch (ex) {
            price = 99;
        }

        hotelData = {
            price: price,
            hotelIndex: 0,
            nights: nights,
            location: window.locationData[index].nameFormatted,
            pathId: window.locationData[index].pathId
        };

        updateStatus(index, hotelData);

        initTypeahead( $('.hotel-collection-result .slick-wrapper .slick:nth-child(' + (1 + index) +') .typeahead') );
        done();
    });
}


$('#startDate').datetimepicker({
    locale: 'en',
    format: 'YYYY-MM-DD'
});

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

var fillInital = function() {
    var ROWS = 3;
    var i = 0;
    var source = $('#tile-template-empty').html();
    var emptyTile = Handlebars.compile(source);
    var $item = emptyTile();
    var $tmp = '';

    for(i = 0; i < ROWS; i++) {
        $tmp = $('<div />').html($item);
        $tmp.find('.tile').attr('style', 'background-color: ' + getTrivagoColor(i) + ';');
        $item =  $tmp.html();

        $('.hotel-collection-result .slick-wrapper')
            .append('<div class="slick center col-md-12 slick-'+i+'" style="width: 230px; height: 230px;">' + $item + '</div>');
    }
    $('.hotel-collection-result .tile:first').addClass('is-active');
};

fillInital();

initSlick('.center');