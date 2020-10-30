setInterval(loading, 5000);
   var myArrow = $('.arrow');
   function loading(){
    var angleDeg
    $.get('http://localhost:8080/', function(data, status) {
         data = JSON.parse(data);
         c1_x= parseFloat(data.current1); 
         c1_y=parseFloat(data.current2);
         c2_x=parseFloat(data.end1);
         c2_y = parseFloat(data.end2);   
        
         angleDeg = (Math.atan2(c2_y - c1_y, c2_x - c1_x) * 180 )/ Math.PI;
        
        
        $({deg: 0}).animate({deg: angleDeg}, {
            duration: 3000,
            step: function(now) {
                // in the step-callback (that is fired each step of the animation),
                // you can use the `now` paramter which contains the current
                // animation-position (`0` up to `angle`)
                myArrow.css({
                    transform: 'rotate(' + now + 'deg)'
                });
            }
        });
        console.log(c2_x + ',' + c2_y);
        console.log(angleDeg);
      });

      
      }

