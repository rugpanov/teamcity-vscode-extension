import {assert} from "chai";

suite("Flacky test", () => {
    test("Hi! I am a flacky test with probability 0.50.", function () {
        assert.isTrue(Math.random() >= 0.50);
    });
});
