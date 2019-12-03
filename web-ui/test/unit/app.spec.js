define(["require", "exports", "aurelia-bootstrapper", "aurelia-testing"], function (require, exports, aurelia_bootstrapper_1, aurelia_testing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Stage App Component', function () {
        var component;
        beforeEach(function () {
            component = aurelia_testing_1.StageComponent
                .withResources('app')
                .inView('<app></app>');
        });
        afterEach(function () { return component.dispose(); });
        it('should render message', function (done) {
            component.create(aurelia_bootstrapper_1.bootstrap).then(function () {
                var view = component.element;
                expect(view.textContent.trim()).toBe('Hello World!');
                done();
            }).catch(function (e) {
                fail(e);
                done();
            });
        });
    });
});
//# sourceMappingURL=app.spec.js.map