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