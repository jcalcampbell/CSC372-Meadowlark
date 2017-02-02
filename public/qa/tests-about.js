/**
 * Created by jcampbell on 2/2/17.
 */

suite('"About" Page Tests', function(){
    test('page should contain link to contact page', function(){
        assert($('a[href="/contact"]').length);
    });
});
