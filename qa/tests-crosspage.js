/**
 * Created by jcampbell on 2/6/17.
 */

const Browser = require('zombie');

Browser.site = 'http://localhost:3000';
describe('Visit site home page ('+Browser.site+') to make sure Zombie is ok',
    function(){
        const browser = new Browser();

        before(function(done){
            browser.visit('/', done);
        });

        it('should be successful', function(){
            browser.assert.success();
        });

        it('should say "Meadowlark" somewhere', function(){
            browser.assert.text('*', /Meadowlark/);
        });
});

describe('Group rate tour referrer tests', function(){
   const tourPages = ['hood-river', 'oregon-coast'];
   for(var i in tourPages){
       var referrer = '/tours/' + tourPages[i];
       context('From the ' + tourPages[i] + ' tour:', function(){
           const browser = new Browser();
           before(function(){
               return browser.visit(referrer);
           });
           it('should load the tour page', function(){
               browser.assert.success();
           });

           describe('after clicking the link with class=requestGroupRate', function(){
               before(function(){
                   return browser.click('.requestGroupRate');
               });
               specify('the request page should load', function(){
                   browser.assert.success();
               });
               specify('the hidden form field "referred" should have the value: ' +
                   (Browser.site+referrer), function(){
                   browser.assert.input('input[name=referrer]', (Browser.site+referrer));
               });
           });
       });
   }
   describe('If request page visited directly, referrer should be empty', function(){
       const browser = new Browser();
       before(function(){
           return browser.visit('/tours/request-group-rate');
       });
       it('should load', function(){
           browser.assert.success();
       });
       it('should have an empty "referrer" field', function(){
           browser.assert.input('input[name=referrer]', '');
       });
    });
});