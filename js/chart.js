function start() {
	d3.selectAll("chart")
		.append('svg')
		.append('g')
		.attr('class', 'legend');
	d3.selectAll('chart').append('div').attr('class', 'tip')
		.html("<div class='s'></div><div class='p'></div>")
	d3.selectAll('chart')[0].forEach(function(val) {
		series(d3.select(val));
	});
	return true;
}

function series(element) {
	var width = element.style("width").slice(0, -2);
	var height = element.style("height").slice(0, -2);
	switch (element.attr('type')) {
		case null:
		case 'numeric':
			var pointSet = [];
			var lineSet = [];
			var splineSet = [];
			var pointsColor = [];
			var linesColor = [];
			var splineColor = [];
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
				if (type == 'points' || type == undefined) {
					if (d3.select(val).attr('data')) {
						pointSet.push(d3.select(val));
						pointsColor.push(!color ? 'red' : color);
					}
				}
				if (type == 'line') {
					if (d3.select(val).attr('data')) {
						lineSet.push(d3.select(val));
						linesColor.push(!color ? 'red' : color);
					}
				}
				if (type == 'spline') {
					if (d3.select(val).attr('data')) {
						splineSet.push(d3.select(val));
						splineColor.push(!color ? 'red' : color);
					}
				}
				var g = legend.append('g')
					.attr('transform', 'translate(0, ' + (i * 20 + 5 * i + 5) + ')')
				g.append('rect')
					.attr("width", 10)
					.attr("height", 10)
					.attr("fill", !color ? 'red' : color)
					.attr('x', 5)
					.attr('y', 5);
				g.append('text')
					.text(!name ? 'serie' : name)
					.attr('x', 20)
					.attr('y', 15);
				i++;
			});
			wholePoints = pointSet.concat(lineSet).concat(splineSet);
			if (wholePoints.length) {
				scales = createScales(element, wholePoints);
			} else {
				return;
			}
			if (pointSet.length) {
				points(element, pointSet, scales, pointsColor);
			}
			if (lineSet.length) {
				lines(element, lineSet, scales, linesColor)
			}
			if (splineSet.length) {
				lines(element, splineSet, scales, splineColor, true)
			}
			break;
		case 'pie':
			var pieData = [];
			var pieColors = [];
			var legend = element
				.select('.legend')
				.attr('transform', 'translate(' + (width - 110) + ', 0)');
			var i = 0;
			element.selectAll('series')[0].forEach(function(val) {
				var color = d3.select(val).attr('color');
				var name = d3.select(val).attr('name');
				var data = d3.select(val).attr('data').match(/\d+(\.\d+)?/g)[0];
				if(!color) { color = 'red' }
				if(!name) { name = 'pie pice' }
				if(!data) { data = 0 }
				pieColors.push(color);
				pieData.push({data: data, name: name});
				var g = legend.append('g')
					.attr('transform', 'translate(0, ' + (i * 20 + 5 * i + 5) + ')')
					g.append('rect')
						.attr("width", 10)
						.attr("height", 10)
						.attr("fill", !color ? 'red' : color)
						.attr('x', 5)
						.attr('y', 5);
					g.append('text')
						.text(!name ? 'serie' : name)
						.attr('x', 20)
						.attr('y', 15);
				i++;
			});
			pie(element, pieData, pieColors);
			break;
		case 'bar':
			var bars = [];
			var wholeData = [];
			var wholeNames = [];
			var i = 0, count = 1;
			var legend = element
				.select('.legend')
				.attr('transform', 'translate(' + (width - 110) + ', 0)');
			element.selectAll('series')[0].forEach(function(val) {
				var color = d3.select(val).attr('color');
				var name = d3.select(val).attr('name');
				var data = d3.select(val).attr('data')
					.match(/\d+(\.\d+)?/g);
				if(!color) { color = 'red' }
				if(!name) { name = 'bar' }
				wholeData = wholeData.concat(data);
				data.forEach(function(val) {
					wholeNames.push(name);
					bars.push({color: color, name: name, data: val})
				});
				var g = legend.append('g')
					.attr('transform', 'translate(0, ' + (i * 20 + 5 * i + 5) + ')')
					g.append('rect')
						.attr("width", 10)
						.attr("height", 10)
						.attr("fill", !color ? 'red' : color)
						.attr('x', 5)
						.attr('y', 5);
					g.append('text')
						.text(!name ? 'serie' : name)
						.attr('x', 20)
						.attr('y', 15);
				i++;
			});
			wholeData = wholeData.map(function(v) { return v - 0 });
			bar(element,
			createBarsScale(element, wholeData, wholeNames,
				[0, wholeData.reduce(function(prev, next){
					return Math.max(prev, next)
				})]),
			bars);
			break;
		default:
			break;
	}
}

function getDomain(data, index) {
	var d = [];
	data.forEach(function(v) {
		v.forEach(function(v) {
			d.push(v[index])
		})
	});
	return [d.reduce(function(prev, next) {
			return Math.min(prev, next);
		}),
		d.reduce(function(prev, next) {
			return Math.max(prev, next);
		})
	];
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
			width - margins.right
		])
		.domain(xDomain);
	var yScale = d3.scale.linear()
		.range([height - margins.top,
			margins.bottom
		])
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
	return {
		xScale: xScale,
		yScale: yScale
	};
}

