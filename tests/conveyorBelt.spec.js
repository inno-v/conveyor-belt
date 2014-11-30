var expect = require("chai").expect
var debug = require("debug")("conveyorBeltTests")

describe("ConveyorBelt", function() {
    var conveyorBelt = null
    var instance = null

    describe("with wrong config", function() {

        beforeEach(function() {
            conveyorBelt = require("../dist/conveyorBelt")
        })

        it("throws if current environment is not passed", function() {
            expect(function() {
                conveyorBelt({foo: {bar: ["baz"]}})
            }).to.throw()

            expect(function() {
                conveyorBelt({foo: {bar: ["baz"]}}, "foo")
            }).not.to.throw()
        })

        it("throws if property of assets config is not an array", function() {
            expect(function() {
                conveyorBelt({foo: {config: "baz"}}, "foo")
            }).to.throw()

            expect(function() {
                conveyorBelt({foo: {config: ["baz"]}}, "foo")
            }).not.to.throw()
        })

        it("throws if current env doesn't have defined assets", function() {
            expect(function() {
                conveyorBelt({production: {foo: ["bar"]}}, "foobar")
            }).to.throw()

            expect(function() {
                conveyorBelt({production: {foo: ["bar"]}}, "production")
            }).not.to.throw()
        })
    })

    describe("with correct config", function() {

        var config = {
            development: {
                scripts: [
                    "tests/mocks/**/*.dep.js",
                    "!tests/mocks/js1.dep.js",
                    "tests/mocks/js2.dep.js"
                ],
                styles: [
                    "tests/mocks/*.dep.css"
                ],
                foobar: [
                    "tests/mocks/js1*"
                ]
            },
            production: {
                scripts: [
                    "tests/mocks/app.min.js"
                ],
                styles: [
                    "tests/mocks/app.min.css"
                ]
            }
        }

        beforeEach(function() {
            conveyorBelt = require("../dist/conveyorBelt")
            instance = conveyorBelt(config, "development")
        })

        it("instantiates with supplied params", function() {
            expect(instance).to.exist()
            expect(instance).to.have.property("assets")
        })

        it("has properties taken from assets config", function() {
            expect(instance.assets).to.include.keys("scripts", "styles", "foobar")
        })

        it("resolves patterns to file paths", function() {
            expect(instance.assets.scripts).to.have.length(3)
            expect(instance.assets.scripts).to.include.members([
                "tests/mocks/dir/js-in-a-sub-dir.dep.js",
                "tests/mocks/js2.dep.js",
                "tests/mocks/jsfoobar.dep.js"
            ])
        })

        it("switches environment and reloads assets", function() {
            instance.changeEnv("production")
            expect(instance.env).to.equal("production")
            expect(instance.assets.scripts).to.include("tests/mocks/app.min.js")
        })

        it("works as middleware", function(done) {
            var req = {}
            var res = {locals: {}}
            var next = function() {
                expect(res.locals.assets).not.to.be.undefined()
                expect(res.locals.assets).to.include.keys("scripts", "styles", "foobar")
                done()
            }
            instance.middleware(req, res, next)
        })
    })
})
