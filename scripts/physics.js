let aisisDestroyed = false
let prettyHome = true;
chrome.storage.local.get({'settings_home': true}, function(result) {
    prettyHome = result.settings_home
})
let perfRes = 4;
// benchmarkPerformance((avgFrameTime) => {
//   if (avgFrameTime > 50) {
//     perfRes = 2
//   } else if (avgFrameTime > 20) {
//     perfRes = 3
//   } else if (avgFrameTime > 10) {
//     perfRes = 4
//   } else {
//     perfRes = destructableTables.length-1
//   }
//   console.log(`Benchmark Results | frametime:${avgFrameTime} Result:${perfRes}`)
// });
let destructableTables = [11,2,3,5,10,12]
let spansOnlyTables = new Set([12])
export function destroyAISIS() {
    if (prettyHome) return alert("🤔 hmm... nothing happened.");
    let sitemap = document.getElementsByTagName('table')[11]
    let parsedTable = parseTable(sitemap)
    if (!parsedTable || parsedTable[0][0][0] !== 'Site Map') return alert("🤔 hmm... nothing happened.");
    if (aisisDestroyed) return;
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'None'
    document.body.style['-webkit-user-select'] = 'None'

    for (let img of document.querySelectorAll('img, a')) {
        img.setAttribute('draggable', false);
    }
    for (let [index, tableI] of destructableTables.entries()) {
      if (index > perfRes) {
        break;
      }
      let toPhys = 'td:not(:has(td))' 
      if (spansOnlyTables.has(tableI)) toPhys = 'span'
      for (let obj of document.querySelectorAll('table')[tableI].querySelectorAll(toPhys)) {
          if (toPhys == 'td:not(:has(td))') {
              let bg = window.getComputedStyle(obj).getPropertyValue('background');
              if (!bg.includes('url') && obj.querySelector('a') && false) {
                  // console.log('found clear td')
                  let divCont = document.createElement('div')
                  obj.parentElement.appendChild(divCont)
                  divCont.appendChild(obj.querySelector('a'))
                  divCont.style.width = 'max-content'
                  divCont.classList.add('phys')
              } else {
                  obj.classList.add('phys')
              }
              continue
          }
          let divCont = document.createElement('div')
          obj.parentElement.appendChild(divCont)
          divCont.appendChild(obj)
          divCont.style.width = 'max-content'
          divCont.classList.add('phys')
      }
    }
    for (let obj of document.querySelectorAll('.text04')[7].querySelectorAll('span')) {
        let divCont = document.createElement('div')
        obj.parentElement.appendChild(divCont)
        divCont.appendChild(obj)
        divCont.style.width = 'max-content'
        divCont.classList.add('phys')
    }
    
    let boundaries = []
    let boundaryClasses = ['ground','wall1','wall2','ceil']
    for (let i=0;i<4;i++) {
        boundaries.push(document.createElement('div'))
        boundaries[i].classList.add('phys-static')
        boundaries[i].classList.add(`phys-${boundaryClasses[i]}`)
    }
    for (let el of boundaries) {
        document.body.appendChild(el);
    }

    (function () {

        // Flatten Box2d (ugly but handy!)
        (function b2(o) {
          for (let k in o) {
            if (o.hasOwnProperty(k)) {
              if ($.isPlainObject(o[k])) {
                b2(o[k]);
              } else if (/^b2/.test(k)) {
                window[k] = o[k];
              }
            }
          }
        }(Box2D));
        
        let world = new b2World(
          new b2Vec2(0, 9.81), // gravity
          true                 // allow sleep
        );
        let SCALE = 30;
        
        //
        // Ground
        //
        
        $('.phys-static').each(function (i, el) {
            let objStatic = $(el);
          // Fixture
          let fixDef = new b2FixtureDef;
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
          let bodyDef = new b2BodyDef;
          bodyDef.type = b2Body.b2_staticBody;
          // console.log(objStatic.offset().left, objStatic.offset().top)
          bodyDef.position.x = (objStatic.offset().left + objStatic.outerWidth() / 2) / SCALE;
          bodyDef.position.y = (objStatic.offset().top + objStatic.outerHeight() / 2) / SCALE;
          let body = world.CreateBody(bodyDef);
          body.CreateFixture(fixDef);
          objStatic.data('body', body);
        });
        
        //
        // Crates
        //
        
        $('.phys').each(function (i, el) {
          let phyObj = $(el);
        
          // Fixture
          let fixDef = new b2FixtureDef;
          fixDef.density = 1;
        //   fixDef.density = phyObj.outerWidth()*phyObj.outerHeight()/20000;
        //   // console.log(`set density to ${phyObj.outerWidth()*phyObj.outerHeight()/30000}`)
          fixDef.friction = 0.5;
          fixDef.restitution = 0.2;
        
          // Shape
          fixDef.shape = new b2PolygonShape;
          fixDef.shape.SetAsBox(
            phyObj.outerWidth() / 2 / SCALE, //half width
            phyObj.outerHeight() / 2 / SCALE  //half height
          );
        
          // Body
          let bodyDef = new b2BodyDef;
          bodyDef.type = b2Body.b2_dynamicBody;
          bodyDef.position.x = (phyObj.offset().left + phyObj.outerWidth() / 2) / SCALE;
          bodyDef.position.y = (phyObj.offset().top + phyObj.outerHeight() / 2) / SCALE;
        
          let body = world.CreateBody(bodyDef);
          body.CreateFixture(fixDef);
          body.SetAngularVelocity(getRandomFloat());

          phyObj.data('body', body);
        });

        let mouse = new b2Vec2();
        $(window).mousemove(function (e) {
          mouse.Set(e.pageX / SCALE, e.pageY / SCALE);
        });
        window.mouse = mouse;
        
        (function (mouse) {
          let mouseJointDef = new b2MouseJointDef();
          mouseJointDef.target = mouse;
          mouseJointDef.bodyA = world.GetGroundBody();
          mouseJointDef.collideConnected = true;
        
          let mouseJoint;
          $('*').on({
            mousedown: function (e) {
              let body = $(this).data('body');
        
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
          let dt = 30;
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
          let $entities = $('.phys, .phys-static');
          // cache some initial coordinates informations
          $entities.each(function (i, el) {
            let $el = $(el);
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
            let dt = t - t0;
            if (dt <= 0) {
              return;
            }
        
            let i = $entities.length
            while (i--) {(function () {
              let entity = $entities[i];
              let $entity = $(entity);
        
              let body = $entity.data('body');
              let pos = body.GetPosition();
              let ang = body.GetAngle() * 180 / Math.PI;
              let origPos = $entity.data('origPos')
        
              $entity.css('transform', 'translate3d(' + ~~(pos.x*SCALE - origPos.left  - origPos.width / 2) + 'px, ' + ~~(pos.y*SCALE - origPos.top - origPos.height / 2) + 'px, 0) rotate3d(0,0,1,' + ~~ang + 'deg)');
            }());}
        
          }).start();
        }());
    }(jQuery, Box2D));
    aisisDestroyed = true;
}