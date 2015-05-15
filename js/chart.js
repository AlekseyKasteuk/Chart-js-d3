function start() {
	d3.selectAll("chart")
			.append('svg')	
			.append('g')
			.attr('class', 'legend')
			.style('width', 100)
			.style('height', 100);
	d3.selectAll('chart')[0].forEach(function(val) {
			series(d3.select(val));
		});
	return true;
}

function series(element) {
	var width = element.style("width").slice(0, -2);
	var height = element.style("height").slice(0, -2);
	switch(element.attr('type')) {
		case null: 
		case 'numeric':
			var pointSet = [];
			var lineSet = [];
			var pointsColor = [];
			var linesColor = [];
			var wholePoints;
			var scales;
			var i = 0;
			var legend = element
					.select('.legend')
					.attr('transform', 'translate(' + (width - 110) + ', 0)')
			element.selectAll('series')[0].forEach(function(val) {
				var type = d3.select(val).attr('type');
				var color = d3.select(val).attr('color');
				var name = d3.select(val).attr('name');
				if(type == 'points' ||type == undefined) {
					if(d3.select(val).attr('data')){
						pointSet.push(d3.select(val));
						pointsColor.push(!color ? 'red' : color);
					}
				}
				if(type == 'line') {
					if(d3.select(val).attr('data')){
						lineSet.push(d3.select(val));
						linesColor.push(!color ? 'red' : color);
					}
				}
				var g = legend.append('g')
					.attr('transform', 'translate(0, ' + (i * 30 + 5 * i + 5) + ')')
				g.append('rect')
					.attr("width", 10)
					.attr("height", 10)
					.attr("fill", !color ? 'red' : color)
					.attr('x', 5)
					.attr('y', 5);
				g.append('text')
					.text(!name ? 'serie' : name)
					.attr('x',20)
					.attr('y', 15);
				i++;
			});
			wholePoints = (pointSet.concat(lineSet));
			if(wholePoints.length) {
				scales = createScales(element, wholePoints);
			}
			else {
				return;
			}
			if(pointSet.length) {
				points(element, pointSet, scales, pointsColor);
			}
			if(lineSet.length) {
				lines(element, lineSet, scales, linesColor)
			}
			break;
		case 'circle':
			break;
		case 'column':
			break;
		default:
			break;
	}
}

function getDomain(data, index) {
	var d = [];
	data.forEach(function(v) {
		v.forEach(function(v) { d.push(v[index]) })
	});
	return [d.reduce(function(prev, next) {
		return Math.min(prev, next);
	}),
	d.reduce(function(prev, next) {
		return Math.max(prev, next);
	})];
}

function getPointData(seriesSet) {
	var data = [];
	seriesSet.forEach(function(val) {
		data.push(
			val.attr('data')
			.match(/\[ *(-|\+)?(\d+|\d+\.\d+) +?(-|\+)?(\d+|\d+\.\d+) *\]/g)
			.map(function(val) {
				return JSON.parse(val.replace(/ +?/, ','));
			})
		)
	});
	return data;
}

function createScales(element, seriesSet) {
	var data = getPointData(seriesSet);
	var width = element.style("width").slice(0, -2);
	var height = element.style("height").slice(0, -2);
	var margins = {
		left: 40,
		right: 120,
		top: 20,
		bottom: 20
	}
	var xDomain = getDomain(data, 0);
	var yDomain = getDomain(data, 1);
	var xScale = d3.scale.linear()
				.range([margins.left,
					width - margins.right])
				.domain(xDomain);
	var yScale = d3.scale.linear()
				.range([height - margins.top,
					margins.bottom])
				.domain(yDomain);
	var xAxis = d3.svg.axis().scale(xScale);
	var yAxis = d3.svg.axis().scale(yScale)
				.orient('left');
	element.select('svg').append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + (height - margins.bottom) + ")")
        .call(xAxis);
    element.select('svg').append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(" + (margins.left) + ",0)")
        .call(yAxis);
    return {xScale: xScale, yScale: yScale};
}

function points(element, set, scales, colors) {
	var data = getPointData(set);
	var i = 0;
	data.forEach(function(v) {
		element.select('svg').append('g').selectAll('circle').data(v)
			.enter()
			.append('circle')
			.attr('cx', function(d) {
				d3.select(this).on("mouseenter", function() {
					var tmp = d3.select('#info');
					if(tmp[0][0]) {
						tmp.remove();
					}
					tmp = d3.select(this.parentNode.parentNode);
					d3.select(this.parentNode.parentNode)
							.data([d])
							.append('text')
							.attr('id', 'info')
							.attr('width', 100)
							.attr('height', 50)
							.attr('x', function(da) {
								var offset = 
									scales.xScale(da[0]) - 50 > 0
									? -50 : 0;
								offset = 
									scales.xScale(da[0]) + 50 < 
									tmp.style('width').slice(0, -2)
									? offset : -100;
								return scales.xScale(da[0]) + offset;
							})
							.attr('y', function(da) {
								var offset = 
									scales.yScale(da[1]) > 28 ? -28 : 10;
								return scales.yScale(da[1]) + offset;
							})
							.text('Serie: ' + 'points')
					d3.select(this.parentNode.parentNode)
							.data([d])
							.append('text')
							.attr('id', 'info')
							.attr('width', 100)
							.attr('height', 50)
							.attr('x', function(da) {
								var offset = 
									scales.xScale(da[0]) - 50 > 0
									? -50 : 0;
								offset = 
									scales.xScale(da[0]) + 50 < 
									tmp.style('width').slice(0, -2)
									? offset : -100;
								return scales.xScale(da[0]) + offset;
							})
							.attr('y', function(da) {
								var offset = 
									scales.yScale(da[1]) > 28 ? -10 : 28;
								return scales.yScale(da[1]) + offset;
							})
							.text(function(da) {
								var tmp = '';
								tmp = 'x:' + da[0] + ', y:' + da[1];
								return tmp;
							})
				})
				d3.select(this).on("mouseleave", function() {
					var a = d3.select('#info');
					if(a[0][0]) {
						a.remove();
					}
					a = d3.select('#info');
					if(a[0][0]) {
						a.remove();
					}
				})
				return scales.xScale(d[0]);
			})
			.attr('cy', function(d) { return scales.yScale(d[1]); })
			.attr('r', 3)
			.attr('fill', colors[i])
		i++;
	});
}

function lines(element, set, scales, colors) {
	var data = getPointData(set);
	var i = 0;
	data.forEach(function(v) {
		var line = d3.svg.line()
			.x(function(d) { return scales.xScale(d[0]); })
			.y(function(d) { return scales.yScale(d[1]); })
		line.interpolate("basis");
		element.select('svg').append('path')
						.attr('d', line(v))
						.attr('stroke', colors[i])
						.attr('stroke-width', 2)
						.attr('fill', 'none')
						.on('mouseenter', function() {
							console.log('enter', d3.mouse(this));
							console.log('x:', d3.mouse(this)[0]);
							console.log('y:', d3.mouse(this)[1]);
							console.log('scale', 
								[scales.xScale(d3.mouse(this)[0]),
								scales.xScale(d3.mouse(this)[1])]);
						})
						.on('mouseleave', function() {
							console.log('leave', d3.mouse(this));
						})
		i++;
	});
}

start();