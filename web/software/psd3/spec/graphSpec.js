describe("Graph Test Suite", function() {
    it("costructor works", function() {
        expect(new psd3.Graph({})).not.toBe(null);
    });

    it("defaults are set", function() {
        var graph = new psd3.Graph({});
        expect(graph.config.width).toBe(400);
        expect(graph.config.height).toBe(400);
        expect(graph.config.value).toBe("value");
        expect(graph.config.inner).toBe("inner");
        expect(graph.config.transition).toBe("linear");
        expect(graph.config.transitionDuration).toBe(1000);
        expect(graph.config.donutRadius).toBe(0);
        expect(graph.config.gradient).toBe(false);
        expect(graph.config.labelColor).toBe("black");
        expect(graph.config.drilldownTransition).toBe("linear");
        expect(graph.config.drilldownTransitionDuration).toBe(0);
        expect(graph.config.stroke).toBe("white");
        expect(graph.config.strokeWidth).toBe(2);
        expect(graph.config.highlightColor).toBe("orange");
    });

    it("overrides default width", function() {
        var config = {
            width: 500,
            height: 500,
            value: "myValue",
            inner: "myInner",
            transition: "bounce",
            transitionDuration: 2000,
            donutRadius: 10,
            gradient: true,
            labelColor: "white",
            drilldownTransition: "bounce",
            drilldownTransitionDuration: 10,
            stroke: "red",
            strokeWidth: 5,
            highlightColor: "green"
        };
        var graph = new psd3.Graph(config);
        expect(graph.config.width).toBe(500);
        expect(graph.config.height).toBe(500);
        expect(graph.config.value).toBe("myValue");
        expect(graph.config.inner).toBe("myInner");
        expect(graph.config.transition).toBe("bounce");
        expect(graph.config.transitionDuration).toBe(2000);
        expect(graph.config.donutRadius).toBe(10);
        expect(graph.config.gradient).toBe(true);
        expect(graph.config.labelColor).toBe("white");
        expect(graph.config.drilldownTransition).toBe("bounce");
        expect(graph.config.drilldownTransitionDuration).toBe(10);
        expect(graph.config.stroke).toBe("red");
        expect(graph.config.strokeWidth).toBe(5);
        expect(graph.config.highlightColor).toBe("green");
    })
});
