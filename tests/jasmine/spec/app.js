describe('Chart', function() {
	beforeEach(function() {
		var buf = d3.select('body');
		buf.append('chart')
			.append('series');
	})
	afterEach(function() {
		d3.select('chart')
			.remove();
	})
	it('Application works', function() {
		expect(start()).toBe(true);
	})
})

describe('Points', function() {
	describe('Get point data', function() {
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
		it('Get value from string', function() {
			expect(getPointData([d3.select('series')]))
			.toEqual([[[100, 300], [12, 100]]]);
		})
	})
})

describe('Domain', function() {
	describe('Get x domain', function() {
		it('Right domain', function() {
			expect(getDomain([[[100, 300], [12, 100]],[[10, -1], [-100, 2]]], 0)).
				toEqual([-100, 100]);
			expect(getDomain([[[3,1]], [[2,1], [3,1]]], 0)).not.
				toEqual([2, 4]);
			expect(getDomain([[[0, 0]]], 0)).
				toEqual([0, 0]);
		})
	})
	describe('Get y domain', function() {
		it('Right domain', function() {
			expect(getDomain([[[100, 300], [12, 100]],[[10, -1], [-100, 2]]], 1)).
				toEqual([-1, 300]);
			expect(getDomain([[[0, 0]]], 1)).
				toEqual([0, 0]);
		})
	})
})