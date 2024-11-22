var aisisDestroyed = false
var prettyHome = true;
chrome.storage.local.get(['disable_home'], function(result) {
    prettyHome = !result.disable_home
})
var perfRes = 1;
benchmarkPerformance((avgFrameTime) => {
  if (avgFrameTime > 50) {
    perfRes = 2
  } else if (avgFrameTime > 20) {
    perfRes = 3
  } else if (avgFrameTime > 10) {
    perfRes = 4
  } else {
    perfRes = destructableTables.length-1
  }
  console.log(`Benchmark Results | frametime:${avgFrameTime} Result:${perfRes}`)
});
var destructableTables = [11,2,3,5,9,10,12]
var spansOnlyTables = new Set([9,12])
function destroyAISIS() {
    if (prettyHome) return alert("🤔 hmm... nothing happened.");
    var sitemap = document.getElementsByTagName('table')[11]
    parsedTable = parseTable(sitemap)
    if (!parsedTable || parsedTable[0][0][0] !== 'Site Map') return alert("🤔 hmm... nothing happened.");
    if (aisisDestroyed) return;
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'None'
    document.body.style['-webkit-user-select'] = 'None'

    for (var img of document.querySelectorAll('img, a')) {
        img.setAttribute('draggable', false);
    }
    for (var [index, tableI] of destructableTables.entries()) {
      if (index > perfRes) {
        break;
      }
        var toPhys = 'td:not(:has(td))' 
        if (spansOnlyTables.has(tableI)) toPhys = 'span'
        for (var obj of document.querySelectorAll('table')[tableI].querySelectorAll(toPhys)) {
            if (toPhys == 'td:not(:has(td))') {
                var bg = window.getComputedStyle(obj).getPropertyValue('background');
                if (!bg.includes('url') && obj.querySelector('a') && false) {
                    console.log('found clear td')
                    var divCont = document.createElement('div')
                    obj.parentElement.appendChild(divCont)
                    divCont.appendChild(obj.querySelector('a'))
                    divCont.style.width = 'max-content'
                    divCont.classList.add('phys')
                } else {
                    obj.classList.add('phys')
                }
                continue
            }
            var divCont = document.createElement('div')
            obj.parentElement.appendChild(divCont)
            divCont.appendChild(obj)
            divCont.style.width = 'max-content'
            divCont.classList.add('phys')
        }
    }
    for (var obj of document.querySelectorAll('.text04')[7].querySelectorAll('span')) {
        var divCont = document.createElement('div')
        obj.parentElement.appendChild(divCont)
        divCont.appendChild(obj)
        divCont.style.width = 'max-content'
        divCont.classList.add('phys')
    }
    
    var boundaries = []
    var boundaryClasses = ['ground','wall1','wall2','ceil']
    for (let i=0;i<4;i++) {
        boundaries.push(document.createElement('div'))
        boundaries[i].classList.add('phys-static')
        boundaries[i].classList.add(`phys-${boundaryClasses[i]}`)
    }
    for (var el of boundaries) {
        document.body.appendChild(el);
    }

    (function () {

        // Flatten Box2d (ugly but handy!)
        (function b2(o) {
          for (k in o) {
            if (o.hasOwnProperty(k)) {
              if ($.isPlainObject(o[k])) {
                b2(o[k]);
              } else if (/^b2/.test(k)) {
                window[k] = o[k];
              }
            }
          }
        }(Box2D));
        
        var world = new b2World(
          new b2Vec2(0, 9.81), // gravity
          true                 // allow sleep
        );
        var SCALE = 30;
        
        //
        // Ground
        //
        
        $('.phys-static').each(function (i, el) {
            var objStatic = $(el);
          // Fixture
          var fixDef = new b2FixtureDef;
          fixDef.density = 1;
          fixDef.friction = 0.5;
          fixDef.restitution = 0.2;
        
          // Shape
          fixDef.shape = new b2PolygonShape;
          fixDef.shape.SetAsBox(
            objStatic.outerWidth() / 2 / SCALE, //half width
            objStatic.outerHeight() / 2 / SCALE  //half height
          );
        
          // Body
          var bodyDef = new b2BodyDef;
          bodyDef.type = b2Body.b2_staticBody;
          console.log(objStatic.offset().left, objStatic.offset().top)
          bodyDef.position.x = (objStatic.offset().left + objStatic.outerWidth() / 2) / SCALE;
          bodyDef.position.y = (objStatic.offset().top + objStatic.outerHeight() / 2) / SCALE;
          var body = world.CreateBody(bodyDef);
          body.CreateFixture(fixDef);
          objStatic.data('body', body);
        });
        
        //
        // Crates
        //
        
        $('.phys').each(function (i, el) {
          var phyObj = $(el);
        
          // Fixture
          var fixDef = new b2FixtureDef;
          fixDef.density = 1;
        //   fixDef.density = phyObj.outerWidth()*phyObj.outerHeight()/20000;
        //   console.log(`set density to ${phyObj.outerWidth()*phyObj.outerHeight()/30000}`)
          fixDef.friction = 0.5;
          fixDef.restitution = 0.2;
        
          // Shape
          fixDef.shape = new b2PolygonShape;
          fixDef.shape.SetAsBox(
            phyObj.outerWidth() / 2 / SCALE, //half width
            phyObj.outerHeight() / 2 / SCALE  //half height
          );
        
          // Body
          var bodyDef = new b2BodyDef;
          bodyDef.type = b2Body.b2_dynamicBody;
          bodyDef.position.x = (phyObj.offset().left + phyObj.outerWidth() / 2) / SCALE;
          bodyDef.position.y = (phyObj.offset().top + phyObj.outerHeight() / 2) / SCALE;
        
          var body = world.CreateBody(bodyDef);
          body.CreateFixture(fixDef);
          body.SetAngularVelocity(getRandomFloat());

          phyObj.data('body', body);
        });

        var mouse = new b2Vec2();
        $(window).mousemove(function (e) {
          mouse.Set(e.pageX / SCALE, e.pageY / SCALE);
        });
        window.mouse = mouse;
        
        (function (mouse) {
          var mouseJointDef = new b2MouseJointDef();
          mouseJointDef.target = mouse;
          mouseJointDef.bodyA = world.GetGroundBody();
          mouseJointDef.collideConnected = true;
        
          var mouseJoint;
          $('*').on({
            mousedown: function (e) {
              var body = $(this).data('body');
        
              if (!body) {
                return;
              }
        
              mouseJointDef.bodyB = body;
              mouseJointDef.maxForce = 3000 * body.GetMass();
        
              mouseJoint = world.CreateJoint(mouseJointDef);
              mouseJoint.SetTarget(mouse);
        
              function mouseup(e) {
                world.DestroyJoint(mouseJoint);
              }
        
              $(window).one('mouseup', mouseup);
            }
          });
        }(mouse));
        
        //
        // Loops
        //
        
        (function () {
          var dt = 30;
          new Loop(function () {
            world.Step(
              1.4/dt, //frame-rate
              10,   //velocity iterations
              10    //position iterations
            );
        
            world.ClearForces();
        
          }, 1000/dt).start();
        }());
        
        (function () {
          var $entities = $('.phys, .phys-static');
          // cache some initial coordinates informations
          $entities.each(function (i, el) {
            var $el = $(el);
            $el.data('origPos', {
              left: $el.offset().left,
              top: $el.offset().top,
              width: $el.outerWidth(),
              height: $el.outerHeight()
            });
          });
        
          new Loop(function (t, t0) {
            if (!t0) {
              return;
            }
            var dt = t - t0;
            if (dt <= 0) {
              return;
            }
        
            var i = $entities.length
            while (i--) {(function () {
              var entity = $entities[i];
              var $entity = $(entity);
        
              var body = $entity.data('body');
              var pos = body.GetPosition();
              var ang = body.GetAngle() * 180 / Math.PI;
              var origPos = $entity.data('origPos')
        
              $entity.css('transform', 'translate3d(' + ~~(pos.x*SCALE - origPos.left  - origPos.width / 2) + 'px, ' + ~~(pos.y*SCALE - origPos.top - origPos.height / 2) + 'px, 0) rotate3d(0,0,1,' + ~~ang + 'deg)');
            }());}
        
          }).start();
        }());
    }(jQuery, Box2D));
    aisisDestroyed = true;
}