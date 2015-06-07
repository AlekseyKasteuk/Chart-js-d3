describe('Chart', function () {
	describe('Domain', function() {
		it('X domain', function() {
			expect(getDomain([[[100, 300], [12, 100]],[[10, -1], [-100, 2]]], 0)).
				to.be.deep.equal([-100, 100]);
			expect(getDomain([[[3,1]], [[2,1], [3,1]]], 0)).not.
				to.be.deep.equal([2, 4]);
			expect(getDomain([[[0, 0]]], 0)).
				to.be.deep.equal([0, 0]);
		})
		it('Y domain', function() {
			expect(getDomain([[[100, 300], [12, 100]],[[10, -1], [-100, 2]]], 1)).
				to.be.deep.equal([-1, 300]);
			expect(getDomain([[[0, 0]]], 1)).
				to.be.deep.equal([0, 0]);
		})
	})
	describe('Scales', function () {
		describe('Numeric scale', function () {
			beforeEach(function() {
				var body =d3.select("body")
					.append("chart");
				body.append("series")
					.attr("type", "line")
					.attr("data", "[50 0]");
				body.append("series")
					.attr("type", "points")
					.attr("data", "[100 0][12 100]");
			})
			afterEach(function() {
				d3.selectAll("chart").remove();
			})
			it('Should return object with scales', function () {
				var pointsSpy = sinon.spy();
					lineSpy = sinon.spy();
				points = pointsSpy;
				lines = lineSpy;
				start();
				expect(pointsSpy).to.have.been.calledOnce;
				expect(lineSpy).to.have.been.calledOnce;
				expect(pointsSpy.args[0][2]).to.be.deep.equal(lineSpy.args[0][2]);
				expect(typeof pointsSpy.args[0][2].xScale).to.be.deep.equal('function');
				expect(typeof pointsSpy.args[0][2].yScale).to.be.deep.equal('function');
			})
			it('Should being called once', function () {
				var createNumericSpy = sinon.spy(),
					pointsSpy = sinon.spy();
					lineSpy = sinon.spy();
				createNumericScales = createNumericSpy;
				points = pointsSpy;
				lines = lineSpy;
				start();
				expect(createNumericSpy).to.have.been.calledOnce;
			})
		})
		describe('Bar scale', function () {
			var firstBarReleaze = bar,
				firstCreateBarScale = createBarsScale;
			afterEach(function() {
				d3.selectAll("chart").remove();
				bar = firstBarReleaze;
				createBarsScale = firstCreateBarScale;
			})
			it('Should create scale for bar-chart', function () {
				var spy = sinon.spy(),
					spyBar = sinon.spy();
				bar = spyBar;
				d3.select("body").append("chart").attr("type", "bar").append("series");
				createBarsScale = spy;
				start();
				expect(spy).to.have.been.calledOnce;
			})
			it('Should react for every bar-chart on page', function () {
				var spy = sinon.spy(),
					spyBar = sinon.spy();
				bar = spyBar;
				d3.select("body").append("chart").attr("type", "bar").append("series");
				d3.select("body").append("chart").attr("type", "bar").append("series");
				createBarsScale = spy;
				start();
				expect(spy).to.have.been.calledTwice;
			})
			it('Should take domain from 0 to maximal value', function () {
				var spy = sinon.spy(),
					spyBar = sinon.spy();
				bar = spyBar;
				d3.select("body").append("chart").attr("type", "bar").append("series")
					.attr("data", "10")
				d3.select("body").append("chart").attr("type", "bar").append("series");
				createBarsScale = spy;
				start();
				expect(spy.args[0][3]).to.be.deep.equal([0, 10]);
				expect(spy.args[1][3]).to.be.deep.equal([0, 0]);
			})
			it('Should take domain from 0 to maximal value of whole series in bar-chart', function () {
				var spy = sinon.spy(),
					spyBar = sinon.spy();
				bar = spyBar;
				var chart = d3.select("body").append("chart").attr("type", "bar");
				chart.append("series").attr("data", "10");
				chart.append("series").attr("data", "100");
				createBarsScale = spy;
				start();
				expect(spy.args[0][3]).to.be.deep.equal([0, 100]);
			})
			it('Should return x- and y-scales', function () {
				var spyBar = sinon.spy();
				bar = spyBar;
				var chart = d3.select("body").append("chart").attr("type", "bar");
				chart.append("series").attr("data", "10").attr("name", "test");
				start();
				expect(spyBar.args[0][1].y(0)).to.be.equal(480);
				expect(spyBar.args[0][1].y(10)).to.be.equal(20);
			})
		})
	})
	describe('Nuneric type', function () {
		describe('Point data', function () {
			beforeEach(function() {
				d3.select('body')
					.append('chart')
					.append('series')
					.attr('data', '[100 300][12 100]');
			})
			afterEach(function() {
				d3.select('chart')
					.remove();
			})
			it('Should get point data', function() {
				expect(getPointData([d3.select('series')]))
				.to.be.deep.equal
				([[[100, 300], [12, 100]]]);
			})
			it('Can take only valid parametrs', function () {
				d3.select("series").attr("data", "asd[12 0]1[1 2]");
				expect(getPointData([d3.select('series')]))
				.to.be.deep.equal
				([[[12, 0], [1, 2]]]);
			})
		})
		describe('Point type', function () {
			beforeEach(function() {
				var body =d3.select("body")
					.append("chart");
				body.append("series")
					.attr("data", "[100 0][12 100]");
				body.append("series")
					.attr("type", "points")
					.attr("color", "green")
					.attr("data", "[100 0][12 100]");
			})
			afterEach(function() {
				d3.select("chart").remove();
			})
			it('Should call function to render points', function () {
				var spy = sinon.spy();
				points = spy;
				start();
				expect(spy).to.have.been.calledOnce;
				expect(getPointData(spy.args[0][1])).to.be.deep.equal([[[100, 0],[12, 100]], [[100, 0], [12, 100]]]);
				expect(spy.args[0][3]).to.be.deep.equal(["red", "green"]);
			})
			it("Should'n call function if there is no data in set", function () {
				d3.select("chart").remove();
				var body =d3.select("body")
					.append("chart")
					.append("series")
					.attr("data", "");
				var spy = sinon.spy();
				points = spy;
				start();
				expect(spy).not.to.have.been.called;
			})
		})
		describe('Line type', function () {
			beforeEach(function() {
				var body =d3.select("body")
					.append("chart");
				body.append("series")
					.attr("type", "line")
					.attr("data", "[100 0][12 100]");
			})
			afterEach(function() {
				d3.select("chart").remove();
			})
			it('Should call function to render lines', function () {
				var spyPoints = sinon.spy(),
					spyLines = sinon.spy()
				points = spyPoints;
				lines = spyLines;
				start();
				expect(spyPoints).not.to.have.been.called;
				expect(spyLines).to.have.been.calledOnce;
				expect(getPointData(spyLines.args[0][1])).to.be.deep.equal([[[100, 0],[12, 100]]]);
				expect(!!spyLines.args[0][4]).to.be.equal(false);
			})
			it("Should'n call function if there is no data in set", function () {
				d3.select("chart").remove();
				var body =d3.select("body")
					.append("chart")
					.append("series")
					.attr("type", "line")
					.attr("data", "");
				var spy = sinon.spy();
				lines = spy;
				start();
				expect(spy).not.to.have.been.called;
			})
		})
		describe('Spline type', function () {
			beforeEach(function() {
				var body =d3.select("body")
					.append("chart");
				body.append("series")
					.attr("type", "line")
					.attr("data", "[100 0][12 100]");
				body.append("series")
					.attr("type", "spline")
					.attr("data", "[100 0][12 100]");
			})
			afterEach(function() {
				d3.select("chart").remove();
			})
			it('Should call function to render splines', function () {
				var spyLines = sinon.spy();
				lines = spyLines;
				start();
				expect(spyLines).to.have.been.calledTwice;
				expect(getPointData(spyLines.args[0][1])).to.be.deep.equal([[[100, 0],[12, 100]]]);
				expect(!!spyLines.args[0][4]).to.be.equal(false);
				expect(getPointData(spyLines.args[1][1])).to.be.deep.equal([[[100, 0],[12, 100]]]);
				expect(!!spyLines.args[1][4]).to.be.equal(true);
			})
			it("Should'n call function if there is no data in set", function () {
				d3.select("chart").remove();
				var body =d3.select("body")
					.append("chart")
					.append("series")
					.attr("type", "line")
					.attr("data", "");
				var spy = sinon.spy();
				lines = spy;
				start();
				expect(spy).not.to.have.been.called;
			})
		})
	})
	describe('Bar type', function () {
		var barReleaze = bar;
		afterEach(function() {
			d3.selectAll("chart").remove();
			bar = barReleaze;
		})
		it('Should call function to render bar-chart', function () {
			d3.select('body').append("chart").attr("type", "bar").append("series");
			var spyBar = sinon.spy();
			bar = spyBar;
			start();
			expect(spyBar).to.have.been.calledOnce;
		})
		it('Should draw 3 bars', function () {
			var chart = d3.select('body').append("chart").attr("type", "bar");
			chart.append("series").attr("data", "12");
			chart.append("series").attr("data", "1");
			chart.append("series").attr("data", "20");
			start();
			expect(d3.selectAll(".bar")[0].length).to.be.
				equal(3);
		})
	})
	describe('Pie type', function () {
		var pieReleaze = pie;
		afterEach(function() {
			d3.selectAll("chart").remove();
			pie = pieReleaze;
		})
		it('Should call function to render pie-chart', function () {
			d3.select('body').append("chart").attr("type", "pie").append("series");
			var spyPie = sinon.spy();
			pie = spyPie;
			start();
			expect(spyPie).to.have.been.calledOnce;
		})
		it('Should draw 3 pie peaces', function () {
			var chart = d3.select('body').append("chart").attr("type", "pie");
			chart.append("series").attr("data", "12");
			chart.append("series").attr("data", "1");
			chart.append("series").attr("data", "20");
			start();
			expect(d3.selectAll(".slice")[0].length).to.be.
				equal(3);
		})
	})
	describe('3D', function () {
		var d = Donut3D.draw;
		beforeEach(function() {
			var pie = d3.select('body').append("chart").attr("type", "3d-pie").attr("class", "pie");
			pie.append("series").attr("data", "1");
			pie.append("series").attr("data", "1");
			pie.append("series").attr("data", "1");
			var pie = d3.select('body').append("chart").attr("type", "3d-pie").attr("class", "circle");
			pie.append("series").attr("data", "1");
			pie.append("series").attr("data", "1");
			pie.append("series").attr("data", "1");
			pie.append("series").attr("data", "1");
		})
		afterEach(function() {
			Donut3D.draw = d;
			d3.selectAll("chart").remove();
		})
		it('Should call function to render 3D-pie and 3D-circle', function () {
			var spy = sinon.spy();
			Donut3D.draw = spy;
			start();
			expect(spy).to.have.been.calledTwice;
		})
		it('Should render 3 pieces of 3D-pie', function () {
			start();
			expect(d3.select(".pie").select("svg").select('.slices').selectAll(".topSlice")[0].length)
				.to.be.equal(3);
		})
		it('Should render 4 pieces of 3D-circle', function () {
			start();
			expect(d3.select(".circle").select("svg").select('.slices').selectAll(".topSlice")[0].length)
				.to.be.equal(4);
		})
	})
})