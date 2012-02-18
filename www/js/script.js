      USA_SPACING_X = 24.0;
      USA_SPACING_Y = 7.0;
      THOUSAND_DOLLARS_PER_PIXEL_WIDTH = 100000.0;
      USA_COORDINATE = new google.maps.LatLng(39.095963,-102.207031); // USA

      var map;
      var trade_flows = {};
      var years;
      var countries = {};
      var tips = {};

      var current_year;
      var last_hash = null;


      initial_year = null;
      initial_latlng = null;
      initial_zoom = null;
      initial_parts = window.location.hash.split('/');
      if(initial_parts.length == 4)
      {
         initial_year = initial_parts[1];
         initial_latlng = new google.maps.LatLng(initial_parts[2].split(',')[0], initial_parts[2].split(',')[1]);
         initial_zoom = parseInt(initial_parts[3]);
      }


      function setState(hash) {
         parts = hash.split('/');
         if(parts.length == 4)
         {
            console.log('doin stuff');
            console.log(parts);
            year = parts[1];
            latlng = new google.maps.LatLng(parts[2].split(',')[0], parts[2].split(',')[1]);
            zoom = parseInt(parts[3]);

            map.setZoom(zoom);
            map.setCenter(latlng);
            setYear(year);
            $('#slider').slider('value', year);
            console.log('did stuff');
         }
      }

      function createTradeFlows(country_name, country) {
        //var USA_COORDINATE = new google.maps.LatLng(39.095963,-97.207031); // USA
        var   toCoordinate = new google.maps.LatLng(country['latLng'][0], country['latLng'][1]);

        var heading        = google.maps.geometry.spherical.computeHeading(USA_COORDINATE, toCoordinate);
        var reverseHeading = google.maps.geometry.spherical.computeHeading(toCoordinate, USA_COORDINATE);
        heading        = heading * Math.PI / 180.0;
        reverseHeading = reverseHeading * Math.PI / 180.0;
        var usaRoomCoordinate = new google.maps.LatLng(USA_COORDINATE.lat() + USA_SPACING_Y * Math.cos(heading),
                                                       USA_COORDINATE.lng() + USA_SPACING_X * Math.sin(heading));
      
        var fromLeftHeading  = heading + Math.PI / 2.0;
        var fromRightHeading  = heading - Math.PI / 2.0;
        var toLeftHeading   = reverseHeading + Math.PI / 2.0;
        var toRightHeading   = reverseHeading - Math.PI / 2.0;

        countries[country_name] = {
           'export': {
              'fromLeftHeading': fromLeftHeading,
              'toRightHeading':  toRightHeading 
           },
           'import': {
              'fromLeftHeading': toLeftHeading,
              'toRightHeading':  fromRightHeading 
           }
        };

        var exportCoordinates = [ usaRoomCoordinate, toCoordinate, toCoordinate, usaRoomCoordinate ];
        var importCoordinates = [ toCoordinate, usaRoomCoordinate, usaRoomCoordinate, toCoordinate ];

        function createPath(type, country_name, coords, color, hover_color) {
           var flow = new google.maps.Polygon({
              path: coords,
              fillColor: color,
              fillOpacity: 0.8,
              strokeWeight: 0,
              geodesic: true
           });

           flow.setMap(map);

           google.maps.event.addListener(flow, 'mouseover', function(event) {
              flow.setOptions({ fillColor: hover_color});
              tooltip.show(tips[current_year][country_name][type], 200);
           });
           //google.maps.event.addListener(flow, 'mousemove', function(event) {
           //});
           google.maps.event.addListener(flow, 'mouseout', function(event) {
              flow.setOptions({ fillColor: color});
              tooltip.hide();
           });
           trade_flows[country_name][type] = flow;
        }

        trade_flows[country_name] = {};
        createPath('export', country_name, exportCoordinates, '#555', '#333');
        createPath('import', country_name, importCoordinates, '#C55', '#C33');
      }

      function updateFlow(type, country, trade_volume) {
         fromCoordinate = trade_flows[country][type].getPath().getAt(0);
         toCoordinate   = trade_flows[country][type].getPath().getAt(1);

         fromLeftHeading = countries[country][type]['fromLeftHeading'];
         toRightHeading  = countries[country][type]['toRightHeading'];

         // TODO do nice freaky arrow heads
 
         fromLeftCoord = new google.maps.LatLng(fromCoordinate.lat() + trade_volume * Math.cos(fromLeftHeading) / THOUSAND_DOLLARS_PER_PIXEL_WIDTH,
                                                fromCoordinate.lng() + trade_volume * Math.sin(fromLeftHeading) / THOUSAND_DOLLARS_PER_PIXEL_WIDTH);
         toRightCoord  = new google.maps.LatLng(toCoordinate.lat()   + trade_volume * Math.cos(toRightHeading) / THOUSAND_DOLLARS_PER_PIXEL_WIDTH,
                                                toCoordinate.lng()   + trade_volume * Math.sin(toRightHeading) / THOUSAND_DOLLARS_PER_PIXEL_WIDTH);

         // update toRightCoord
         trade_flows[country][type].getPath().setAt(2, toRightCoord);

         // update fromLeftCoord
         trade_flows[country][type].getPath().setAt(3, fromLeftCoord);

      }

      function updateFlows(country, stats) {
         export_volume = parseFloat(stats['exports_year_total']);
         import_volume = parseFloat(stats['imports_year_total']);
         updateFlow('export', country, export_volume);
         updateFlow('import', country, import_volume);
      }

      function setYear(year) {
         current_year = year;
         $.each(years[year], function(country, stats) {
            if(country in trade_flows) {
               updateFlows(country, stats);
            }
         });
         $('#slider_ticks div').removeClass('current_tick');
         $('#slider_ticks div').addClass('not_current_tick');
         $('#tick'+year).addClass('current_tick');
      }


      function formatMillionsOfDollars(millions, css_class) {
         dollars = Math.floor(millions) * 1000000;
         dollars = dollars.toString();
         dollars_with_commas = "";
         for(c = dollars.length-1; c >= 0; c--) {
            dollars_with_commas = dollars[c] + dollars_with_commas;
            if((dollars.length - c) % 3 == 0 && c != 0)
               dollars_with_commas = ',' + dollars_with_commas;
         }
         return '<span class="'+css_class+'">$'+dollars_with_commas+'</span>';
      }

      function updateHash() {
         if(last_hash != window.location.hash) {
            console.log("not last hash");
            last_hash = window.location.hash;
            setState(window.location.hash);
         }
         else {
            window.location.hash = "/" + current_year + "/" + map.getCenter().toUrlValue() + "/" + map.getZoom();
            last_hash = window.location.hash;
         }
      }

      function initialize() {
         var myOptions = {
            //center: USA_COORDINATE,
            center: initial_latlng ? initial_latlng : USA_COORDINATE,
            disableDefaultUI: true,
            zoom: initial_zoom ? initial_zoom : 3,
            mapTypeId: google.maps.MapTypeId.ROADMAP
         };
         map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
         //google.maps.event.addListener(map, 'bounds_changed', function() {
         //   window.location.hash = "/" + map.getCenter().toUrlValue();
         //});

         var int=self.setInterval("updateHash()", 1000);

         $.getJSON('usa_trade_data.js', null, function(data) {
            console.log(data);
            low = -1;
            high = -1;
            $.each(data, function(key, value) {
               if(key == 'countries') {
                  geocodes = value;
                  // TODO order by length and draw longer lines first, so they don't cover up smaller lines
                  $.each(value, function(country_name, country) {
                     if( country_name != "North America" &&
                         country_name != "Europe" &&
                         country_name != "NICS" &&
                         country_name != "OPEC" &&
                         country_name != "Africa" ) {
                        //console.log(country_name);
                        createTradeFlows(country_name, country);
                     }
                  });
               }
               if(key == 'trade') {
                  years = value;
                  $.each(value, function(year, countries) {

                     year = parseInt(year);

                     if(high == -1) {
                        high = year;
                        low = year;
                     }
                     if(year > high)
                        high = year;
                     if(year < low)
                        low = year;

                     tips[year] = {};
                     $.each(countries, function(country_name, stats) {
                        tips[year][country_name] = {};
                        import_volume = formatMillionsOfDollars(stats['imports_year_total'], 'import_dollars');
                        export_volume = formatMillionsOfDollars(stats['exports_year_total'], 'export_dollars');
                        tips[year][country_name]['import'] = ''+import_volume+" imported from "+country_name+" in "+year;
                        tips[year][country_name]['export'] = '' + export_volume+" exported to "+country_name+" in "+year;
                     });

                  });

                  //console.log(low);
                  //console.log(high);

                  $( "#slider" ).slider({
                     value:high,
                     min: low,
                     max: high,
                     step: 1,
                     slide: function( event, ui ) {
                        $('#tick'+current_year).removeClass('current_tick');
                        $('#tick'+current_year).addClass('not_current_tick');
                        setYear(ui.value);
                        $( "#year" ).val( "$" + ui.value );
                     }
                  });
                  handle_height_increase = 1;
                  $('.ui-slider-handle').css({top:'-2em', height:'3em', 'z-index':'1003'});
                  $( "#year" ).val( "$" + $( "#slider" ).slider( "value" ) );


                  // fill in dynamic title content
                  $('#low').html(low);
                  $('#high').html(high);
                  $('#nominal_dollars').mouseover(function() {
                     tooltip.show('Nominal dollars are <b>not</b> adjusted for inflation.', 200, 'se');
                  });
                  $('#nominal_dollars').mouseout(function() {
                     tooltip.hide();
                  });
            
                  slider_width = $('#slider').width();
                  console.log(slider_width);
                  for(y = low; y <= high; y += 1) {
                     fraction = (y - low) / (high - low);
                     $('#slider_ticks').append('<div class="not_current_tick" id="tick'+y+'">'+y+'</div>');
                     $('#tick'+y).css({
                        left: (slider_width * (fraction))+10 + "px"
                     });
                  }



               }
            });

            //console.log(trade_paths);




            setYear(initial_year ? initial_year : high);
            //setState(window.location.hash);

            console.log('tips:');
            console.log(tips);


         });


      }