function points(element, set, scales, colors) {
	var data = getPointData(set);
	var i = 0;
	data.forEach(function(v) {
		element.select('svg').append('g')
			.selectAll('circle').data(v)
			.enter()
			.append('circle')
			.attr('cx', function(d) {
				d3.select(this).on("mouseenter", function() {
					element.select('.tip').attr('class', 'tip vis')
						.style('top', (scales.yScale(d[1])) + 'px')
						.style('left', scales.xScale(d[0]) + 'px');
					element.select('.tip').select('.s').text('Serie: point');
					element.select('.tip').select('.p').text('X: ' + d[0] + ', Y:' + d[1]);
				})
				d3.select(this).on("mouseleave", function() {
					element.select('.tip').attr('class', 'tip');
				})
				return scales.xScale(d[0]);
			})
			.attr('cy', function(d) {
				return scales.yScale(d[1]);
			})
			.attr('r', 3)
			.attr('fill', colors[i])
		i++;
	});
}

function lines(element, set, scales, colors, spline) {
	var data = getPointData(set);
	var i = 0;
	data.forEach(function(v) {
		var line = d3.svg.line()
			.x(function(d) {
				return scales.xScale(d[0]);
			})
			.y(function(d) {
				return scales.yScale(d[1]);
			})
		if (spline) {
			line.interpolate("basis");
		}
		element.select('svg').append('path')
			.attr('d', line(v))
			.attr('stroke', colors[i])
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.on("mouseenter", function() {
				var d = d3.mouse(this);
				element.select('.tip').attr('class', 'tip vis')
					.style('top', d[1] + 'px')
				   	.style('left', d[0] + 'px');
				element.select('.tip').select('.s').text('Serie: line');
				element.select('.tip')
					.select('.p')
					.text('X: ' + (Math.round(scales.xScale.invert(d[0]) * 1000) / 1000) +
						', Y:' + (Math.round(scales.yScale.invert(d[1]) * 1000) / 1000));
			})
			.on("mouseleave", function() {
				element.select('.tip').attr('class', 'tip');
			})
		i++;
	});
}

function pie(element, data, colors) {
	var width = element.style("width").slice(0, -2) - 120;
	var height = element.style("height").slice(0, -2);
	var radius = Math.min(width, height) / 2;
	var color = d3.scale.ordinal().range(colors);
	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);
	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.data; })
	var svg = element.select('svg')
		.data([data])
		.append('g')
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	var arcs = svg.selectAll("g.slice")
        .data(pie)
        .enter()                            
        .append("svg:g")                
            .attr("class", "slice")
            .on('mouseenter', function() {
            	d3.select(this.parentNode).selectAll('.slice').attr('opacity', '0.1');
            	d3.select(this).attr('opacity', 1);
            })
            .on('mouseleave', function() {
            	d3.select(this.parentNode).selectAll('.slice').attr('opacity', null);
            })
		arcs.append("svg:path")
            .attr("fill", function(d, i) { return color(i); } ) 
            .attr("d", arc);
        arcs.append("svg:text")                                     
            .attr("transform", function(d) {
            d.innerRadius = 0;
            d.outerRadius = radius;
            return "translate(" + arc.centroid(d) + ")";        
        })
        .attr("text-anchor", "middle")                          
        .text(function(d, i) { return data[i].data; });  
}

function createBarsScale(element, data, names, yDomain) {
	var width = element.style("width").slice(0, -2);
	var height = element.style("height").slice(0, -2);
	var margins = {
		left: 40,
		right: 120,
		top: 20,
		bottom: 20
	}
	var xScale = d3.scale.ordinal()
		.rangeRoundBands([margins.left,
			width - margins.right
		], .1)
		.domain(names.map(function(d) { return d; }));
	var yScale = d3.scale.linear()
		.range([height - margins.top,
			margins.bottom
		])
		.domain(yDomain);

	var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left");
	element.select('svg').append("g")
		.attr("class", "axis x")
		.attr("transform", "translate(0," + (height - margins.bottom) + ")")
		.call(xAxis);
	element.select('svg').append("g")
		.attr("class", "axis y")
		.attr("transform", "translate(" + (margins.left) + ",0)")
		.call(yAxis);
	return {x: xScale, y:yScale};
}

function bar(element, scales, data) {
	var height = element.style("height").slice(0, -2);
	var svg = element.select('svg').append("g")
		.attr("class", "bars")
	svg.selectAll(".bar")
      .data(data)
    	.enter().append("rect")
    	.attr("class", "bar")
      .style("fill", function(d) {return d.color; })
      .attr("x", function(d) { return scales.x(d.name); })
      .attr("width", function() {  return scales.x.rangeBand() })
      .attr("y", function(d) { return scales.y(d.data); })
      .attr("height", function(d) { return height - scales.y(d.data) - 20; })
      .on('mouseenter', function() {
       	d3.select(this.parentNode).selectAll('rect').attr('opacity', '0.1');
        d3.select(this).attr('opacity', 1);
       })
       .on('mouseleave', function() {
        d3.select(this.parentNode).selectAll('rect').attr('opacity', null);
       })
    svg.selectAll("text")
      .data(data)
    	.enter().append("text")
      .attr("x", function(d) { return scales.x(d.name) + 5; })
      .attr("y", function(d) { return scales.y(d.data) + 18; })
      .attr("font-family", "sans-serif")
	  .attr("font-size", '14')
	  .text(function(d) { return d.data })
}

start();